// src/directives/v-swipe.js
export default {
  mounted(el, binding) {
    let startX = 0
    let startY = 0

    el.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    })

    el.addEventListener("touchend", (e) => {
      const deltaX = e.changedTouches[0].clientX - startX
      const deltaY = e.changedTouches[0].clientY - startY

      let direction = null
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) direction = "right"
        else if (deltaX < -30) direction = "left"
      } else {
        if (deltaY > 30) direction = "down"
        else if (deltaY < -30) direction = "up"
      }

      if (direction && typeof binding.value === "function") {
        binding.value(direction)
      }
    })
  }
}
