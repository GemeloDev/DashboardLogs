// src/boot/pinia.js
import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import can from 'src/directives/can'

export default boot(({ app }) => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  app.directive('can', can)
})
