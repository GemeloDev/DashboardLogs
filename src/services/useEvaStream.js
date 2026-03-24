/**
 * useEvaStream.js
 * Composable SSE para Eva usando fetch + ReadableStream.
 */

import { ref } from 'vue'
import { useEvaStore } from 'src/stores/eva-store'
import { useAuthStore } from 'src/stores/auth'

const API_BASE = '/api/ai/eva/stream'

export function useEvaStream() {
    const eva         = useEvaStore()
    const auth        = useAuthStore()
    const isStreaming = ref(false)

    let controller = null

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

        const msgId = eva.addStreamingMessage(type)

        isStreaming.value = true
        eva.setLoading(true)

        controller = new AbortController()

        const url = buildUrl(API_BASE, { message, system, granularity, days, hours, tz })

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

            await readSseStream(response.body, msgId)

        } catch (err) {
            if (err.name === 'AbortError') {
                // Cancelación manual
            } else {
                console.error('[useEvaStream] error:', err)
                eva.appendStreamingChunk(msgId, `\n\n_${err.message}_`)
            }
        } finally {
            eva.finalizeStreamingMessage(msgId)
            cleanup()
        }
    }

    async function readSseStream(body, msgId) {
        const reader  = body.getReader()
        const decoder = new TextDecoder()
        let   buffer  = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            const blocks = buffer.split('\n\n')
            buffer = blocks.pop() ?? ''

            for (const block of blocks) {
                const event = parseSseBlock(block)
                if (!event) continue

                if (event.name === 'chunk') {
                    eva.appendStreamingChunk(msgId, event.data)
                } else if (event.name === 'done') {
                    return
                } else if (event.name === 'error') {
                    throw new Error(event.data || 'Error del servidor.')
                }
            }
        }
    }

    /**
     * Parsea un bloque SSE acumulando TODAS las líneas data:.
     * Esto soporta texto con saltos de línea correctamente.
     * El spec SSE dice que múltiples data: se unen con \n.
     */
    function parseSseBlock(block) {
        let name      = 'message'
        let dataLines = []

        for (const line of block.split('\n')) {
            if (line.startsWith('event:')) {
                name = line.slice('event:'.length).trim()
            } else if (line.startsWith('data:')) {
                // Quitar solo el espacio inmediato tras "data:" — NO .trim() completo
                const raw = line.slice('data:'.length)
                dataLines.push(raw.startsWith(' ') ? raw.slice(1) : raw)
            }
        }

        const data = dataLines.join('\n')
        return data.length > 0 ? { name, data } : null
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

function buildUrl(base, params) {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined && v !== '') {
            q.set(k, String(v))
        }
    }
    return `${base}?${q.toString()}`
}
