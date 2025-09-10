<!-- Guía de Uso del Asistente IA Santoro -->
<template>
  <q-dialog v-model="mostrarGuia" maximized class="guia-asistente-dialog">
    <q-card class="bg-dark text-white guia-card">
      <!-- Header -->
      <q-card-section class="bg-primary text-center q-pa-lg">
        <div class="text-h3 q-mb-md">🤖 Asistente IA Santoro</div>
        <div class="text-h6 text-weight-light">
          Guía completa para usar el asistente de manera intuitiva
        </div>
      </q-card-section>

      <!-- Contenido principal -->
      <q-card-section class="q-pa-xl">
        <div class="row q-col-gutter-xl">
          <!-- Columna izquierda - Comandos básicos -->
          <div class="col-12 col-md-6">
            <div class="seccion-guia">
              <h4 class="text-h5 text-primary q-mb-md">
                <q-icon name="chat" class="q-mr-sm" />
                Comandos de Voz Básicos
              </h4>

              <div class="comando-grupo q-mb-lg">
                <h5 class="text-h6 text-secondary">🧭 Navegación</h5>
                <div class="comandos-lista">
                  <div class="comando-item">
                    <q-chip color="positive" text-color="white" icon="mic">
                      "Abre estadísticas"
                    </q-chip>
                    <span class="comando-desc">Navega a la página de estadísticas</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="positive" text-color="white" icon="mic">
                      "Ir a diagnóstico"
                    </q-chip>
                    <span class="comando-desc">Abre el módulo de diagnóstico</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="positive" text-color="white" icon="mic">
                      "Mostrar eventos"
                    </q-chip>
                    <span class="comando-desc">Va a la página de eventos</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="positive" text-color="white" icon="mic">
                      "Abrir consola"
                    </q-chip>
                    <span class="comando-desc">Abre la consola de logs</span>
                  </div>
                </div>
              </div>

              <div class="comando-grupo q-mb-lg">
                <h5 class="text-h6 text-secondary">📊 Visualización</h5>
                <div class="comandos-lista">
                  <div class="comando-item">
                    <q-chip color="info" text-color="white" icon="mic">
                      "Cambiar a vista móvil"
                    </q-chip>
                    <span class="comando-desc">Cambia al flujo móvil</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="info" text-color="white" icon="mic">
                      "Cambiar a escritorio"
                    </q-chip>
                    <span class="comando-desc">Cambia al flujo de escritorio</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="info" text-color="white" icon="mic"> "Mostrar gráficos" </q-chip>
                    <span class="comando-desc">Muestra las visualizaciones</span>
                  </div>
                </div>
              </div>

              <div class="comando-grupo q-mb-lg">
                <h5 class="text-h6 text-secondary">🔍 Filtros</h5>
                <div class="comandos-lista">
                  <div class="comando-item">
                    <q-chip color="warning" text-color="white" icon="mic">
                      "Filtrar por hoy"
                    </q-chip>
                    <span class="comando-desc">Filtra logs de hoy</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="warning" text-color="white" icon="mic">
                      "Mostrar esta semana"
                    </q-chip>
                    <span class="comando-desc">Filtra datos de esta semana</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="warning" text-color="white" icon="mic">
                      "Limpiar filtros"
                    </q-chip>
                    <span class="comando-desc">Resetea todos los filtros</span>
                  </div>
                  <div class="comando-item">
                    <q-chip color="warning" text-color="white" icon="mic">
                      "Abrir filtros avanzados"
                    </q-chip>
                    <span class="comando-desc">Muestra opciones de filtrado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha - Tips y funciones avanzadas -->
          <div class="col-12 col-md-6">
            <div class="seccion-guia">
              <h4 class="text-h5 text-primary q-mb-md">
                <q-icon name="lightbulb" class="q-mr-sm" />
                Tips de Uso Intuitivo
              </h4>

              <div class="tip-card q-mb-md" v-for="tip in tips" :key="tip.id">
                <q-card flat bordered class="bg-grey-9">
                  <q-card-section>
                    <div class="tip-header q-mb-sm">
                      <q-icon :name="tip.icon" :color="tip.color" size="md" class="q-mr-sm" />
                      <span class="text-weight-bold">{{ tip.titulo }}</span>
                    </div>
                    <p class="tip-descripcion text-grey-3 q-mb-sm">{{ tip.descripcion }}</p>
                    <div class="tip-ejemplos">
                      <q-chip
                        v-for="ejemplo in tip.ejemplos"
                        :key="ejemplo"
                        size="sm"
                        color="grey-7"
                        text-color="white"
                        class="q-mr-xs q-mb-xs"
                      >
                        "{{ ejemplo }}"
                      </q-chip>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="funciones-especiales q-mt-lg">
                <h5 class="text-h6 text-secondary q-mb-md">⚡ Funciones Especiales</h5>
                <q-list dark>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="download" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Exportación Inteligente</q-item-label>
                      <q-item-label caption
                        >Di "exportar datos" para generar reportes automáticamente</q-item-label
                      >
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="search" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Búsqueda Contextual</q-item-label>
                      <q-item-label caption
                        >El asistente entiende el contexto actual para mejores
                        resultados</q-item-label
                      >
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="auto_fix_high" color="purple" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Acciones Inteligentes</q-item-label>
                      <q-item-label caption
                        >Ejecuta múltiples acciones con comandos naturales</q-item-label
                      >
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="speed" color="orange" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Navegación Rápida</q-item-label>
                      <q-item-label caption
                        >Cambia entre secciones sin perder el contexto</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección inferior - Consejos importantes -->
        <div class="row q-mt-xl">
          <div class="col-12">
            <q-card flat class="bg-grey-8 consejos-importantes">
              <q-card-section>
                <h5 class="text-h6 text-center text-primary q-mb-md">
                  <q-icon name="tips_and_updates" class="q-mr-sm" />
                  Consejos para Mejores Resultados
                </h5>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="consejo-item">
                      <q-icon name="volume_up" color="positive" class="q-mr-sm" />
                      <strong>Habla con claridad:</strong> El asistente reconoce mejor comandos
                      pronunciados claramente
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="consejo-item">
                      <q-icon name="psychology" color="info" class="q-mr-sm" />
                      <strong>Usa lenguaje natural:</strong> No necesitas comandos exactos, habla
                      naturalmente
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="consejo-item">
                      <q-icon name="context" color="warning" class="q-mr-sm" />
                      <strong>El contexto importa:</strong> El asistente sabe dónde estás y adapta
                      las acciones
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="consejo-item">
                      <q-icon name="help" color="purple" class="q-mr-sm" />
                      <strong>Experimenta:</strong> Prueba diferentes formas de decir lo mismo
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Footer con acciones -->
      <q-card-actions class="bg-grey-9 q-pa-lg justify-between">
        <div class="text-caption text-grey-4">
          💡 Tip: Puedes decir "ayuda" en cualquier momento para abrir esta guía
        </div>
        <div>
          <q-btn
            flat
            color="secondary"
            label="Cerrar"
            icon="close"
            @click="cerrar"
            class="q-mr-sm"
          />
          <q-btn color="primary" label="¡Entendido!" icon="check" @click="cerrar" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Estado
