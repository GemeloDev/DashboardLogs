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

        selectedSystem: 'TICKETS',
        selectedTz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        selectedGranularity: 'daily',
        selectedDays: 30,
        selectedHours: 24,

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
                            'Hola, soy Eva. Estoy lista para ayudarte con alertas, insights, tendencias, métricas y borradores de tickets.',
                        createdAt: new Date().toISOString()
                    }
                ]
            }
        ],
        quickActions: [
            { key: 'daily-summary', label: 'Resumen diario', icon: 'summarize' },
            { key: 'open-alerts', label: 'Alertas abiertas', icon: 'warning' },
            { key: 'trends', label: 'Tendencias', icon: 'show_chart' },
            { key: 'ticket-draft', label: 'Ticket draft', icon: 'assignment' },
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
        }
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
            this.selectedSystem = system
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
                    content,
                    createdAt: new Date().toString()
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