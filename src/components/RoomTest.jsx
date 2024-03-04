import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

import { useStateGame } from '../state/useStateGame'

const FILE = './room-test-default.glb'

useGLTF.preload(FILE)


/** --- VISIBILITY-RELATED STUFF --- */

// DIRECTIONS (ONLY THE CAMERA DIRECTION WILL CHANGE)
const DIRECTION = {
  camera: new THREE.Vector3(),
  wall_N: new THREE.Vector3(),
  wall_S: new THREE.Vector3(),
  wall_E: new THREE.Vector3(),
  wall_W: new THREE.Vector3(),
}

const GEOMETRY_VISIBILITY = new THREE.PlaneGeometry(12, 8)

// TRIAL-AND-ERROR VALUE ..USING 0 DOT PRODUCT VALUE RECOMMENDED BY THIS LINK
// https://discourse.threejs.org/t/is-it-possible-to-make-a-3d-wall-visible-only-from-one-side-in-three-js/57521/6
// 0 VALUE IS ORTHOGONAL, BUT VISUALLY DOESN'T WORK
const DOT_THRESHOLD = {
  visible: -0.245,
  hidden: -0.265
}

let dot_product = 0, wall_opacity = 0

/** --- VISIBILITY-RELATED STUFF --- */


const RoomTest = props => {
  const { nodes, materials } = useGLTF(FILE)
  materials.Material.transparent = true

  const refs = {
    control_N: useRef(),
    control_S: useRef(),
    control_E: useRef(),
    control_W: useRef(),

    wall_N: useRef(),
    wall_S: useRef(),
    wall_E: useRef(),
    wall_W: useRef(),

    object_N: useRef(),
    object_S: useRef(),
    object_E: useRef(),
    object_W: useRef()
  }

  // ZUSTAND STATE
  const controls = useStateGame(state => state.controls)

  const camera = useThree(state => state.camera)

  const wall_material = {
    N: materials.Material.clone(),
    S: materials.Material.clone(),
    E: materials.Material.clone(),
    W: materials.Material.clone()
  }

  const helperWallVisibility = ({ direction, material, wall, objects }) => {
    dot_product = direction.dot(DIRECTION.camera)

    wall_opacity = dot_product > DOT_THRESHOLD.visible
      ? 1
      : THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(dot_product, DOT_THRESHOLD.hidden, DOT_THRESHOLD.visible, 0, 1), 0, 1)

    material.opacity = wall_opacity
    wall.visible = wall_opacity > 0
    objects.visible = wall_opacity > 0
  }

  const checkWallVisibility = () => {
    camera.getWorldDirection(DIRECTION.camera)

    helperWallVisibility({ direction: DIRECTION.wall_N, material: wall_material.N, wall: refs.wall_N.current, objects: refs.object_N.current })
    helperWallVisibility({ direction: DIRECTION.wall_S, material: wall_material.S, wall: refs.wall_S.current, objects: refs.object_S.current })
    helperWallVisibility({ direction: DIRECTION.wall_E, material: wall_material.E, wall: refs.wall_E.current, objects: refs.object_E.current })
    helperWallVisibility({ direction: DIRECTION.wall_W, material: wall_material.W, wall: refs.wall_W.current, objects: refs.object_W.current })
  }

  useEffect(() => {
    if (controls) {
      controls.addEventListener('change', checkWallVisibility)

      // CLEANUP
      return () => {
        controls.removeEventListener('change', checkWallVisibility)
      }
    }
  }, [controls])

  useEffect(() => {
    // GET DIRECTIONS AT START AS THESE WILL NOT CHANGE
    refs.control_N.current.getWorldDirection(DIRECTION.wall_N)
    refs.control_S.current.getWorldDirection(DIRECTION.wall_S)
    refs.control_E.current.getWorldDirection(DIRECTION.wall_E)
    refs.control_W.current.getWorldDirection(DIRECTION.wall_W)
  }, [])

  return <group {...props} dispose={null} >
    {/*
      HIDDEN GEOMETRIES WITH DEFINED DIRECTIONS
      - THESE HELP CONTROL WALL VISIBILITY AS THESE DIRECTIONS ARE DEFINED HERE IN CODE
      - "WALL" OBJECTS DEFINED IN THE GLTF FILE, WHILE VISUALLY GOOD, HAVE INCONSISTENT ROTATIONS NOT WELL-SUITED FOR VISIBILITY CONTROL
    */}
    <group visible={false}>
      <mesh ref={refs.control_W} geometry={GEOMETRY_VISIBILITY} position={[0, 4, 6]} />
      <mesh ref={refs.control_E} geometry={GEOMETRY_VISIBILITY} position={[0, 4, -6]} rotation={[0, Math.PI, 0]} />
      <mesh ref={refs.control_N} geometry={GEOMETRY_VISIBILITY} position={[-6, 4, 0]} rotation={[0, -Math.PI * 0.5, 0]} />
      <mesh ref={refs.control_S} geometry={GEOMETRY_VISIBILITY} position={[6, 4, 0]} rotation={[0, Math.PI * 0.5, 0]} />
    </group>

    {/* WALLS AND "ATTACHED" OBJECTS - DYNAMIC VISIBILITY*/}
    <mesh ref={refs.wall_N} geometry={nodes.wall_N.geometry} material={wall_material.N} position={[-6.2, 4, 0]} scale={[0.2, 4, 6]} />
    <mesh ref={refs.object_N} geometry={nodes.object_N.geometry} material={wall_material.N} position={[-5, 1, 0]} />

    <mesh ref={refs.wall_S} geometry={nodes.wall_S.geometry} material={wall_material.S} position={[6.2, 4, 0]} scale={[0.2, 4, 6]} />
    <mesh ref={refs.object_S} geometry={nodes.object_S.geometry} material={wall_material.S} position={[5, 1, 0]} />

    <mesh ref={refs.wall_E} geometry={nodes.wall_E.geometry} material={wall_material.E} position={[0, 4, -6.2]} rotation={[0, -1.571, 0]} scale={[0.2, 4, 6]} />
    <mesh ref={refs.object_E} geometry={nodes.object_E.geometry} material={wall_material.E} position={[0, 1, -5]} rotation={[0, 1.571, 0]} />

    <mesh ref={refs.wall_W} geometry={nodes.wall_W.geometry} material={wall_material.W} position={[0, 4, 6.2]} rotation={[0, -1.571, 0]} scale={[0.2, 4, 6]} />
    <mesh ref={refs.object_W} geometry={nodes.object_W.geometry} material={wall_material.W} position={[0, 1, 5]} rotation={[0, 1.571, 0]} />

    {/* FLOOR - TEMP FOR POSITION TESTING */}
    <mesh rotation={[-Math.PI * 0.5, 0, 0]} >
      <planeGeometry args={[12, 12]} />
    </mesh>
  </group >
}

export default RoomTest