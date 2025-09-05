<template>
  <div class="q-pa-md q-gutter-sm container">
    <q-dialog
      v-model="mostrarGuia"
      transition-show="slide-up"
      transition-hide="slide-down"
      @escape-key="cerrarGuia"
    >
      <q-card class="diagnostic-modal bg-grey-9 text-white">
        <q-card-section>

        </q-card-section>
      </q-card>
      <q-card class="diagnostic-modal bg-grey-9 text-white">
        <q-card-section class="diagnostic-header bg-gradient-to-r from-grey-8 to-grey-7">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 diagnostic-title q-pl-lg q-pt-lg">💡 Guía de Diagnóstico</div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round color="red-4" @click="cerrarGuia">
                <q-tooltip>Cerrar guía</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <!-- Secciones de la guía -->
        <q-card-section class="q-pt-none">
          <div class="q-pa-md">
            <q-stepper
              class="bg-grey-8"
              v-model="step"
              header-nav
              ref="stepper"
              color="primary"
              animated
            >
              <q-step
                :name="1"
                title="Busqueda"
                icon="search"
                :active-icon="activeIcon"
                :done="done1"
              >
                <div class="row">
                  <div class="col-12 text-center">
                    <div class="text-h5 text-weight-bold q-pt-sm">
                      🚀 Pasos para realizar una búsqueda rápida de diagnóstico
                    </div>
                  </div>
                  <div class="col-12 q-pt-lg q-px-xl text-center">
                    <p class="text-body1 text-justify">
                      En este modulo encontrarás un acceso más rápido a la información de la que
                      desea consultar. Para realizar la consulta debera llenar con algun código
                      <q-chip
                        clickable
                        @click="descripcion"
                        color="red-6"
                        text-color="white"
                        size="sm"
                        icon="error"
                      >
                        USR02808190918-SUC001
                      </q-chip>
                      <q-chip
                        clickable
                        @click="descripcion"
                        color="blue-6"
                        text-color="white"
                        size="sm"
                        icon="account_circle"
                      >
                        USR02808190918
                      </q-chip>
                      el único campo obligatorio dentro del formulario.
                    </p>
                    <p class="text-body1 text-justify">
                      Una vez proporcionado el código para obtener la consulta debera dar click
                      sobre el icono ( <q-icon name="send" /> ). Si la consulta fue exitosa se
                      colocara en el modulo que corresponde el código y se mostrará la información
                      correspondiente.
                    </p>
                  </div>
                </div>
              </q-step>

              <q-step
                :name="2"
                title="Código Error"
                icon="warning"
                active-icon="check"
                :done="done2"
              >
                <div class="row">
                  <div class="col-12 text-center">
                    <div class="text-h5 text-weight-bold q-pt-sm">
                      ⚠️ Pasos para realizar un análisis de código de error.
                    </div>
                  </div>
                  <div class="col-12 text-center q-pt-lg q-px-xl">
                    <p>Sección para conocer más detalles acerca de un error.</p>
                    <p class="text-body1 text-left">
                      Para obtener más información o contexto acerca de un error debe proporcionar
                      la clave (<q-chip
                        clickable
                        @click="descripcion"
                        color="red-6"
                        text-color="white"
                        size="sm"
                        icon="error"
                      >
                        USR02808190918-SUC001 </q-chip
                      >) correspondiente dentro del campo "Código de Error". Para realizar la petición de la información debe hacer click sobre el botón ( <span class="bg-red"><q-icon name="search" /> Consultar</span> ). Si la consulta es correcta aparecera una sección con la información relacionada con el código de error.
                    </p>
                  </div>
                </div>
              </q-step>

              <q-step
                :name="3"
                title="Sesión"
                icon="account_circle"
                :active-icon="activeIcon"
                :done="done3"
              >
                <div class="row">
                  <div class="col-12 text-center">
                    <div class="text-h5 text-weight-bold q-pt-sm">
                      💻 Pasos para realizar un analísis de sesión.
                    </div>
                  </div>
                  <div class="col-12 q-pt-lg q-px-xl text-center">
                  <p>Sección para tener un historial sobre la actividad de un usuario.</p>
                  <p class="text-body1 text-justify">
                    Para que el modulo pueda mostrarnos la información con detalle sobre la actividad de una sesión. Debemos colocar un código base (
                      <q-chip
                        clickable
                        @click="descripcion"
                        color="blue-6"
                        text-color="white"
                        size="sm"
                        icon="account_circle"
                      > USR02808190918 </q-chip> ) y una vez proporcionado podremos hacer la perición dando click sobre el botón ( <span class="bg-blue"><q-icon name="search" /> Consultar</span> ).
                  </p>
                  <p class="text-body1 text-justify">
                    Ahora en pantalla veremos 3 secciones nuevas <strong>(Información del Usuario, Estadísticas de Sesión y Timeline de Acciones/Logs)</strong> las cuales traeran información detallada sobre los dispositivos y la sesión con la que esta relacionado el código base.
                  </p>
                  </div>
                </div>
              </q-step>
              <q-step
                :name="4"
                title="Soporte"
                icon="settings"
                :active-icon="activeIcon"
                :done="done4"
              >
                <div class="row">
                  <div class="col-12 text-center">
                    <div class="text-h5 text-weight-bold q-pt-sm">
                      📩 Pasos para realizar una solicitud de soporte
                    </div>
                  </div>
                  <div class="col-12 q-pt-lg q-px-xl text-center">
                    <p>
                      Sección para mostrar información acerca de un movimiento sobre el sistema
                      realizado por un usuario.
                    </p>
                    <p class="text-body1 text-left">
                      Sobre el modulo se encuentran tres campos, entre más filtros tenga la clave
                      proporcionada mayor acertividad tendra la consulta. Por lo que primeramente se
                      tiene que colocar un Código Base (<q-chip
                        clickable
                        @click="descripcion"
                        color="green-6"
                        text-color="white"
                        size="sm"
                        icon="account_circle"
                      >
                        USR02808190918-SUC001 </q-chip
                      >) y una vez completado el campo, puede proceder a realizar la consulta dando
                      click sobre el botón (
                      <span class="bg-green"><q-icon name="send" /> Enviar solicitud</span> ).
                    </p>
                    <p class="text-body1 text-justify">
                      <strong
                        >Nota: En caso de aparecer más consultas sobre una clave puede hacer un
                        filtrado con ayuda de los otros campos dentro del formulario y así conseguir
                        un registro más preciso.</strong
                      >
                    </p>
                  </div>
                </div>
              </q-step>
              <q-step
                :name="5"
                title="Resultados"
                icon="article"
                :active-icon="activeIcon"
                :done="done5"
              >
                <div class="row">
                  <div class="col-12 text-center">
                    <div class="text-h5 text-weight-bold q-pt-sm">📊 Sección de resultados.</div>
                  </div>
                  <div class="col-12 q-pt-lg q-px-xl text-center">
                    <p class="text-center">
                      Sección de las últimas consultas realizadas en las pestañas anteriores.
                    </p>
                    <p class="text-body1 text-justify">
                      Supongamos que realizaste dos consultas en las pestañas "Busqueda" y "Sesión".
                      Aquí apareceran ambas consultas de forma que podras retomar esa información.
                    </p>
                    <strong
                      >Nota: Únicamente apareceran las últimas consultas realizadas dentro de cada
                      modulo.
                    </strong>
                  </div>
                </div>
              </q-step>
            </q-stepper>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mostrarGuia = ref(false)
const step = ref(1)
const activeIcon = 'check'

const abrirGuia = () => {
  mostrarGuia.value = true
}

const cerrarGuia = () => {
  mostrarGuia.value = false
}

const descripcion = () => {
  console.log(
    'Codigo de error: Código que se identifica por la división de un guión, siendo la primera parte el "baseCode" seguido de la clave del error'
  )
}

defineExpose({
  abrirGuia,
})
</script>
