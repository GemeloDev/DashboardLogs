import { defineStore } from 'pinia'

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

export const useEvaStore = defineStore('eva', {
    state: () => ({
        isWidgetOpen: false,
        isWorkspaceOpen: false,
        isListening: false,
        loading: false,

        selectedSystem: null,
        selectedTz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        selectedGranularity: 'daily',
        selectedDays: 30,
        selectedHours: 24,

        availableSystem: [],

        lastContex: {
            intent: null,
            system: null,
            granularity: null,
            days: null,
            hours: null
        },

        currentConversationId: 'conv-welcome',

        conversations: [
            {
                id: 'conv-welcome',
                title: 'Bienvenida Eva',
                createdAt: new Date().toISOString(),
                system: null,
                range: null,
                messages: [
                    {
                        id: uid(),
                        role: 'assistant',
                        type: 'text',
                        content:
                            'Hola, soy Eva. Estoy lista para ayudarte con alertas, gráficas, tendencias, métricas y resumenes diarios de los sistemas.',
                        createdAt: new Date().toISOString()
                    }
                ]
            }
        ],
        quickActions: [
            { key: 'daily-summary', label: 'Resumen diario', icon: 'summarize' },
            { key: 'open-alerts', label: 'Alertas abiertas', icon: 'warning' },
            { key: 'metrics-chart', label: 'Gráfica por system', icon: 'insights' },
        ],
        contextPanel: {
            mode: 'empty', // 'empty', 'alert', 'insight', 'ticket'
            title: 'Contexto',
            payload: null
        }
    }),

    getters: {
        currentConversation(state) {
            return (
                state.conversations.find(c => c.id === state.currentConversationId) ||
                state.conversations[0]
            )
        },

        systemOptions(state) {
            return (state.availableSystem || []).map(item =>
                typeof item === 'string' ? item : item?.name
            ).filter(Boolean)
        },
    },

    actions: {
        toggleWidget() {
            this.isWidgetOpen = !this.isWidgetOpen
        },

        openWidget() {
            this.isWidgetOpen = true
        },

        closeWidget() {
            this.isWidgetOpen = false
        },

        openWorkspace() {
            this.isWorkspaceOpen = true
            this.isWidgetOpen = false
        },

        closeWorkspace() {
            this.isWorkspaceOpen = false
        },

        setLoading(value) {
            this.loading = value
        },

        setListening(value) {
            this.isListening = value
        },

        setSelectedSystem(system) {
            this.selectedSystem = system || null
        },

        setSelectedGranularity(value) {
            this.selectedGranularity = value
        },

        setSelectedDays(value) {
            this.selectedDays = value
        },

        setSelectedHours(value) {
            this.selectedHours = value
        },

        setSelectedTz(value) {
            this.selectedTz = value
        },

        setAvailableSystems(systems) {
            const normalized = Array.isArray(systems)
                ? systems
                    .map(item => {
                        if (typeof item === 'string') {
                            return { name: item, count: 0 }
                        }
                        if (item?.name) {
                            return {
                                name: String(item.name).trim(),
                                count: Number(item.count || 0)
                            }
                        }
                        return null
                    })
                    .filter(Boolean)
                : []

            this.availableSystem = normalized

            // Si no hay system seleccionado o ya no existe, usar el primero disponible
            const names = normalized.map(x => x.name)
            if (!this.selectedSystem || !names.includes(this.selectedSystem)) {
                this.selectedSystem = names[0] || null
            }
        },

        setLastContext(ctx = {}) {
            this.lastContex = {
                intent: ctx.intent ?? this.lastContex.intent,
                system: ctx.system ?? this.lastContex.system,
                granularity: ctx.granularity ?? this.lastContex.granularity,
                days: ctx.days ?? this.lastContex.days,
                hours: ctx.hours ?? this.lastContex.hours
            }
        },

        clearLastContext() {
            this.lastContex = {
                intent: null,
                system: null,
                granularity: null,
                days: null,
                hours: null
            }
        },

        newConversation(title = 'Nueva conversación') {
            const conv = {
                id: `conv-${uid()}`,
                title,
                createdAt:  new Date().toISOString(),
                system: null,
                range: null,
                messages: [
                    {
                        id: uid(),
                        role: 'assistant',
                        type: 'text',
                        content: 'Nueva conversación iniciada. ¿Qué deseas analizar?',
                        createdAt: new Date().toISOString()
                    }
                ]
            }

            this.conversations.unshift(conv)
            this.currentConversationId = conv.id
            return conv
        },

        selectConversation(id) {
            this.currentConversationId = id
        },

        addUserMessage(content) {
            if (!content || !String(content).trim()) return

            if (!this.currentConversationId) {
                this.currentConversationId = this.conversations[0]?.id || null
            }
            if (!this.currentConversationId) return

            const conv = this.conversations.find(c => c.id === this.currentConversationId)
            if (!conv) return

            conv.messages = [
                ...conv.messages,
                {
                    id: uid(),
                    role: 'user',
                    type: 'text',
                    content: String(content).trim(),
                    createdAt: new Date().toISOString()
                }
            ]
        },

        addAssistantMessage(content, type = 'text', extra = {}) {
            if (!this.currentConversationId) {
                this.currentConversationId = this.conversations[0]?.id || null
            }
            if (!this.currentConversationId) return

            const conv = this.conversations.find(c => c.id === this.currentConversationId)
            if (!conv) return

            conv.messages = [
                ...conv.messages,
                {
                    id: uid(),
                    role: 'assistant',
                    type,
                    content,
                    createdAt: new Date().toISOString(),
                    ...extra
                }
            ]
        },

        // ─────────────────────────────────────────────────────────────────────────────
        // AGREGA ESTOS 3 MÉTODOS dentro del bloque actions: { ... } de eva-store.js
        // ─────────────────────────────────────────────────────────────────────────────

        // 1. Crea una burbuja vacía marcada como "streaming" y devuelve su id
        addStreamingMessage(type = 'text') {
            if (!this.currentConversationId) return null
            const conv = this.conversations.find(c => c.id === this.currentConversationId)
            if (!conv) return null

            const id = uid()
            conv.messages = [
                ...conv.messages,
                {
                    id,
                    role:       'assistant',
                    type,
                    content:    '',          // vacío — se llena con chunks
                    streaming:  true,        // flag para mostrar cursor parpadeante
                    createdAt:  new Date().toISOString()
                }
            ]
            return id
        },

        // 2. Agrega texto al mensaje que está en streaming
        appendStreamingChunk(msgId, chunk) {
            if (!this.currentConversationId || !msgId) return
            const conv = this.conversations.find(c => c.id === this.currentConversationId)
            if (!conv) return

            const msg = conv.messages.find(m => m.id === msgId)
            if (!msg) return

            msg.content += chunk
        },

        // 3. Marca el mensaje como finalizado (quita el cursor)
        finalizeStreamingMessage(msgId) {
            if (!this.currentConversationId || !msgId) return
            const conv = this.conversations.find(c => c.id === this.currentConversationId)
            if (!conv) return

            const msg = conv.messages.find(m => m.id === msgId)
            if (!msg) return

            msg.streaming = false
        },

        renameCurrentConversation(title) {
            const conv = this.conversations.find(c => c.id === this.currentConversationId)
            if (!conv) return
            conv.title = title
        },

        setContextPanel(mode, title, payload = null) {
            this.contextPanel = {
                mode,
                title,
                payload
            }
        },

        clearContextPanel() {
            this.contextPanel = {
                mode: 'empty',
                title: 'Contexto',
                payload: null
            }
        }
    }
})