const mostrarGuia = ref(props.modelValue)

// Tips de uso
const tips = ref([
  {
    id: 1,
    icon: 'record_voice_over',
    color: 'positive',
    titulo: 'Lenguaje Natural',
    descripcion: 'Habla como lo harías normalmente, el asistente entiende contexto y sinónimos.',
    ejemplos: ['abre estadísticas', 'muéstrame los datos', 'ir a gráficos'],
  },
  {
    id: 2,
    icon: 'smart_toy',
    color: 'info',
    titulo: 'Inteligencia Contextual',
    descripcion: 'El asistente sabe dónde estás y qué estás viendo para darte mejores respuestas.',
    ejemplos: ['cambiar de vista', 'mostrar más detalles', 'filtrar estos datos'],
  },
  {
    id: 3,
    icon: 'flash_on',
    color: 'warning',
    titulo: 'Acciones Rápidas',
    descripcion: 'Combina múltiples acciones en un solo comando para mayor eficiencia.',
    ejemplos: [
      'exportar datos de hoy',
      'mostrar errores de esta semana',
      'filtrar por oficina principal',
    ],
  },
  {
    id: 4,
    icon: 'settings_voice',
    color: 'purple',
    titulo: 'Comandos Flexibles',
    descripcion: 'Usa diferentes palabras para la misma acción, el asistente las entiende.',
    ejemplos: [
      'abrir / mostrar / ir a',
      'filtrar / buscar / encontrar',
      'cerrar / ocultar / minimizar',
    ],
  },
])

// Métodos
const cerrar = () => {
  mostrarGuia.value = false
  emit('update:modelValue', false)
}

// Watchers
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (newVal) => {
    mostrarGuia.value = newVal
  }
)

watch(mostrarGuia, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style lang="scss" scoped>
.guia-asistente-dialog {
  .guia-card {
    max-height: 100vh;
    overflow-y: auto;
  }
}

.seccion-guia {
  height: 100%;
}

.comando-grupo {
  .comandos-lista {
    .comando-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .comando-desc {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
      }
    }
  }
}

.tip-card {
  .tip-header {
    display: flex;
    align-items: center;
  }

  .tip-descripcion {
    margin: 0;
    line-height: 1.4;
  }

  .tip-ejemplos {
    margin-top: 8px;
  }
}

.consejos-importantes {
  .consejo-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.funciones-especiales {
  .q-item {
    border-radius: 8px;
    margin-bottom: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .guia-card {
    .q-card-section {
      padding: 16px !important;
    }
  }

  .comando-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 4px !important;
  }

  .tip-card {
    margin-bottom: 16px;
  }

  .consejo-item {
    flex-direction: column;
    gap: 4px !important;
  }
}
</style>
