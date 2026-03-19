<template>
  <transition name="eva-suggestions-fade">
    <div v-if="suggestions.length" class="eva-suggestions-bar">
      <button
        v-for="item in suggestions"
        :key="item.id"
        class="eva-suggestion-chip"
        @click="emit('select', item)"
      >
        <q-icon v-if="item.icon" :name="item.icon" size="13px" class="eva-chip-icon" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  suggestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.eva-suggestions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 8px;
}

.eva-suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #9fc3ff;
  background: rgba(0, 120, 255, 0.08);
  border: 1px solid rgba(0, 160, 255, 0.25);
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.eva-suggestion-chip:hover {
  background: rgba(0, 120, 255, 0.18);
  border-color: rgba(0, 160, 255, 0.5);
  color: #cfe0ff;
}

.eva-chip-icon {
  opacity: 0.75;
}

.eva-suggestions-fade-enter-active,
.eva-suggestions-fade-leave-active {
  transition: opacity 0.2s ease;
}
.eva-suggestions-fade-enter-from,
.eva-suggestions-fade-leave-to {
  opacity: 0;
}
</style>