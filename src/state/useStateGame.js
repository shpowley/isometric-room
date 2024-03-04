import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useStateGame = create(
  subscribeWithSelector(
    set => ({
      /** PROPERTIES */
      controls: null, // ORBIT CONTROLS, ETC

      /** METHODS */
      setControls: controls => set({ controls }),
    })
  )
)

export { useStateGame}