import { EvaService } from "src/services/eva.service";
import { useEvaStore } from "src/stores/eva-store";

export async function loadEvaSystems() {
    const eva = useEvaStore()

    try {
        const res = await EvaService.getSystems({ limit: 100 })
        const payload = res?.data?.data || []
        eva.setAvailableSystems(payload)
        return payload
    } catch (error) {
        console.log('Error cargando systems dinámicos de Eva:', error)
        return []
    }
}