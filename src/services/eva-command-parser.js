export function parseEvaCommand(text) {
    if (!text) return null

    const input = text.toLowerCase().trim()

    // RESUMEN
    if (
        input.includes("resumen") ||
        input.includes("daily")
    ) {
        return {
        action: "daily-summary"
        }
    }

    // ALERTAS
    if (
        input.includes("alerta") ||
        input.includes("alertas")
    ) {
        return {
        action: "open-alerts"
        }
    }

    // TENDENCIAS
    if (
        input.includes("tendencia") ||
        input.includes("trend")
    ) {
        return {
        action: "trends"
        }
    }

    // GRAFICAS
    if (
        input.includes("grafica") ||
        input.includes("gráfica") ||
        input.includes("chart")
    ) {

        let system = null

        if (input.includes("tickets")) {
        system = "TICKETS"
        }

        if (input.includes("lector")) {
        system = "LECTOR GRUPO SANTORO"
        }

        if (input.includes("trust")) {
        system = "TRUSTVALUE"
        }

        if (input.includes("biometr")) {
        system = "LECTOR BIOMETRICO"
        }

        // detectar rango
        let days = null
        let hours = null

        const daysMatch = input.match(/(\d+)\s*d/i)
        const hoursMatch = input.match(/(\d+)\s*h/i)

        if (daysMatch) {
        days = Number(daysMatch[1])
        }

        if (hoursMatch) {
        hours = Number(hoursMatch[1])
        }

        return {
        action: "metrics-chart",
        system,
        days,
        hours
        }
    }

    return null
}