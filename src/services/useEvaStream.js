/**
 * useEvaStream.js
 * Composable SSE para Eva usando fetch + ReadableStream.
 *
 * ¿Por qué fetch y no EventSource?
 * EventSource NO permite headers custom — el Bearer token nunca llegaría
 * al backend y Spring Security respondería 401. fetch sí los soporta.
 *
 * Uso:
 *   const { streamMessage, isStreaming, cancel } = useEvaStream()
 *   await streamMessage({ message: 'resumen diario', system: 'TICKETS' })
 */

import { ref } from 'vue'
import { useEvaStore } from 'src/stores/eva-store'
import { useAuthStore } from 'src/stores/auth'   // ← ajusta al nombre real de tu auth store

const API_BASE = '/api/ai/eva/stream'

export function useEvaStream() {
    const eva         = useEvaStore()
    const auth        = useAuthStore()
    const isStreaming = ref(false)

    // AbortController para cancelar el fetch activo
    let controller = null

    /**
     * Inicia el streaming SSE con Bearer token en el header.
     *
     * @param {Object} params
     * @param {string} params.message
     * @param {string} [params.system]
     * @param {string} [params.granularity]
     * @param {number} [params.days]
     * @param {number} [params.hours]
     * @param {string} [params.tz]
     * @param {string} [params.type]  - tipo de burbuja: 'text' | 'insight' | etc.
     */
    async function streamMessage(params) {
        if (isStreaming.value) cancel()

        const {
            message,
            system      = eva.selectedSystem,
            granularity = eva.selectedGranularity,
            days        = eva.selectedDays,
            hours       = eva.selectedHours,
            tz          = eva.selectedTz,
            type        = 'text'
        } = params

        // Crear burbuja vacía en el store — se llenará con chunks
        const msgId = eva.addStreamingMessage(type)

        isStreaming.value = true
        eva.setLoading(true)

        controller = new AbortController()

        const url = buildUrl(API_BASE, { message, system, granularity, days, hours, tz })

        // ── Token Bearer ──────────────────────────────────────────────────────
        // Ajusta según cómo guardas el token en tu auth store.
        // Opciones comunes:
        //   auth.accessToken
        //   auth.token
        //   auth.user?.accessToken
        //   localStorage.getItem('accessToken')
        const token = auth.accessToken ?? auth.token ?? null

        try {
            const response = await fetch(url, {
                method:  'GET',
                signal:  controller.signal,
                headers: {
                    'Accept':        'text/event-stream',
                    'Cache-Control': 'no-cache',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            })

            if (!response.ok) {
                const msg = response.status === 401
                    ? 'No autorizado — verifica tu sesión.'
                    : `Error del servidor (${response.status}).`
                throw new Error(msg)
            }

            // ── Leer el stream línea a línea ──────────────────────────────────
            await readSseStream(response.body, msgId)

        } catch (err) {
            if (err.name === 'AbortError') {
                // Cancelación manual — no es un error
            } else {
                console.error('[useEvaStream] error:', err)
                eva.appendStreamingChunk(msgId, `\n\n_${err.message}_`)
            }
        } finally {
            eva.finalizeStreamingMessage(msgId)
            cleanup()
        }
    }

    /**
     * Lee el ReadableStream del body SSE y despacha cada evento al store.
     * Protocolo SSE: líneas "event: X\ndata: Y\n\n"
     */
    async function readSseStream(body, msgId) {
        const reader  = body.getReader()
        const decoder = new TextDecoder()
        let   buffer  = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Procesar bloques completos separados por \n\n
            const blocks = buffer.split('\n\n')
            buffer = blocks.pop() ?? ''   // el último puede estar incompleto

            for (const block of blocks) {
                const event = parseSseBlock(block)
                if (!event) continue

                if (event.name === 'chunk') {
                    eva.appendStreamingChunk(msgId, event.data)
                } else if (event.name === 'done') {
                    return   // fin limpio
                } else if (event.name === 'error') {
                    throw new Error(event.data || 'Error del servidor.')
                }
            }
        }
    }

    /**
     * Parsea un bloque SSE en { name, data }.
     * Formato esperado:
     *   event: chunk
     *   data: texto parcial
     */
    function parseSseBlock(block) {
        let name = 'message'
        let data = ''

        for (const line of block.split('\n')) {
            if (line.startsWith('event:')) {
                name = line.slice('event:'.length).trim()
            } else if (line.startsWith('data:')) {
                data = line.slice('data:'.length).trim()
            }
        }

        return data ? { name, data } : null
    }

    function cancel() {
        controller?.abort()
        controller = null
        cleanup()
    }

    function cleanup() {
        isStreaming.value = false
        eva.setLoading(false)
        controller = null
    }

    return { streamMessage, isStreaming, cancel }
}

// ── helper URL ────────────────────────────────────────────────────────────────

function buildUrl(base, params) {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined && v !== '') {
            q.set(k, String(v))
        }
    }
    return `${base}?${q.toString()}`
}