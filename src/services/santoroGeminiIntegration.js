// 🧠 SANTORO GEMINI INTEGRATION - IA Súper Avanzada
// Integración completa con Google Gemini AI para comprensión avanzada

import axios from 'axios'

class SantoroGeminiIntegration {
    constructor() {
        this.apiKey = null
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        this.configurado = false
        this.contextoSistema = null
    }

    // 🔑 CONFIGURAR API KEY
    configurar(apiKey, contextoSistema) {
        this.apiKey = apiKey
        this.contextoSistema = contextoSistema
        this.configurado = !!apiKey

        console.log(this.configurado ? '✅ Gemini AI configurado' : '⚠️ Gemini AI no configurado')
        return this.configurado
    }

    // 🧠 PROCESAR COMANDO AVANZADO
    async procesarComandoAvanzado(comando, contexto = {}) {
        if (!this.configurado) {
            return await this.procesarComandoLocal(comando, contexto)
        }

        try {
            console.log('🧠 Procesando con Gemini AI:', comando)

            const prompt = this.construirPromptAvanzado(comando, contexto)
            const respuesta = await this.llamarGeminiAPI(prompt)

            return this.procesarRespuestaGemini(respuesta)

        } catch (error) {
            console.error('❌ Error con Gemini AI:', error)
            // Fallback a procesamiento local
            return await this.procesarComandoLocal(comando, contexto)
        }
    }

    // 📝 CONSTRUIR PROMPT AVANZADO
    construirPromptAvanzado(comando, contexto) {
        const sistemaInfo = this.contextoSistema || {
            nombre: 'Dashboard de Logs Santoro',
            capacidades: ['navegación', 'modales', 'búsquedas', 'exportación', 'análisis'],
            páginas: ['logs', 'estadísticas', 'eventos', 'diagnóstico'],
            datos: ['errores', 'usuarios', 'sesiones', 'eventos']
        }

        return `
Eres SANTORO, un asistente IA avanzado para el sistema "${sistemaInfo.nombre}".

CAPACIDADES DEL SISTEMA:
- Navegación: ${sistemaInfo.capacidades?.join(', ')}
- Páginas disponibles: ${sistemaInfo.páginas?.join(', ')}
- Tipos de datos: ${sistemaInfo.datos?.join(', ')}

CONTEXTO ACTUAL:
- Página: ${contexto.paginaActual || 'desconocida'}
- Usuario: ${contexto.usuario || 'anónimo'}
- Hora: ${new Date().toLocaleString()}

COMANDO DEL USUARIO: "${comando}"

INSTRUCCIONES:
1. Analiza el comando y determina la intención del usuario
2. Identifica qué acciones específicas necesitas ejecutar
3. Si hay ambigüedad, solicita clarificación
4. Responde de forma conversacional y útil

FORMATO DE RESPUESTA (JSON):
{
  "intencion": "tipo_de_accion",
  "confianza": 0.95,
  "acciones": [
    {
      "tipo": "navegar|modal|buscar|exportar|analizar",
      "destino": "página_o_modal",
      "parametros": {"clave": "valor"}
    }
  ],
  "respuesta_usuario": "Respuesta conversacional para el usuario",
  "aclaraciones": ["preguntas si hay dudas"],
  "datos_necesarios": ["qué información adicional necesitas"]
}

EJEMPLOS DE RESPUESTA:
- "abre diagnóstico" → {"intencion": "abrir_modal", "acciones": [{"tipo": "modal", "destino": "diagnostico"}]}
- "ve a estadísticas" → {"intencion": "navegar", "acciones": [{"tipo": "navegar", "destino": "estadisticas"}]}
- "busca error USR123" → {"intencion": "buscar", "acciones": [{"tipo": "buscar", "parametros": {"codigo": "USR123"}}]}

Responde SOLO con JSON válido, sin texto adicional.
        `
    }

