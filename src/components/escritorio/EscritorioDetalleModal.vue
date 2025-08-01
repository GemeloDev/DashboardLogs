<template>
  <q-dialog v-model="visible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Detalle</div>
        <div v-if="detalle">
          <pre>{{ JSON.stringify(detalle, null, 2) }}</pre>
        </div>
        <div v-else class="text-grey">No hay detalles para mostrar.</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ detalle: Object, modelValue: Boolean })
const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)
</script>
