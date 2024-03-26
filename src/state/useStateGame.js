import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const DOOR_STATE = {
  OPENING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

const useStateGame = create(
  subscribeWithSelector(
    set => ({
      /** PROPERTIES */
      controls: null, // ORBIT CONTROLS or similar
      door_west_state: DOOR_STATE.CLOSED,
      door_north_state: DOOR_STATE.CLOSED,

      /** METHODS */
      setControls: controls => set({ controls }),
      setDoorWestState: new_state => set({ door_west_state: new_state }),
      setDoorNorthState: new_state => set({ door_north_state: new_state })
    })
  )
)

export { useStateGame, DOOR_STATE }