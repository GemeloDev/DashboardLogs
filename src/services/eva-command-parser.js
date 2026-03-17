// ---------------------------------------------------------------------------
// Intents — cada entrada tiene: keywords para match y la acción resultante
// ---------------------------------------------------------------------------
const INTENTS = [
    {
        action: 'daily-summary',
        patterns: [
            /\bresumen\b/, /\bdaily\b/, /\bsummary\b/, /\bejecutivo\b/,
            /\binforme\b/, /\bdiario\b/, /\binsight\b/, /\bcomo\s+va\b/,
            /\bqu[eé]\s+pas[oó]\b/, /\bnovedades\b/, /\bqu[eé]\s+hay\b/
        ]
    },
    {
        action: 'open-alerts',
        patterns: [
            /\balerta(s)?\b/, /\bincidente(s)?\b/, /\bwarning(s)?\b/,
            /\berror(es)?\b/, /\bfallo(s)?\b/, /\bcritic(o|a)(s)?\b/,
            /\bproblema(s)?\b/, /\bfalla(s)?\b/
        ]
    },
    {
        action: 'metrics-chart',
        patterns: [
            /\bgr[aá]fica(s)?\b/, /\bchart(s)?\b/, /\bm[eé]trica(s)?\b/,
            /\bserie(s)?\b/, /\bevolución\b/, /\btendencia visual\b/,
            /\bvisualiz\b/, /\bplot\b/, /\bgraph\b/
        ]
    },
    {
        action: 'trends',
        patterns: [
            /\btendencia(s)?\b/, /\btrend(s)?\b/, /\bhistórico\b/,
            /\bc[oó]mo ha evolucionado\b/, /\ba lo largo\b/
        ]
    },
    {
        action: 'tickets',
        patterns: [
            /\bticket(s)?\b/, /\bbug(s)?\b/, /\btarea(s)?\b/,
            /\bincidencia(s)?\b/, /\bborrador(es)?\b/, /\bjira\b/,
            /\bcrear?\s+ticket\b/
        ]
    }
]

// ---------------------------------------------------------------------------
// Rangos temporales — expresiones naturales en español e inglés
// ---------------------------------------------------------------------------
const RANGE_PATTERNS = [
    // "últimos 7 días", "last 7 days", "7d", "7 días"
    { re: /[uú]ltimos?\s+(\d+)\s*d[ií]as?/i,  type: 'days'  },
    { re: /last\s+(\d+)\s*days?/i,              type: 'days'  },
    { re: /(\d+)\s*d[ií]as?/i,                  type: 'days'  },
    { re: /(\d+)\s*d\b/i,                        type: 'days'  },

    // "últimas 24 horas", "24h", "24 horas"
    { re: /[uú]ltimas?\s+(\d+)\s*horas?/i,      type: 'hours' },
    { re: /last\s+(\d+)\s*hours?/i,              type: 'hours' },
    { re: /(\d+)\s*horas?/i,                     type: 'hours' },
    { re: /(\d+)\s*h\b/i,                        type: 'hours' },

    // expresiones semánticas → días fijos
    { re: /\bhoy\b/i,                            type: 'days', value: 1   },
    { re: /\bayer\b/i,                           type: 'days', value: 2   },
    { re: /esta\s+semana/i,                      type: 'days', value: 7   },
    { re: /[uú]ltima\s+semana/i,                 type: 'days', value: 7   },
    { re: /[uú]ltimo\s+mes/i,                    type: 'days', value: 30  },
    { re: /este\s+mes/i,                         type: 'days', value: 30  },
    { re: /[uú]ltimos?\s+3\s*meses/i,            type: 'days', value: 90  },
]

// ---------------------------------------------------------------------------
// Granularidad
// ---------------------------------------------------------------------------
const GRANULARITY_PATTERNS = [
    { re: /\bpor\s+hora(s)?\b|\bhourly\b|\bhor(ario|al)\b/i, value: 'hourly' },
    { re: /\bdiario\b|\bdaily\b|\bpor\s+d[ií]a\b/i,          value: 'daily'  },
]

// ---------------------------------------------------------------------------
// Continuidad contextual — frases que heredan el contexto anterior
// ---------------------------------------------------------------------------
const CONTEXT_INHERIT_PATTERNS = [
    /\bmismo\s+sistema\b/i,
    /\bigual\b/i,
    /\btambi[eé]n\b/i,
    /\bahora\b/i,
    /\by\s+(el|la|los|las)\b/i,
    /\bdel\s+mismo\b/i,
    /\bpero\s+(con|en)\b/i,
    /\bcambia\b/i,
    /\bactualiza\b/i,
]

// ---------------------------------------------------------------------------
// Normalización de texto
// ---------------------------------------------------------------------------
function normalize(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar tildes para matching
        .trim()
}

// ---------------------------------------------------------------------------
// Detección de intent — devuelve la acción con más matches
// ---------------------------------------------------------------------------
function detectIntent(input) {
    let best = null
    let bestScore = 0

    for (const intent of INTENTS) {
        let score = 0
        for (const pattern of intent.patterns) {
            if (pattern.test(input)) score++
        }
        if (score > bestScore) {
            bestScore = score
            best = intent.action
        }
    }

    return best ? { action: best, score: bestScore } : null
}

// ---------------------------------------------------------------------------
// Detección de rango temporal
// ---------------------------------------------------------------------------
function detectRange(input) {
    for (const p of RANGE_PATTERNS) {
        const m = input.match(p.re)
        if (m) {
            const value = p.value ?? Number(m[1])
            if (!isNaN(value) && value > 0) {
                return { type: p.type, value }
            }
        }
    }
    return null
}

