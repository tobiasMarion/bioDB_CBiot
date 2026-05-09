import { Environment, Float } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const NUM_RUNGS = 35
const HELIX_RADIUS = 0.85
const HELIX_HEIGHT = 14
const TURNS = 3.5
const STRAND_RADIUS = 0.075
const RUNG_RADIUS = 0.034
const SPHERE_RADIUS = 0.12

const TILT_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, -0.8, 'XYZ'))
const Y_MIN = -HELIX_HEIGHT / 6
const Y_MAX = HELIX_HEIGHT / 6
const UP = new THREE.Vector3(0, 1, 0)

const BASE_CYLINDER_GEO = new THREE.CylinderGeometry(RUNG_RADIUS, RUNG_RADIUS, 1, 6, 1)
const BASE_SPHERE_GEO = new THREE.SphereGeometry(SPHERE_RADIUS, 8, 8)

interface MaterialConfig {
  roughness: number
  metalness: number
  clearcoat: number
  clearcoatRoughness: number
  envMapIntensity: number
}

interface ColorProps {
  colorA: THREE.Color
  colorB: THREE.Color
}

interface HelixStrandProps extends ColorProps {
  offset: number
  material: THREE.MeshPhysicalMaterial
}

interface RunsInstancedProps extends ColorProps {
  material: THREE.MeshPhysicalMaterial
}

interface DNAGroupProps extends ColorProps {
  materialConfig: MaterialConfig
}

function yToT(y: number): number {
  return THREE.MathUtils.clamp((y - Y_MIN) / (Y_MAX - Y_MIN), 0, 1)
}

function applyVertexGradient(
  geometry: THREE.BufferGeometry,
  colorA: THREE.Color,
  colorB: THREE.Color,
  yMin: number,
  yMax: number
): THREE.BufferGeometry {
  const pos = geometry.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const aL = colorA.clone().convertSRGBToLinear()
  const bL = colorB.clone().convertSRGBToLinear()
  const range = yMax - yMin

  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((pos.getY(i) - yMin) / range, 0, 1)
    colors[i * 3] = aL.r + (bL.r - aL.r) * t
    colors[i * 3 + 1] = aL.g + (bL.g - aL.g) * t
    colors[i * 3 + 2] = aL.b + (bL.b - aL.b) * t
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

function useMaterial(config: MaterialConfig): THREE.MeshPhysicalMaterial {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: config.roughness,
        metalness: config.metalness,
        clearcoat: config.clearcoat,
        clearcoatRoughness: config.clearcoatRoughness,
        envMapIntensity: config.envMapIntensity
      }),
    [
      config.roughness,
      config.metalness,
      config.clearcoat,
      config.clearcoatRoughness,
      config.envMapIntensity
    ]
  )

  useEffect(
    () => () => {
      material.dispose()
    },
    [material]
  )

  return material
}

function DisposeOnUnmount() {
  const { gl } = useThree()
  useEffect(
    () => () => {
      gl.dispose()
    },
    [gl]
  )
  return null
}

function HelixStrand({ offset, material, colorA, colorB }: HelixStrandProps) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 80; i++) {
      const t = i / 80
      const a = t * Math.PI * 2 * TURNS + offset
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * HELIX_RADIUS,
          (t - 0.5) * HELIX_HEIGHT,
          Math.sin(a) * HELIX_RADIUS
        )
      )
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, STRAND_RADIUS, 7, false)
    return applyVertexGradient(g, colorA, colorB, Y_MIN, Y_MAX)
  }, [offset, colorA, colorB])

  useEffect(
    () => () => {
      geo.dispose()
    },
    [geo]
  )

  return <mesh geometry={geo} material={material} />
}

