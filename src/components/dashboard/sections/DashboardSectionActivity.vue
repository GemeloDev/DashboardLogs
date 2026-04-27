<template>
  <ActivityTodayWidget :popup-mode="isPopup" :show-popout="showPopout" />
</template>

<script setup>
import { computed } from 'vue'
import ActivityTodayWidget from 'src/components/escritorio/ActivityTodayWidget.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'dashboard',
  },
  showPopout: {
    type: Boolean,
    default: true,
  },
})

const isPopup = computed(() => props.mode === 'popup')
</script>
