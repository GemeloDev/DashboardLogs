<!-- 🎮 PÁGINA DE PRUEBA SANTORO - Para demostrar las capacidades -->
<template>
  <q-page class="santoro-demo-page">
    <div class="q-pa-lg">
      <!-- Header -->
      <div class="text-center q-mb-xl">
        <h3 class="text-h3 text-purple-8 q-mb-md">🤖 Santoro IA - Sistema de Pruebas</h3>
        <p class="text-h6 text-grey-7">
          Página de demostración para probar todas las capacidades de Santoro
        </p>
      </div>

      <!-- Panel de Comandos de Prueba -->
      <q-card class="demo-card q-mb-xl">
        <q-card-section>
          <div class="text-h5 q-mb-md">🎯 Comandos de Prueba Rápida</div>
          <p class="text-body2 text-grey-6 q-mb-lg">
            Haz clic en cualquier botón para probar Santoro con datos reales
          </p>

          <div class="row q-col-gutter-md">
            <!-- Búsquedas -->
            <div class="col-12 col-md-6">
              <q-card class="bg-blue-1 border-blue-3" style="border: 2px solid">
                <q-card-section>
                  <div class="text-h6 text-blue-8 q-mb-sm">🔍 Búsquedas de Errores</div>
                  <div class="q-gutter-sm">
                    <q-btn
                      color="blue-6"
                      label="Buscar Error USR02808190918"
                      @click="probarComando('busca error USR02808190918')"
                      class="full-width"
                    />
                    <q-btn
                      color="blue-6"
                      label="Buscar Sesión USR02808190918"
                      @click="probarComando('sesión USR02808190918')"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Eventos -->
            <div class="col-12 col-md-6">
              <q-card class="bg-green-1 border-green-3" style="border: 2px solid">
                <q-card-section>
                  <div class="text-h6 text-green-8 q-mb-sm">📊 Eventos y Estadísticas</div>
                  <div class="q-gutter-sm">
                    <q-btn
                      color="green-6"
                      label="Eventos de Hoy"
                      @click="probarComando('eventos de hoy')"
                      class="full-width"
                    />
                    <q-btn
                      color="green-6"
                      label="Eventos de Ayer"
                      @click="probarComando('eventos de ayer')"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Fechas -->
            <div class="col-12 col-md-6">
              <q-card class="bg-orange-1 border-orange-3" style="border: 2px solid">
                <q-card-section>
                  <div class="text-h6 text-orange-8 q-mb-sm">📅 Filtros de Fecha</div>
                  <div class="q-gutter-sm">
                    <q-btn
                      color="orange-6"
                      label="Errores de Esta Semana"
                      @click="probarComando('errores de esta semana')"
                      class="full-width"
                    />
                    <q-btn
                      color="orange-6"
                      label="Eventos del Mes"
                      @click="probarComando('eventos del mes')"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Acciones -->
            <div class="col-12 col-md-6">
              <q-card class="bg-purple-1 border-purple-3" style="border: 2px solid">
                <q-card-section>
                  <div class="text-h6 text-purple-8 q-mb-sm">⚡ Acciones Especiales</div>
                  <div class="q-gutter-sm">
                    <q-btn
                      color="purple-6"
                      label="Ayuda de Santoro"
                      @click="probarComando('ayuda')"
                      class="full-width"
                    />
                    <q-btn
                      color="purple-6"
                      label="Análisis General"
                      @click="probarComando('analiza los datos')"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Panel de Estado -->
      <q-card class="demo-card q-mb-xl">
        <q-card-section>
          <div class="text-h5 q-mb-md">🔮 Estado del Sistema Santoro</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card class="bg-grey-2">
                <q-card-section class="text-center">
                  <q-icon name="psychology" size="48px" color="purple-6" />
                  <div class="text-h6 q-mt-sm">IA Status</div>
                  <q-chip color="green" text-color="white" icon="check"> Operativo </q-chip>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card class="bg-grey-2">
                <q-card-section class="text-center">
                  <q-icon name="api" size="48px" color="blue-6" />
                  <div class="text-h6 q-mt-sm">APIs</div>
                  <q-chip color="green" text-color="white" icon="wifi"> Conectadas </q-chip>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card class="bg-grey-2">
                <q-card-section class="text-center">
                  <q-icon name="mic" size="48px" color="red-6" />
                  <div class="text-h6 q-mt-sm">Voz</div>
                  <q-chip color="blue" text-color="white" icon="volume_up"> Disponible </q-chip>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Instrucciones -->
      <q-card class="demo-card">
        <q-card-section>
          <div class="text-h5 q-mb-md">📚 Cómo Usar Santoro</div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <h6>💬 Chat de Texto</h6>
              <ol>
                <li>
                  Haz clic en el <strong>botón flotante morado</strong> en la esquina inferior
                  derecha
                </li>
                <li>Escribe comandos como: <code>"busca error USR123"</code></li>
                <li>Haz clic en los <strong>botones de acción</strong> que aparecen</li>
                <li>¡Observa cómo Santoro ejecuta acciones reales!</li>
              </ol>
            </div>

            <div class="col-12 col-md-6">
              <h6>🎤 Comandos por Voz</h6>
              <ol>
                <li>Abre el chat de Santoro</li>
                <li>Haz clic en el <strong>botón del micrófono</strong></li>
                <li>Di comandos como: <em>"Santoro, busca eventos de hoy"</em></li>
                <li>¡Santoro procesará tu voz automáticamente!</li>
              </ol>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="text-center">
            <h6>🚀 Ejemplos de Comandos Avanzados</h6>
            <div class="row q-col-gutter-sm justify-center q-mt-md">
              <div class="col-auto">
                <q-chip outline color="primary">"busca error USR02808190918-SUC001"</q-chip>
              </div>
              <div class="col-auto">
                <q-chip outline color="secondary">"eventos abiertos"</q-chip>
              </div>
              <div class="col-auto">
                <q-chip outline color="accent">"analiza errores de ayer"</q-chip>
              </div>
              <div class="col-auto">
                <q-chip outline color="positive">"exporta los datos"</q-chip>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import santoroAI from '../services/santoroAI.js'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Función para probar comandos directamente
const probarComando = async (comando) => {
  console.log('🎮 Probando comando:', comando)

  $q.notify({
    type: 'info',
    message: `🤖 Simulando comando: "${comando}"`,
    position: 'top',
    actions: [{ label: 'Ver en Chat', handler: () => {} }],
  })

  try {
    // Procesar con Santoro IA
    const respuesta = await santoroAI.procesarPregunta(comando, {
      pagina: 'demo',
      usuario: 'prueba',
    })

    // Mostrar resultado
    setTimeout(() => {
      $q.dialog({
        title: '🤖 Respuesta de Santoro',
        message: respuesta.respuesta,
        html: true,
        ok: 'Cerrar',
      })
    }, 1000)
  } catch (error) {
    console.error('Error probando comando:', error)
    $q.notify({
      type: 'negative',
      message: 'Error ejecutando comando',
      position: 'top',
    })
  }
}
</script>

<style scoped>
.santoro-demo-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.demo-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.demo-card:hover {
  transform: translateY(-2px);
}

h6 {
  color: #1976d2;
  margin-bottom: 12px;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

ol li {
  margin-bottom: 8px;
}

.border-blue-3 {
  border-color: #90caf9 !important;
}

.border-green-3 {
  border-color: #a5d6a7 !important;
}

.border-orange-3 {
  border-color: #ffcc80 !important;
}

.border-purple-3 {
  border-color: #ce93d8 !important;
}
</style>
