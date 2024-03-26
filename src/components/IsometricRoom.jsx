import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'

import { DOOR_STATE, useStateGame } from '../state/useStateGame'



// GLTF ANIMATION NAMES
const ANIMATIONS = {
  PC_FAN: 'action_fan',
  CEILING_FAN: 'action_fan_blades',
  LUCKY_CAT: 'action_paw',
  DOOR_WEST_CLOSE: 'door_W_close',
  DOOR_WEST_OPEN: 'door_W_open',
  DOOR_NORTH_CLOSE: 'door_N_close',
  DOOR_NORTH_OPEN: 'door_N_open'
}


const FILE = './isometric.glb'
useGLTF.preload(FILE)



/** --- DYNAMIC VISIBILITY RELATED STUFF --- */

// TRIAL-AND-ERROR VALUE ..USING 0 DOT PRODUCT VALUE RECOMMENDED BY THIS LINK
// https://discourse.threejs.org/t/is-it-possible-to-make-a-3d-wall-visible-only-from-one-side-in-three-js/57521/6
// 0 VALUE IS ORTHOGONAL, BUT VISUALLY DOESN'T WORK
const DOT_THRESHOLDS = {
  WALLS: {
    visible: -0.12,
    hidden: -0.135
  },

  FLOOR: {
    visible: -0.045,
    hidden: -0.06
  },

  CEILING: {
    visible: -0.07,
    hidden: -0.085
  }
}

let
  dot_product = 0,
  geometry_opacity = 0

// DIRECTIONS (ONLY THE CAMERA DIRECTION WILL CHANGE)
const DIRECTION = {
  camera: new THREE.Vector3(),
  wall_north: new THREE.Vector3(),
  wall_south: new THREE.Vector3(),
  wall_east: new THREE.Vector3(),
  wall_west: new THREE.Vector3(),
  ceiling: new THREE.Vector3(),
  floor: new THREE.Vector3()
}

const GEOMETRY_HIDDEN = new THREE.PlaneGeometry(2, 2)
/** --- DYNAMIC VISIBILITY RELATED STUFF --- */



