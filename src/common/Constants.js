import * as THREE from 'three'

const LEVA_SORT_ORDER = {
  TONE_MAPPING: 0,
  CAMERA: 1,
  LIGHTING: 2
}

const TONE_MAPPING_OPTIONS = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
}

const CAMERA_DEFAULTS = {
  fov: 45,
  near: 0.5,
  far: 60,
  position: [5.2, 1.5, 5.0],
  look_at: [0, 1, 0],
  leva_min_max: 100
}

const LIGHTING_DEFAULTS = {
  ambient_intensity: 0.5,
  ambient_color: '#ffffff',

  directional_intensity: 1.0,
  directional_position: [1, 4.0, 1],
  directional_target: [0, 0, 0],
  directional_color: '#ffffff',
  leva_min_max: 100,

  shadow_near: 2,
  shadow_far: 6.5,
  shadow_map_size: [256, 256],
  shadow_left: -5,
  shadow_right: 5,
  shadow_top: 5,
  shadow_bottom: -5,
  shadow_color: '#000000',
  shadow_opacity: 0.5
}

export {
  TONE_MAPPING_OPTIONS,
  CAMERA_DEFAULTS,
  LIGHTING_DEFAULTS,
  LEVA_SORT_ORDER
}