function RunsInstanced({ material, colorA, colorB }: RunsInstancedProps) {
  const cylRef = useRef<THREE.InstancedMesh>(null)
  const sphARef = useRef<THREE.InstancedMesh>(null)
  const sphBRef = useRef<THREE.InstancedMesh>(null)

  const { items, cylinderMat, sphereMat } = useMemo(() => {
    const cylinderMat = new THREE.MeshPhysicalMaterial({
      roughness: material.roughness,
      metalness: material.metalness,
      clearcoat: material.clearcoat,
      clearcoatRoughness: material.clearcoatRoughness,
      envMapIntensity: material.envMapIntensity,
      vertexColors: false
    })
    const sphereMat = cylinderMat.clone()

    const items = Array.from({ length: NUM_RUNGS }, (_, i) => {
      const t = i / (NUM_RUNGS - 1)
      const ang = t * Math.PI * 2 * TURNS
      const y = (t - 0.5) * HELIX_HEIGHT
      const pA = new THREE.Vector3(Math.cos(ang) * HELIX_RADIUS, y, Math.sin(ang) * HELIX_RADIUS)
      const pB = new THREE.Vector3(
        Math.cos(ang + Math.PI) * HELIX_RADIUS,
        y,
        Math.sin(ang + Math.PI) * HELIX_RADIUS
      )
      const len = pA.distanceTo(pB)
      const mid = pA.clone().lerp(pB, 0.5)
      const dir = pB.clone().sub(pA).normalize()
      const q = new THREE.Quaternion().setFromUnitVectors(UP, dir)
      return { pA, pB, mid, len, q, y }
    })

    return { items, cylinderMat, sphereMat }
  }, [material])

  useEffect(() => {
    const dummy = new THREE.Object3D()
    const aL = colorA.clone().convertSRGBToLinear()
    const bL = colorB.clone().convertSRGBToLinear()

    items.forEach(({ mid, len, q, pA, pB, y }, i) => {
      const col = aL.clone().lerp(bL, yToT(y))

      if (cylRef.current) {
        dummy.position.copy(mid)
        dummy.quaternion.copy(q)
        dummy.scale.set(1, len * 0.94, 1)
        dummy.updateMatrix()
        cylRef.current.setMatrixAt(i, dummy.matrix)
        cylRef.current.setColorAt(i, col)
      }

      if (sphARef.current) {
        dummy.position.copy(pA)
        dummy.quaternion.identity()
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        sphARef.current.setMatrixAt(i, dummy.matrix)
        sphARef.current.setColorAt(i, aL.clone().lerp(bL, yToT(pA.y)))
      }

      if (sphBRef.current) {
        dummy.position.copy(pB)
        dummy.quaternion.identity()
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        sphBRef.current.setMatrixAt(i, dummy.matrix)
        sphBRef.current.setColorAt(i, aL.clone().lerp(bL, yToT(pB.y)))
      }
    })

    for (const ref of [cylRef, sphARef, sphBRef]) {
      if (!ref.current) continue
      ref.current.instanceMatrix.needsUpdate = true
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    }
  }, [items, colorA, colorB])

  useEffect(
    () => () => {
      cylinderMat.dispose()
      sphereMat.dispose()
    },
    [cylinderMat, sphereMat]
  )

  return (
    <>
      <instancedMesh ref={cylRef} args={[BASE_CYLINDER_GEO, cylinderMat, NUM_RUNGS]} />
      <instancedMesh ref={sphARef} args={[BASE_SPHERE_GEO, sphereMat, NUM_RUNGS]} />
      <instancedMesh ref={sphBRef} args={[BASE_SPHERE_GEO, sphereMat, NUM_RUNGS]} />
    </>
  )
}

function DNAGroup({ materialConfig, colorA, colorB }: DNAGroupProps) {
  const material = useMaterial(materialConfig)
  const spinRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (spinRef.current) spinRef.current.rotation.y = -clock.elapsedTime * 0.2
  })

  return (
    <Float speed={0.65} rotationIntensity={0.05} floatIntensity={0.1}>
      <group quaternion={TILT_Q}>
        <group ref={spinRef}>
          <RunsInstanced material={material} colorA={colorA} colorB={colorB} />
          <HelixStrand offset={0} material={material} colorA={colorA} colorB={colorB} />
          <HelixStrand offset={Math.PI} material={material} colorA={colorA} colorB={colorB} />
        </group>
      </group>
    </Float>
  )
}

interface DNAHelixProps extends Partial<MaterialConfig> {
  colorBottom?: string
  colorTop?: string
  className?: string
  style?: React.CSSProperties
}

export function DNAHelix({
  colorBottom = '#4ade80',
  colorTop = '#22d3ee',
  roughness = 0.28,
  metalness = 0.05,
  clearcoat = 0.75,
  clearcoatRoughness = 0.12,
  envMapIntensity = 1.1,
  className = '',
  style = {}
}: DNAHelixProps) {
  const colorA = useMemo(() => new THREE.Color(colorBottom), [colorBottom])
  const colorB = useMemo(() => new THREE.Color(colorTop), [colorTop])

  const materialConfig: MaterialConfig = useMemo(
    () => ({ roughness, metalness, clearcoat, clearcoatRoughness, envMapIntensity }),
    [roughness, metalness, clearcoat, clearcoatRoughness, envMapIntensity]
  )

  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', background: 'transparent', ...style }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.5 }}
        frameloop='always'
      >
        <DisposeOnUnmount />
        <hemisphereLight args={['#ffe8c0', '#1a3a6e', 1.5]} />
        <directionalLight position={[8, 8, 5]} intensity={2.5} color='#ffffff' />
        <directionalLight position={[-5, -3, -5]} intensity={0.8} color='#aac4ff' />
        <pointLight position={[3, 6, 4]} intensity={2.0} color='#ffffff' />
        <pointLight position={[-3, -5, -3]} intensity={0.8} color='#8ab4ff' />
        <pointLight position={[0, -6, 2]} intensity={0.8} color='#4488ff' />
        <Environment resolution={32} background={false}>
          <color attach='background' args={['#334466']} />
        </Environment>
        <DNAGroup materialConfig={materialConfig} colorA={colorA} colorB={colorB} />
      </Canvas>
    </div>
  )
}