// ---------------------------------------------------------------------------
// Detección de granularidad
// ---------------------------------------------------------------------------
function detectGranularity(input) {
    for (const p of GRANULARITY_PATTERNS) {
        if (p.re.test(input)) return p.value
    }
    return null
}

// ---------------------------------------------------------------------------
// Detección dinámica de sistema
// Estrategia: exact match → startsWith → includes → fuzzy (token)
// ---------------------------------------------------------------------------
function detectSystem(input, availableSystems = []) {
    if (!availableSystems.length) return null

    const normalizedInput = normalize(input)

    // 1. Exact match (case-insensitive, sin tildes)
    for (const sys of availableSystems) {
        if (normalize(sys.name) === normalizedInput) return sys.name
    }

    // 2. Input contiene el nombre completo del sistema
    for (const sys of availableSystems) {
        const sysNorm = normalize(sys.name)
        if (normalizedInput.includes(sysNorm)) return sys.name
    }

    // 3. Nombre del sistema está en el input (cualquier token)
    for (const sys of availableSystems) {
        const sysNorm = normalize(sys.name)
        if (normalizedInput.includes(sysNorm)) return sys.name
    }

    // 4. Fuzzy: algún token del sistema aparece en el input
    for (const sys of availableSystems) {
        const tokens = normalize(sys.name).split(/[\s_-]+/).filter(t => t.length >= 3)
        for (const token of tokens) {
            if (normalizedInput.includes(token)) return sys.name
        }
    }

    return null
}

// ---------------------------------------------------------------------------
// Detecta si el usuario quiere heredar el contexto anterior
// ---------------------------------------------------------------------------
function wantsContextInheritance(input) {
    return CONTEXT_INHERIT_PATTERNS.some(p => p.test(input))
}

// ---------------------------------------------------------------------------
// Determina confianza del resultado
// ---------------------------------------------------------------------------
function computeConfidence(intentScore, system, range, inheritingContext) {
    if (intentScore >= 2) return 'high'
    if (intentScore === 1 && (system || range || inheritingContext)) return 'medium'
    if (intentScore === 1) return 'medium'
    return 'low'
}

// ---------------------------------------------------------------------------
// API PÚBLICA
// ---------------------------------------------------------------------------

/**
 * Parsea un mensaje de texto libre y devuelve un comando estructurado.
 *
 * @param {string} text - Mensaje del usuario
 * @param {Object} context - Contexto actual del store
 * @param {Array}  context.availableSystems   - [{ name, count }]
 * @param {string} context.lastIntent         - Último intent ejecutado
 * @param {string} context.lastSystem         - Último sistema usado
 * @param {string} context.lastGranularity    - Última granularidad
 * @param {number} context.lastDays           - Últimos días usados
 * @param {number} context.lastHours          - Últimas horas usadas
 * @returns {EvaCommand | null}
 */
export function parseEvaCommand(text, context = {}) {
    if (!text?.trim()) return null

    const raw     = text.trim()
    const input   = normalize(raw)
    const {
        availableSystems = [],
        lastIntent       = null,
        lastSystem       = null,
        lastGranularity  = null,
        lastDays         = null,
        lastHours        = null,
    } = context

    // ── 1. Detectar intent ──────────────────────────────────────────────────
    const intentResult = detectIntent(input)

    // ── 2. Detectar si hereda contexto ──────────────────────────────────────
    const inheriting = wantsContextInheritance(input)

    // ── 3. Si no hay intent claro pero sí contexto heredable → usar último ──
    if (!intentResult && !inheriting) return null

    const action = intentResult?.action ?? lastIntent ?? null
    if (!action) return null

    // ── 4. Detectar sistema (dinámico) con fallback al contexto ─────────────
    const detectedSystem = detectSystem(input, availableSystems)
    const system = detectedSystem ?? (inheriting ? lastSystem : null)

    // ── 5. Detectar rango temporal con fallback al contexto ─────────────────
    const range = detectRange(input)
    const days  = range?.type === 'days'  ? range.value : (inheriting ? lastDays  : null)
    const hours = range?.type === 'hours' ? range.value : (inheriting ? lastHours : null)

    // ── 6. Detectar granularidad con fallback al contexto ───────────────────
    const detectedGranularity = detectGranularity(input)
    const granularity = detectedGranularity
        ?? (hours ? 'hourly' : null)
        ?? (days  ? 'daily'  : null)
        ?? (inheriting ? lastGranularity : null)

    // ── 7. Confianza ─────────────────────────────────────────────────────────
    const confidence = computeConfidence(intentResult?.score ?? 0, system, range, inheriting)

    return {
        action,
        system,
        days,
        hours,
        granularity,
        confidence,
        _raw: raw,
        _inherited: inheriting
    }
}

/**
 * Extrae el contexto del store de Eva para pasárselo al parser.
 * Uso: parseEvaCommand(text, extractContext(evaStore))
 */
export function extractContext(evaStore) {
    return {
        availableSystems: evaStore.availableSystem ?? [],
        lastIntent:       evaStore.lastContex?.intent       ?? null,
        lastSystem:       evaStore.lastContex?.system       ?? evaStore.selectedSystem ?? null,
        lastGranularity:  evaStore.lastContex?.granularity  ?? evaStore.selectedGranularity ?? null,
        lastDays:         evaStore.lastContex?.days         ?? evaStore.selectedDays ?? null,
        lastHours:        evaStore.lastContex?.hours        ?? evaStore.selectedHours ?? null,
    }
}