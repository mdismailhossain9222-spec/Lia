import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRouter } from '../../router'

/* ------------------------------------------------------------------ */
/*  GLSL — Ashima 3D simplex noise                                     */
/* ------------------------------------------------------------------ */
const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

/* ------------------------------------------------------------------ */
/*  Ember particle field shaders                                       */
/* ------------------------------------------------------------------ */
const EMBER_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uHeight;
attribute float aScale;
attribute float aSpeed;
attribute float aOffset;
varying float vFlicker;
varying float vSeed;
void main() {
  vec3 pos = position;
  pos.y = mod(pos.y + uTime * aSpeed + uHeight * 0.5, uHeight) - uHeight * 0.5;
  pos.x += sin(uTime * 0.4 + aOffset * 6.2831 + pos.y * 0.35) * 0.4;
  pos.z += cos(uTime * 0.3 + aOffset * 6.2831) * 0.25;
  vFlicker = 0.65 + 0.35 * sin(uTime * (2.0 + aOffset * 4.0) + aOffset * 40.0);
  vSeed = aOffset;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aScale * uPixelRatio * (26.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const EMBER_FRAG = /* glsl */ `
varying float vFlicker;
varying float vSeed;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float alpha = smoothstep(0.5, 0.04, d) * vFlicker;
  vec3 ember = vec3(0.95, 0.38, 0.09);
  vec3 gold  = vec3(1.0, 0.78, 0.42);
  vec3 col = mix(ember, gold, vSeed) * (0.55 + vFlicker * 0.75);
  gl_FragColor = vec4(col, alpha * 0.8);
}
`

/* ------------------------------------------------------------------ */
/*  Fire orb shaders                                                   */
/* ------------------------------------------------------------------ */
const ORB_VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying float vN;
varying vec3 vNorm;
varying vec3 vView;
${SNOISE}
void main() {
  float t = uTime * 0.45;
  float n = snoise(position * 1.15 + vec3(0.0, -t, t * 0.3));
  n += 0.4 * snoise(position * 3.1 + vec3(t * 0.7, 0.0, -t * 0.4));
  vN = n;
  vec3 p = position + normal * n * uAmp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNorm = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

const ORB_FRAG = /* glsl */ `
uniform float uOpacity;
varying float vN;
varying vec3 vNorm;
varying vec3 vView;
void main() {
  vec3 N = normalize(vNorm);
  vec3 V = normalize(vView);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
  float t = smoothstep(-0.9, 1.15, vN);
  vec3 deep = vec3(0.05, 0.012, 0.007);
  vec3 mid  = vec3(0.46, 0.13, 0.04);
  vec3 hot  = vec3(1.0, 0.60, 0.21);
  vec3 col = mix(deep, mid, t);
  col = mix(col, hot, smoothstep(0.58, 1.0, t));
  col += vec3(1.0, 0.44, 0.13) * fres * 1.5;
  gl_FragColor = vec4(col, uOpacity);
}
`

const AURA_FRAG = /* glsl */ `
uniform float uOpacity;
varying float vN;
varying vec3 vNorm;
varying vec3 vView;
void main() {
  vec3 N = normalize(vNorm);
  vec3 V = normalize(vView);
  float fres = pow(1.0 - abs(dot(N, V)), 3.0);
  vec3 col = vec3(1.0, 0.46, 0.15) * fres * 0.9;
  gl_FragColor = vec4(col, fres * uOpacity * 0.55);
}
`

/* ------------------------------------------------------------------ */
/*  Ember ring shaders (inner pages)                                   */
/* ------------------------------------------------------------------ */
const RING_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aScale;
attribute float aOffset;
varying float vFlicker;
varying float vSeed;
void main() {
  vec3 pos = position;
  pos.y += sin(uTime * 0.8 + aOffset * 6.2831) * 0.12;
  vFlicker = 0.6 + 0.4 * sin(uTime * (2.0 + aOffset * 5.0) + aOffset * 30.0);
  vSeed = aOffset;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aScale * uPixelRatio * (24.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const RING_FRAG = /* glsl */ `
uniform float uOpacity;
varying float vFlicker;
varying float vSeed;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float alpha = smoothstep(0.5, 0.04, d) * vFlicker * uOpacity;
  vec3 ember = vec3(0.95, 0.38, 0.09);
  vec3 gold  = vec3(1.0, 0.78, 0.42);
  vec3 col = mix(ember, gold, vSeed) * (0.6 + vFlicker * 0.7);
  gl_FragColor = vec4(col, alpha * 0.9);
}
`

/* Rotating halo of embers used on inner pages */
function EmberRing({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 0 },
    }),
    []
  )

  const { positions, scales, offsets } = useMemo(() => {
    const count = 420
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const offsets = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 2.05 + (Math.random() - 0.5) * 0.85
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.42
      positions[i * 3 + 2] = Math.sin(angle) * radius
      scales[i] = 0.7 + Math.random() * 2.4
      offsets[i] = Math.random()
    }
    return { positions, scales, offsets }
  }, [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    const scroll = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1))
    const target = active && scroll < 0.55 ? 1 : 0
    uniforms.uOpacity.value = THREE.MathUtils.damp(uniforms.uOpacity.value, target, 3.5, dt)
    if (!group.current) return
    const s = THREE.MathUtils.clamp(viewport.width / 12, 0.5, 0.95)
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 4, dt))
    group.current.position.y = 1.55 + Math.sin(t * 0.5) * 0.08
    group.current.rotation.z = t * 0.16
    group.current.rotation.x = Math.PI * 0.44 + Math.sin(t * 0.3) * 0.05
  })

  return (
    <group ref={group} scale={0.001}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
          <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
        />
      </points>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Ember field component                                              */
/* ------------------------------------------------------------------ */
function EmberField({ count = 650 }: { count?: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uHeight: { value: 20 },
    }),
    []
  )

  const { positions, scales, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)
    const offsets = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = -6 + Math.random() * 8
      scales[i] = 0.6 + Math.random() * 2.6
      speeds[i] = 0.15 + Math.random() * 0.55
      offsets[i] = Math.random()
    }
    return { positions, scales, speeds, offsets }
  }, [count])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    if (ref.current) {
      const s = window.scrollY / Math.max(window.innerHeight, 1)
      ref.current.rotation.y = s * 0.12
    }
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={EMBER_VERT}
        fragmentShader={EMBER_FRAG}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/*  Fire orb component                                                 */
