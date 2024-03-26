import { useEffect, useRef, lazy } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls, useHelper } from '@react-three/drei'
import { useControls, folder } from 'leva'

import { useStateGame } from './state/useStateGame'
import { parameterEnabled } from './common/Utils'
import { CAMERA_DEFAULTS, LEVA_SORT_ORDER, LIGHTING_DEFAULTS } from './common/Constants'
import IsometricRoom from './components/IsometricRoom'

// LEVA DEBUG
const debug_enabled = parameterEnabled('DEBUG') || parameterEnabled('debug')

// DYNAMIC IMPORT FOR R3F PERFORMANCE MONITOR
let Perf = null

if (parameterEnabled('PERF') || parameterEnabled('perf')) {
  Perf = lazy(() => import('r3f-perf').then(module => ({ default: module.Perf })))
}

const Experience = () => {

  const
    ref_orbit_controls = useRef(),
    ref_directional_light = useRef(),
    ref_shadow_camera = useRef()

  // ZUSTAND STATE
  const setControls = useStateGame(state => state.setControls)

  // LEVA CAMERA & ORBIT CONTROLS
  const camera = useThree((state) => state.camera)

  const [_, setControlsCamera] = useControls(
    'camera',

    () => ({
      fov: {
        value: CAMERA_DEFAULTS.fov,
        min: 1,
        max: 120,
        step: 1,

        onChange: value => {
          camera.fov = value
          camera.updateProjectionMatrix()
        }
      },

      near: {
        value: CAMERA_DEFAULTS.near,
        min: 0.1,
        max: 50,
        step: 0.1,

        onChange: value => {
          camera.near = value
          camera.updateProjectionMatrix()
        }
      },

      far: {
        value: CAMERA_DEFAULTS.far,
        min: 50,
        max: 1000,
        step: 1,

        onChange: value => {
          camera.far = value
          camera.updateProjectionMatrix()
        }
      },

      position: folder(
        {
          pos_x: {
            label: 'x',
            value: CAMERA_DEFAULTS.position[0],
            min: -CAMERA_DEFAULTS.leva_min_max,
            max: CAMERA_DEFAULTS.leva_min_max,
            step: 0.1,

            onChange: value => {
              camera.position.x = value
              camera.updateProjectionMatrix()
            }
          },

          pos_y: {
            label: 'y',
            value: CAMERA_DEFAULTS.position[1],
            min: -CAMERA_DEFAULTS.leva_min_max,
            max: CAMERA_DEFAULTS.leva_min_max,
            step: 0.1,

            onChange: value => {
              camera.position.y = value
              camera.updateProjectionMatrix()
            }
          },

          pos_z: {
            label: 'z',
            value: CAMERA_DEFAULTS.position[2],
            min: -CAMERA_DEFAULTS.leva_min_max,
            max: CAMERA_DEFAULTS.leva_min_max,
            step: 0.1,

            onChange: value => {
              camera.position.z = value
              camera.updateProjectionMatrix()
            }
          },
        },
        { collapsed: true }
      ),

      'orbit look at': folder(
        {
          look_at_x: {
            label: 'x',
            value: CAMERA_DEFAULTS.look_at[0],
            min: -CAMERA_DEFAULTS.leva_min_max,
            max: CAMERA_DEFAULTS.leva_min_max,
            step: 0.1,

            onChange: value => {
              ref_orbit_controls.current.target.x = value
            }
          },

          look_at_y: {
            label: 'y',
            value: CAMERA_DEFAULTS.look_at[1],
            min: -CAMERA_DEFAULTS.leva_min_max,
            max: CAMERA_DEFAULTS.leva_min_max,
            step: 0.1,

            onChange: value => {
              ref_orbit_controls.current.target.y = value
            }
          },

          look_at_z: {
            label: 'z',
            value: CAMERA_DEFAULTS.look_at[2],
            min: -CAMERA_DEFAULTS.leva_min_max,
            max: CAMERA_DEFAULTS.leva_min_max,
            step: 0.1,

            onChange: value => {
              ref_orbit_controls.current.target.z = value
            }
          },
        },
        { collapsed: true }
      )
    }),

    { collapsed: true, order: LEVA_SORT_ORDER.CAMERA }
  )

  // LEVA LIGHTS
  const controls_lighting = useControls(
    'lighting',

    {
      'ambient light': folder(
        {
          ambient_intensity: {
            label: 'intensity',
            value: LIGHTING_DEFAULTS.ambient_intensity,
            min: 0,
            max: 10,
            step: 0.1
          },

          ambient_color: {
            label: 'color',
            value: LIGHTING_DEFAULTS.ambient_color
          },
        },

        { collapsed: true }
      ),

      'directional light': folder(
        {
          directional_helper: {
            label: 'helper',
            value: false,
          },

          directional_intensity: {
            label: 'intensity',
            value: LIGHTING_DEFAULTS.directional_intensity,
            min: 0,
            max: 10,
            step: 0.1
          },

          'position': folder(
            {
              directional_pos_x: {
                label: 'x',
                value: LIGHTING_DEFAULTS.directional_position[0],
                min: -CAMERA_DEFAULTS.leva_min_max,
                max: CAMERA_DEFAULTS.leva_min_max,
                step: 0.1
              },

              directional_pos_y: {
                label: 'y',
                value: LIGHTING_DEFAULTS.directional_position[1],
                min: -CAMERA_DEFAULTS.leva_min_max,
                max: CAMERA_DEFAULTS.leva_min_max,
                step: 0.1
              },

              directional_pos_z: {
                label: 'z',
                value: LIGHTING_DEFAULTS.directional_position[2],
                min: -CAMERA_DEFAULTS.leva_min_max,
                max: CAMERA_DEFAULTS.leva_min_max,
                step: 0.1
              },
            },
          ),

          directional_color: {
            label: 'color',
            value: LIGHTING_DEFAULTS.directional_color
          },
        },

        { collapsed: true }
      ),

      'shadow': folder(
        {
          shadow_enabled: {
            label: 'enabled',
            value: true,
          },

          shadow_helper: {
            label: 'helper',
            value: false,
          },

          shadow_color: {
            label: 'color',
            value: LIGHTING_DEFAULTS.shadow_color
          },

          shadow_opacity: {
            label: 'opacity',
            value: LIGHTING_DEFAULTS.shadow_opacity,
            min: 0,
            max: 1,
            step: 0.01
          },

          shadow_near: {
            label: 'near',
            value: LIGHTING_DEFAULTS.shadow_near,
            min: 0,
            max: 5,
            step: 0.01,

            onChange: value => {
              ref_shadow_camera.current.near = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_far: {
            label: 'far',
            value: LIGHTING_DEFAULTS.shadow_far,
            min: 5,
            max: 20,
            step: 0.1,

            onChange: value => {
              ref_shadow_camera.current.far = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_left: {
            label: 'left',
            value: LIGHTING_DEFAULTS.shadow_left,
            min: -15,
            max: 0,
            step: 0.1,

            onChange: value => {
              ref_shadow_camera.current.left = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_right: {
            label: 'right',
            value: LIGHTING_DEFAULTS.shadow_right,
            min: 1,
            max: 15,
            step: 0.1,

            onChange: value => {
              ref_shadow_camera.current.right = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_top: {
            label: 'top',
            value: LIGHTING_DEFAULTS.shadow_top,
            min: 1,
            max: 15,
            step: 0.1,

            onChange: value => {
              ref_shadow_camera.current.top = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_bottom: {
            label: 'bottom',
            value: LIGHTING_DEFAULTS.shadow_bottom,
            min: -15,
            max: 0,
            step: 0.1,

            onChange: value => {
              ref_shadow_camera.current.bottom = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },
        },

        { collapsed: true }
      ),
    },

    { collapsed: true, order: LEVA_SORT_ORDER.LIGHTING }
  )

  // HELPERS
  useHelper(
    controls_lighting.shadow_helper && ref_shadow_camera,
    THREE.CameraHelper
  )

  useHelper(
    controls_lighting.directional_helper && ref_directional_light,
    THREE.DirectionalLightHelper,
    1, // size (no effect..)
    '#ff0'
  )

  // EFFECTS
  useEffect(() => {
    // SET ORBIT CONTROLS REFERENCE TO BE ACCESSIBLE GLOBALLY
    setControls(ref_orbit_controls.current)
  }, [])

  return <>
    {Perf && <Perf position='top-left' />}

    <OrbitControls
      ref={ref_orbit_controls}
      target={CAMERA_DEFAULTS.look_at}

      autoRotate={true}
      autoRotateSpeed={0.1}
      enablePan={false}
      maxDistance={20}
      minPolarAngle={Math.PI * 0.25}
      maxPolarAngle={Math.PI * 0.75}
      dampingFactor={0.01}

      onChange={() => {
        if (!debug_enabled) return

        setControlsCamera({
          pos_x: camera.position.x,
          pos_y: camera.position.y,
          pos_z: camera.position.z,
          look_at_x: ref_orbit_controls.current.target.x,
          look_at_y: ref_orbit_controls.current.target.y,
          look_at_z: ref_orbit_controls.current.target.z
        })
      }}
    />

    <color attach="background" args={['#8f97b3']} />

    <directionalLight
      ref={ref_directional_light}
      castShadow={controls_lighting.shadow_enabled}

      position={[
        controls_lighting.directional_pos_x,
        controls_lighting.directional_pos_y,
        controls_lighting.directional_pos_z
      ]}

      intensity={controls_lighting.directional_intensity}
      color={controls_lighting.directional_color}
      shadow-mapSize={LIGHTING_DEFAULTS.shadow_map_size}
    >
      <orthographicCamera
        ref={ref_shadow_camera}
        attach='shadow-camera'
        near={controls_lighting.shadow_near}
        far={controls_lighting.shadow_far}

        args={[
          controls_lighting.shadow_left,
          controls_lighting.shadow_right,
          controls_lighting.shadow_top,
          controls_lighting.shadow_bottom,
        ]}
      />
    </directionalLight>

    <ambientLight
      intensity={controls_lighting.ambient_intensity}
      color={controls_lighting.ambient_color}
    />

    <IsometricRoom />
  </>
}

export default Experience