    // 🌐 LLAMAR A GEMINI API
    async llamarGeminiAPI(prompt) {
        if (!this.apiKey) {
            throw new Error('API Key no configurada')
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3, // Menos creativo, más preciso
                topK: 10,
                topP: 0.8,
                maxOutputTokens: 1000,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }

        const response = await axios.post(
            `${this.baseURL}?key=${this.apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 segundos timeout
            }
        )

        return response.data
    }

    // 🔄 PROCESAR RESPUESTA DE GEMINI
    procesarRespuestaGemini(respuestaGemini) {
        try {
            // Extraer texto de la respuesta
            const contenido = respuestaGemini.candidates?.[0]?.content?.parts?.[0]?.text

            if (!contenido) {
                throw new Error('Respuesta vacía de Gemini')
            }

            // Intentar parsear JSON
            const respuestaJSON = JSON.parse(contenido)

            // Validar estructura
            if (!respuestaJSON.intencion || !respuestaJSON.respuesta_usuario) {
                throw new Error('Estructura de respuesta inválida')
            }

            return {
                exito: true,
                intencion: respuestaJSON.intencion,
                confianza: respuestaJSON.confianza || 0.8,
                acciones: respuestaJSON.acciones || [],
                respuesta: respuestaJSON.respuesta_usuario,
                aclaraciones: respuestaJSON.aclaraciones || [],
                datosNecesarios: respuestaJSON.datos_necesarios || [],
                fuente: 'gemini'
            }

        } catch (error) {
            console.error('Error procesando respuesta Gemini:', error)

            // Si no se puede parsear, usar procesamiento local
            return {
                exito: false,
                error: error.message,
                fallback: true
            }
        }
    }

    // 🔧 PROCESAMIENTO LOCAL (fallback)
    async procesarComandoLocal(comando, contexto) {
        console.log('🔧 Procesando comando localmente:', comando)

        const comandoLower = comando.toLowerCase()

        // Análisis básico de intenciones
        const analisis = {
            // Navegación
            navegar: this.detectarPatron(comandoLower, [
                've a', 'ir a', 'abre', 'muestra', 'navega', 'página', 'abrir'
            ]),

            // Modales
            modal: this.detectarPatron(comandoLower, [
                'modal', 'ventana', 'diálogo', 'popup', 'abre'
            ]),

            // Búsqueda
            buscar: this.detectarPatron(comandoLower, [
                'busca', 'buscar', 'encuentra', 'localiza', 'search'
            ]),

            // Exportar
            exportar: this.detectarPatron(comandoLower, [
                'exporta', 'exportar', 'descarga', 'guardar', 'export'
            ]),

            // Filtros
            filtrar: this.detectarPatron(comandoLower, [
                'filtra', 'filtrar', 'filter', 'fecha', 'período'
            ])
        }

        // Determinar intención principal
        const intencionPrincipal = Object.entries(analisis)
            .reduce((a, b) => analisis[a[0]] > analisis[b[0]] ? a : b)[0]

        // Generar respuesta según intención
        return await this.generarRespuestaLocal(intencionPrincipal, comando, contexto)
    }

    // 🎯 DETECTAR PATRONES EN TEXTO
    detectarPatron(texto, patrones) {
        let coincidencias = 0
        patrones.forEach(patron => {
            if (texto.includes(patron)) {
                coincidencias++
            }
        })
        return coincidencias
    }

    // 💬 GENERAR RESPUESTA LOCAL
    async generarRespuestaLocal(intencion, comando, contexto) {
        const comandoLower = comando.toLowerCase()

        switch (intencion) {
            case 'navegar':
                return await this.procesarNavegacionLocal(comandoLower, contexto)

            case 'modal':
                return await this.procesarModalLocal(comandoLower, contexto)

            case 'buscar':
                return await this.procesarBusquedaLocal(comandoLower, contexto)

            case 'exportar':
                return await this.procesarExportacionLocal(comandoLower, contexto)

            case 'filtrar':
                return await this.procesarFiltroLocal(comandoLower, contexto)

            default:
                return {
                    exito: true,
                    intencion: 'consulta_general',
                    respuesta: `Entiendo que quieres: "${comando}". ¿Puedes ser más específico? Puedo ayudarte con navegación, búsquedas, filtros y más.`,
                    acciones: [
                        { tipo: 'modal', destino: 'ayuda' }
                    ],
                    fuente: 'local'
                }
        }
    }

    // 🧭 PROCESAR NAVEGACIÓN LOCAL
    async procesarNavegacionLocal(comando) {
        const paginas = {
            'inicio': 'logs',
            'dashboard': 'logs',
            'logs': 'logs',
            'estadisticas': 'estadisticas',
            'eventos': 'eventos',
            'errores': 'eventos-fallidos',
            'diagnostico': 'diagnostico'
        }

        const paginaDetectada = Object.keys(paginas).find(p => comando.includes(p))

        if (paginaDetectada) {
            return {
                exito: true,
                intencion: 'navegar',
                acciones: [
                    { tipo: 'navegar', destino: paginas[paginaDetectada] }
                ],
                respuesta: `🧭 Perfecto, navegando a ${paginaDetectada}`,
                fuente: 'local'
            }
        }

        return {
            exito: true,
            intencion: 'navegar',
            respuesta: 'No pude identificar la página. Páginas disponibles: ' + Object.keys(paginas).join(', '),
            acciones: [],
            fuente: 'local'
        }
    }

    // 🎭 PROCESAR MODAL LOCAL
    async procesarModalLocal(comando) {
        const modales = {
            'diagnostico': 'diagnostico',
            'filtro': 'filtros',
            'busqueda': 'busqueda',
            'ayuda': 'ayuda',
            'exportar': 'exportar'
        }

        const modalDetectado = Object.keys(modales).find(m => comando.includes(m))

        if (modalDetectado) {
            return {
                exito: true,
                intencion: 'abrir_modal',
                acciones: [
                    { tipo: 'modal', destino: modales[modalDetectado] }
                ],
                respuesta: `🎭 Abriendo ${modalDetectado}`,
                fuente: 'local'
            }
        }

        return {
            exito: true,
            intencion: 'abrir_modal',
            respuesta: 'Modales disponibles: ' + Object.keys(modales).join(', '),
            acciones: [],
            fuente: 'local'
        }
    }

    // 🔍 PROCESAR BÚSQUEDA LOCAL
    async procesarBusquedaLocal(comando) {
        // Detectar códigos de error
        const codigoMatch = comando.match(/USR\d{11}(-\w+)?/i)

        if (codigoMatch) {
            return {
                exito: true,
                intencion: 'buscar_error',
                acciones: [
                    {
                        tipo: 'buscar',
                        parametros: { codigo: codigoMatch[0] }
                    }
                ],
                respuesta: `🔍 Buscando información del código ${codigoMatch[0]}`,
                fuente: 'local'
            }
        }

        return {
            exito: true,
            intencion: 'buscar',
            respuesta: 'Para buscar necesito un código específico (ej: USR02808190918)',
            acciones: [
                { tipo: 'modal', destino: 'busqueda' }
            ],
            fuente: 'local'
        }
    }

    // 📁 PROCESAR EXPORTACIÓN LOCAL
    async procesarExportacionLocal() {
        return {
            exito: true,
            intencion: 'exportar',
            acciones: [
                { tipo: 'modal', destino: 'exportar' }
            ],
            respuesta: '📁 Abriendo opciones de exportación',
            fuente: 'local'
        }
    }

    // 🔍 PROCESAR FILTRO LOCAL
    async procesarFiltroLocal() {
        return {
            exito: true,
            intencion: 'filtrar',
            acciones: [
                { tipo: 'modal', destino: 'filtros' }
            ],
            respuesta: '🔍 Abriendo filtros avanzados',
            fuente: 'local'
        }
    }

    // 📊 OBTENER ESTADÍSTICAS DE USO
    obtenerEstadisticas() {
        return {
            configurado: this.configurado,
            apiKey: !!this.apiKey,
            ultimaLlamada: this.ultimaLlamada || null,
            totalLlamadas: this.totalLlamadas || 0
        }
    }
}

// 🎯 Instancia global
export const santoroGeminiIntegration = new SantoroGeminiIntegration()
export default santoroGeminiIntegration
