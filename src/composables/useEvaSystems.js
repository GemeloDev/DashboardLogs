import authService from "src/services/authService";
import { useEvaStore } from "src/stores/eva-store";

export async function loadEvaSystems() {
    const eva = useEvaStore()

    try {
      const user = authService.user
      const authz = user?.authz || {}
      const orgWide = authz.orgWide === true
      const systems = authz.systems || []

      // Usuario con sistemas restringidos - usar solo los suyos
      if (!orgWide && systems.length > 0) {
        eva.setAvailableSystems(systems)
        return systems
      }

      // Usuario con sistemas globales - usar todos
      const { EvaService } = await import('src/services/eva.service')
      const res = await EvaService.getSystems({ limit: 100 })
      const payload = res?.data?.data || []
      eva.setAvailableSystems(payload)
      return payload
    } catch (error) {
        console.warn('[useEvaSystems] Error cargando systems dinámicos de Eva:', error)

        const systems = authService.user?.authz?.systems || []
        if (systems.length) eva.setAvailableSystems(systems)
        return []
    }
}
