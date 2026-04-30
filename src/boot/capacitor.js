import { boot } from 'quasar/wrappers'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export default boot(async () => {
  if (!Capacitor.isNativePlatform()) return

  document.body.classList.add('platform-capacitor')

  try {
    await StatusBar.setOverlaysWebView({ overlay: false })
    await StatusBar.setBackgroundColor({ color: '#120904' })
    await StatusBar.setStyle({ style: Style.Dark })
  } catch (error) {
    console.warn('[capacitor] No fue posible configurar StatusBar:', error)
  }
})
