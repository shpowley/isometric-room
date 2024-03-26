import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { Leva, useControls } from "leva"

import Experience from "./Experience"
import { parameterEnabled } from "./common/Utils"
import { CAMERA_DEFAULTS, LEVA_SORT_ORDER, TONE_MAPPING_OPTIONS } from "./common/Constants"
import Footer from "./components/Footer"

// LEVA DEBUG
const debug_enabled = parameterEnabled('DEBUG') || parameterEnabled('debug')

const App = () => {

  // TONE MAPPING WITH REACT THREE FIBER
  // https://discourse.threejs.org/t/tone-mapping-change-tonemapping-type/48266/4
  const controls_gl = useControls(
    'tone mapping',

    {
      tone_mapping: {
        label: 'tone',
        value: THREE.ReinhardToneMapping,
        options: TONE_MAPPING_OPTIONS,
      },

      tone_exposure: {
        label: 'exposure',
        value: 1.5,
        min: 0,
        max: 5,
        step: 0.1,
      },
    },

    { collapsed: true, order: LEVA_SORT_ORDER.TONE_MAPPING }
  )

  return <>
    <Leva
      hidden={!debug_enabled}
      collapsed

      titleBar={{
        drag: false,
        title: 'DEBUG PANEL',
        filter: false,
      }}
    />

    <Canvas
      gl={{
        toneMapping: controls_gl.tone_mapping,
        toneMappingExposure: controls_gl.tone_exposure
      }}

      shadows={{
        enabled: false,
        type: THREE.PCFSoftShadowMap
      }}

      camera={{
        fov: CAMERA_DEFAULTS.fov,
        near: CAMERA_DEFAULTS.near,
        far: CAMERA_DEFAULTS.far,
        position: CAMERA_DEFAULTS.position
      }}
    >
      <Experience />
    </Canvas>

    <Footer />
  </>
}

export default App