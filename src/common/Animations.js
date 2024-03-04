import anime from 'animejs'

const
  wall = {
    NORTH: {
      show: ({ target }) => {
        const animation = anime({
          targets: target,
          opacity: 1,
          duration: 500,

          update: () => {
            target.traverse(child => {
              if (child.isMesh) {
                child.material.opacity = target.opacity
              }
            })
          }
        })

        return animation
      },

      hide: ({ target }) => {
        const animation = anime({
          targets: target,
          opacity: 0,
          duration: 500,

          update: () => {
            target.traverse(child => {
              if (child.isMesh) {
                child.material.opacity = target.opacity
              }
            })
          }
        })

        return animation
      }
    }
  }

const ANIMATIONS = {
  wall
}

export { ANIMATIONS }