/* ------------------------------------------------------------------ */
function FireOrb({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  const orbMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0.42 },
          uOpacity: { value: 0 },
        },
        vertexShader: ORB_VERT,
        fragmentShader: ORB_FRAG,
      }),
    []
  )

  const auraMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0.28 },
          uOpacity: { value: 0 },
        },
        vertexShader: ORB_VERT,
        fragmentShader: AURA_FRAG,
      }),
    []
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    orbMat.uniforms.uTime.value = t
    auraMat.uniforms.uTime.value = t

    const scroll = Math.min(1.2, window.scrollY / Math.max(window.innerHeight, 1))
    const fade = active ? 1 - THREE.MathUtils.smoothstep(scroll, 0.12, 0.75) : 0
    orbMat.uniforms.uOpacity.value = THREE.MathUtils.damp(
      orbMat.uniforms.uOpacity.value,
      fade,
      3,
      dt
    )
    auraMat.uniforms.uOpacity.value = orbMat.uniforms.uOpacity.value

    if (!group.current) return
    const responsive = THREE.MathUtils.clamp(viewport.width / 11, 0.55, 1)
    const scale = responsive * (1 - scroll * 0.35)
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, scale, 4, dt))
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      0.1 + Math.sin(t * 0.6) * 0.08 + scroll * 7.5,
      4,
      dt
    )
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      mouse.current.x * 0.4 + t * 0.12,
      3,
      dt
    )
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      mouse.current.y * 0.25,
      3,
      dt
    )
  })

  return (
    <group ref={group} scale={0.001}>
      <mesh material={orbMat}>
        <icosahedronGeometry args={[1.55, 5]} />
      </mesh>
      <mesh material={auraMat} scale={1.35}>
        <icosahedronGeometry args={[1.55, 4]} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Fixed canvas                                                       */
/* ------------------------------------------------------------------ */
export default function Scene3D() {
  const { page } = useRouter()
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <FireOrb active={page === 'home'} />
        <EmberRing active={page !== 'home'} />
        <EmberField count={620} />
      </Canvas>
    </div>
  )
}
