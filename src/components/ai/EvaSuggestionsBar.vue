<template>
  <div v-if="suggestions.length" class="eva-suggestions-bar">
    <q-chip
      v-for="item in suggestions"
      :key="item.id"
      clickable
      outline
      color="primary"
      text-color="primary"
      class="eva-suggestion-chip"
      @click="$emit('select', item)"
    >
      <q-icon :name="item.icon" size="14px" class="q-mr-xs" />
      {{ item.label }}
    </q-chip>
  </div>
</template>

<script setup>
defineProps({
  suggestions: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])
</script>

<style scoped>
.eva-suggestions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.eva-suggestion-chip {
  background: rgba(255, 255, 255, 0.03);
}
</style>