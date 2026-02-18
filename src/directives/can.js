import authService from "src/services/authService"

export default {
  mounted(el, binding) {
    const allowed = authService.can(binding.value)
    if (!allowed) el.style.display = 'none'
  },
  updated(el, binding) {
    const allowed = authService.can(binding.value)
    el.style.display = allowed ? '' : 'none'
  },
}