/** --- MAIN COMPONENT --- */
const IsometricRoom = props => {
  const refs = {
    // SCENE GROUP (REQUIRED FOR ANIMATIONS)
    scene: useRef(),

    // HIDDEN GEOMETRIES
    hidden: {
      wall_north: useRef(),
      wall_south: useRef(),
      wall_east: useRef(),
      wall_west: useRef(),
      floor: useRef(),
      ceiling: useRef()
    },

    // VISIBLE GEOMETRIES
    visible: {
      wall_north: useRef(),
      wall_south: useRef(),
      wall_east: useRef(),
      wall_west: useRef(),

      floor: useRef(),
      ceiling: useRef(),

      door_north: useRef(),
      door_west: useRef(),
      paw: useRef(),
      pc_fan: useRef(),
      fan_blades: useRef()
    }
  }

  const { nodes, materials, animations } = useGLTF(FILE)
  const { mixer, actions } = useAnimations(animations, refs.scene)
  const camera = useThree(state => state.camera)

  // --- DYNAMIC VISIBILITY: MATERIALS ---
  materials.bake.transparent = true // REQUIRED FOR OPACITY TO WORK
  materials.bake.side = THREE.FrontSide

  const dynamic_material = {
    wall_north: materials.bake.clone(),
    wall_south: materials.bake.clone(),
    wall_east: materials.bake.clone(),
    wall_west: materials.bake.clone(),
    floor: materials.bake.clone(),
    ceiling: materials.bake.clone(),
  }

  dynamic_material.floor.side = THREE.DoubleSide
  // --- DYNAMIC VISIBILITY: MATERIALS ---



  // ZUSTAND STATE
  const
    controls = useStateGame(state => state.controls), // REFERENCE TO ORBIT CONTROLS (PUT IN GLOBAL STATE IN Experience.jsx)
    setDoorWestState = useStateGame(state => state.setDoorWestState),
    setDoorNorthState = useStateGame(state => state.setDoorNorthState)



  // --- BUILT-IN MODEL ANIMATIONS (TRIGGERED BY USER INTERACTION) ---
  const onAnimationFinished = e => {
    mixer.removeEventListener('finished', onAnimationFinished)

    if (e.action === actions[ANIMATIONS.DOOR_WEST_OPEN]) {
      setDoorWestState(DOOR_STATE.OPEN)
    }
    else if (e.action === actions[ANIMATIONS.DOOR_WEST_CLOSE]) {
      setDoorWestState(DOOR_STATE.CLOSED)
    }
    else if (e.action == actions[ANIMATIONS.DOOR_NORTH_OPEN]) {
      setDoorNorthState(DOOR_STATE.OPEN)
    }
    else if (e.action == actions[ANIMATIONS.DOOR_NORTH_CLOSE]) {
      setDoorNorthState(DOOR_STATE.CLOSED)
    }
  }

  const handleDoorWestAnimation = () => {
    let animation_action

    switch (useStateGame.getState().door_west_state) {

      case DOOR_STATE.CLOSED:
        actions[ANIMATIONS.DOOR_WEST_CLOSE].stop()

        setDoorWestState(DOOR_STATE.OPENING)
        animation_action = actions[ANIMATIONS.DOOR_WEST_OPEN]

        mixer.addEventListener('finished', onAnimationFinished)

        animation_action.clampWhenFinished = true

        animation_action
          .reset()
          .setLoop(THREE.LoopOnce)
          .play()

        break

      case DOOR_STATE.OPEN:
        actions[ANIMATIONS.DOOR_WEST_OPEN].stop()

        setDoorWestState(DOOR_STATE.OPENING)
        animation_action = actions[ANIMATIONS.DOOR_WEST_CLOSE]

        mixer.addEventListener('finished', onAnimationFinished)

        animation_action.clampWhenFinished = true

        animation_action
          .reset()
          .setLoop(THREE.LoopOnce)
          .play()

        break

      default:
      // OTHERWISE WAITING FOR ANIMATION TO COMPLETE
    }
  }

  const handleDoorNorthAnimation = () => {
    let animation_action

    switch (useStateGame.getState().door_north_state) {

      case DOOR_STATE.CLOSED:
        actions[ANIMATIONS.DOOR_NORTH_CLOSE].stop()

        setDoorNorthState(DOOR_STATE.OPENING)
        animation_action = actions[ANIMATIONS.DOOR_NORTH_OPEN]

        mixer.addEventListener('finished', onAnimationFinished)

        animation_action.clampWhenFinished = true

        animation_action
          .reset()
          .setLoop(THREE.LoopOnce)
          .play()

        break

      case DOOR_STATE.OPEN:
        actions[ANIMATIONS.DOOR_NORTH_OPEN].stop()

        setDoorNorthState(DOOR_STATE.OPENING)
        animation_action = actions[ANIMATIONS.DOOR_NORTH_CLOSE]

        mixer.addEventListener('finished', onAnimationFinished)

        animation_action.clampWhenFinished = true

        animation_action
          .reset()
          .setLoop(THREE.LoopOnce)
          .play()

        break

      default:
      // OTHERWISE WAITING FOR ANIMATION TO COMPLETE
    }
  }
  // --- BUILT-IN MODEL ANIMATIONS (TRIGGERED BY USER INTERACTION) ---



  // --- DYNAMIC VISIBILITY: LOGIC --
  const helperCheckVisible = ({ direction, material, geometries, visible_thresholds }) => {
    dot_product = direction.dot(DIRECTION.camera)

    geometry_opacity = dot_product > visible_thresholds.visible
      ? 1
      : THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(dot_product, visible_thresholds.hidden, visible_thresholds.visible, 0, 1), 0, 1)

    material.opacity = geometry_opacity

    geometries.forEach(geometry => {
      geometry.current.visible = geometry_opacity > 0
    })
  }

  const checkVisible = () => {
    camera.getWorldDirection(DIRECTION.camera)

    helperCheckVisible({
      direction: DIRECTION.wall_north,
      material: dynamic_material.wall_north,
      geometries: [refs.visible.wall_north, refs.visible.door_north],
      visible_thresholds: DOT_THRESHOLDS.WALLS
    })

    helperCheckVisible({
      direction: DIRECTION.wall_south,
      material: dynamic_material.wall_south,
      geometries: [refs.visible.wall_south],
      visible_thresholds: DOT_THRESHOLDS.WALLS
    })

    helperCheckVisible({
      direction: DIRECTION.wall_east,
      material: dynamic_material.wall_east,
      geometries: [refs.visible.wall_east, refs.visible.paw],
      visible_thresholds: DOT_THRESHOLDS.WALLS
    })

    helperCheckVisible({
      direction: DIRECTION.wall_west,
      material: dynamic_material.wall_west,
      geometries: [refs.visible.wall_west, refs.visible.door_west],
      visible_thresholds: DOT_THRESHOLDS.WALLS
    })

    helperCheckVisible({
      direction: DIRECTION.floor,
      material: dynamic_material.floor,
      geometries: [refs.visible.floor, refs.visible.pc_fan],
      visible_thresholds: DOT_THRESHOLDS.FLOOR,
      name: 'floor'
    })

    helperCheckVisible({
      direction: DIRECTION.ceiling,
      material: dynamic_material.ceiling,
      geometries: [refs.visible.ceiling, refs.visible.fan_blades],
      visible_thresholds: DOT_THRESHOLDS.CEILING
    })
  }
  // --- DYNAMIC VISIBILITY: LOGIC --



  // SETS UP DYNAMIC VISIBILITY CHECK WITH ORBIT CONTROLS
  useEffect(() => {
    if (controls) {
      controls.addEventListener('change', checkVisible)

      // CLEANUP
      return () => {
        controls.removeEventListener('change', checkVisible)
      }
    }
  }, [controls])

  useEffect(() => {

    // GET DIRECTION NORMALS AT START AS THESE WILL NOT CHANGE (CONTROLS GEOMETRY VISIBILITY)
    refs.hidden.ceiling.current.getWorldDirection(DIRECTION.ceiling)
    refs.hidden.floor.current.getWorldDirection(DIRECTION.floor)
    refs.hidden.wall_east.current.getWorldDirection(DIRECTION.wall_east)
    refs.hidden.wall_west.current.getWorldDirection(DIRECTION.wall_west)
    refs.hidden.wall_north.current.getWorldDirection(DIRECTION.wall_north)
    refs.hidden.wall_south.current.getWorldDirection(DIRECTION.wall_south)


    // CONTINUOUS ANIMATIONS

    // PC FAN
    actions[ANIMATIONS.PC_FAN]
      .reset()
      .setLoop(THREE.LoopRepeat)
      .play()

    actions[ANIMATIONS.CEILING_FAN]
      .reset()
      .setLoop(THREE.LoopRepeat)
      .play()

    actions[ANIMATIONS.LUCKY_CAT]
      .reset()
      .setLoop(THREE.LoopRepeat)
      .play()


    // CLEANUP
    // return () => {
    // }
  }, [])

  useFrame(() => {
    // TODO - TURN ON/OFF BASED ON USER SCENE INTERACTIONS (FUTURE ITERATION)
    controls.update() // REQUIRED FOR ORBIT CONTROLS AUTO-ROTATE AND DAMPING TO WORK CORRECTLY
  })

  return <group {...props} dispose={null} >
    {/*
      HIDDEN GEOMETRIES WITH DEFINED DIRECTIONS
      - THESE HELP CONTROL WALL VISIBILITY AS THESE DIRECTIONS ARE DEFINED ONLY HERE IN CODE
      - WHY? "WALL" OBJECTS DEFINED IN THE GLTF FILE, WHILE VISUALLY GOOD, HAVE INCONSISTENT ROTATIONS NOT WELL-SUITED FOR VISIBILITY CONTROL
    */}
    <group visible={false}>
      <mesh ref={refs.hidden.wall_east} geometry={GEOMETRY_HIDDEN} position={[0, 1.2, 2.6]} />
      <mesh ref={refs.hidden.wall_west} geometry={GEOMETRY_HIDDEN} position={[0, 1.2, -2.6]} rotation={[0, Math.PI, 0]} />
      <mesh ref={refs.hidden.wall_south} geometry={GEOMETRY_HIDDEN} position={[-2.6, 1.2, 0]} rotation={[0, -Math.PI * 0.5, 0]} />
      <mesh ref={refs.hidden.wall_north} geometry={GEOMETRY_HIDDEN} position={[2.6, 1.2, 0]} rotation={[0, Math.PI * 0.5, 0]} />

      <mesh ref={refs.hidden.ceiling} geometry={GEOMETRY_HIDDEN} position={[0, 2.8, 0]} rotation={[-Math.PI * 0.5, 0, 0]} />
      <mesh ref={refs.hidden.floor} geometry={GEOMETRY_HIDDEN} position={[0, -0.2, 0]} rotation={[Math.PI * 0.5, 0, 0]} />
    </group>

    {/* SCENE GEOMTRIES - DYNAMIC VISIBILITY */}
    <group ref={refs.scene} name={'Scene'}>
      {/* FLOOR GEOMETRIES */}
      <mesh name='floor' ref={refs.visible.floor} geometry={nodes.floor.geometry} material={dynamic_material.floor} />
      <mesh name='pc_fan' ref={refs.visible.pc_fan} geometry={nodes.pc_fan.geometry} material={dynamic_material.floor} position={[1.627, 1.411, -2.177]} rotation={[0, 0.827, 0]} />

      {/* CEILING GEOMETRIES */}
      <mesh name="ceiling" ref={refs.visible.ceiling} geometry={nodes.ceiling.geometry} material={dynamic_material.ceiling} position={[0, 2.438, 0]} />
      <mesh name="fan_blades" ref={refs.visible.fan_blades} geometry={nodes.fan_blades.geometry} material={dynamic_material.ceiling} position={[0, 2.438, 0]} rotation={[-Math.PI, Math.PI / 5, -Math.PI]} />

      {/* NORTH WALL GEOMETRIES X */}
      <mesh name="wall_N" ref={refs.visible.wall_north} geometry={nodes.wall_N.geometry} material={dynamic_material.wall_north} position={[2.515, 1.219, 0]} />
      <mesh name="door_N" ref={refs.visible.door_north} geometry={nodes.door_N.geometry} material={dynamic_material.wall_north} position={[2.433, 0, 0.381]} rotation={[0, 0.004, 0]}
        onClick={handleDoorNorthAnimation} />

      {/* SOUTH WALL GEOMETRIES */}
      <mesh name='wall_S' ref={refs.visible.wall_south} geometry={nodes.wall_S.geometry} material={dynamic_material.wall_south} position={[-2.515, 1.219, 0]} />

      {/* EAST WALL GEOMETRIES X */}
      <mesh name="wall_E" ref={refs.visible.wall_east} geometry={nodes.wall_E.geometry} material={dynamic_material.wall_east} position={[0, 1.219, 2.515]} />
      <mesh name="paw" ref={refs.visible.paw} geometry={nodes.paw.geometry} material={dynamic_material.wall_east} position={[1.863, 1.855, 2.295]} rotation={[-2.194, -0.39, -2.676]} />

      {/* WEST WALL GEOMETRIES */}
      <mesh name='wall_W' ref={refs.visible.wall_west} geometry={nodes.wall_W.geometry} material={dynamic_material.wall_west} position={[0, 1.219, -2.515]} />
      <mesh name='door_W' ref={refs.visible.door_west} geometry={nodes.door_W.geometry} material={dynamic_material.wall_west} position={[-2.021, 0, -2.433]}
        onClick={handleDoorWestAnimation} />
    </group>
  </group>
}

export default IsometricRoom