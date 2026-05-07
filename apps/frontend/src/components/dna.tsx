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

interface RungsProps extends ColorProps {
  material: THREE.MeshPhysicalMaterial
}

interface DNAGroupProps extends ColorProps {
  material: THREE.MeshPhysicalMaterial
}

interface RungItem {
  pA: THREE.Vector3
  pB: THREE.Vector3
  mid: THREE.Vector3
  len: number
  q: THREE.Quaternion
  y: number
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

function buildSphereGeo(
  yPos: number,
  colorA: THREE.Color,
  colorB: THREE.Color
): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(SPHERE_RADIUS, 12, 12)
  g.translate(0, yPos, 0)
  applyVertexGradient(g, colorA, colorB, Y_MIN, Y_MAX)
  g.translate(0, -yPos, 0)
  return g
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

function HelixStrand({ offset, material, colorA, colorB }: HelixStrandProps) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 160; i++) {
      const t = i / 160
      const a = t * Math.PI * 2 * TURNS + offset
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * HELIX_RADIUS,
          (t - 0.5) * HELIX_HEIGHT,
          Math.sin(a) * HELIX_RADIUS
        )
      )
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, STRAND_RADIUS, 8, false)
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

function Rungs({ material, colorA, colorB }: RungsProps) {
  const items: RungItem[] = useMemo(() => {
    return Array.from({ length: NUM_RUNGS }, (_, i) => {
      const t = i / (NUM_RUNGS - 1)
      const ang = t * Math.PI * 2 * TURNS
      const y = (t - 0.5) * HELIX_HEIGHT
      const pA = new THREE.Vector3(Math.cos(ang) * HELIX_RADIUS, y, Math.sin(ang) * HELIX_RADIUS)
      const pB = new THREE.Vector3(
        Math.cos(ang + Math.PI) * HELIX_RADIUS,
        y,
        Math.sin(ang + Math.PI) * HELIX_RADIUS
      )
      const dir = pB.clone().sub(pA).normalize()
      const len = pA.distanceTo(pB)
      const mid = pA.clone().lerp(pB, 0.5)
      const q = new THREE.Quaternion().setFromUnitVectors(UP, dir)
      return { pA, pB, mid, len, q, y }
    })
  }, [])

  const cylinderGeos = useMemo(
    () =>
      items.map(({ len }) => {
        const g = new THREE.CylinderGeometry(RUNG_RADIUS, RUNG_RADIUS, len * 0.94, 7, 1)
        return applyVertexGradient(g, colorA, colorB, Y_MIN, Y_MAX)
      }),
    [items, colorA, colorB]
  )

  const sphereGeos = useMemo(
    () =>
      items.map(({ pA, pB }) => ({
        geoA: buildSphereGeo(pA.y, colorA, colorB),
        geoB: buildSphereGeo(pB.y, colorA, colorB)
      })),
    [items, colorA, colorB]
  )

  useEffect(
    () => () => {
      for (const g of cylinderGeos) g.dispose()
    },
    [cylinderGeos]
  )

  useEffect(
    () => () => {
      for (const { geoA, geoB } of sphereGeos) {
        geoA.dispose()
        geoB.dispose()
      }
    },
    [sphereGeos]
  )

  return (
    <>
      {items.map(({ pA, pB, mid, q }, i) => (
        <group key={i}>
          <group position={mid} quaternion={q}>
            <mesh geometry={cylinderGeos[i]} material={material} />
          </group>
          <mesh position={pA} geometry={sphereGeos[i].geoA} material={material} />
          <mesh position={pB} geometry={sphereGeos[i].geoB} material={material} />
        </group>
      ))}
    </>
  )
}

function DNAGroup({ material, colorA, colorB }: DNAGroupProps) {
  const spinRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (spinRef.current) spinRef.current.rotation.y = -clock.elapsedTime * 0.2
  })

  return (
    <Float speed={0.65} rotationIntensity={0.05} floatIntensity={0.1}>
      <group quaternion={TILT_Q}>
        <group ref={spinRef}>
          <Rungs material={material} colorA={colorA} colorB={colorB} />
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

  const material = useMaterial(materialConfig)

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
        <ambientLight intensity={0.25} />
        <directionalLight position={[8, 8, 5]} intensity={1.0} color='#ffffff' />
        <directionalLight position={[-5, -3, -5]} intensity={0.25} color='#aac4ff' />
        <pointLight position={[3, 6, 4]} intensity={0.6} color='#ffffff' />
        <pointLight position={[-3, -5, -3]} intensity={0.25} color='#8ab4ff' />
        <Environment preset='city' />
        <DNAGroup material={material} colorA={colorA} colorB={colorB} />
      </Canvas>
    </div>
  )
}
