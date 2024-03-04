import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const ANIMATION_STATE = {
  HIDDEN: 0,
  VISIBLE: 1,
  ANIMATING_TO_HIDE: 2,
  ANIMATING_TO_VISIBLE: 3
}

const useStateAnimation = create(
  subscribeWithSelector(
    set => ({
      /** PROPERTIES */
      /** METHODS */
    })
  )
)

export { ANIMATION_STATE, useStateAnimation }