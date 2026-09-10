<template>
  <div class="date-range-filter row items-center q-gutter-sm">
    <q-btn-toggle
      v-model="selectedOption"
      no-caps
      unelevated
      toggle-color="orange"
      color="grey-9"
      text-color="grey-4"
      :options="toggleOptions"
      class="date-range-filter__toggle"
      @update:model-value="onOptionChange"
    />

    <q-btn
      v-if="selectedOption === 'custom'"
      no-caps
      unelevated
      color="grey-9"
      text-color="white"
      class="date-range-filter__custom"
    >
      <q-icon name="calendar_month" class="q-mr-sm" />
      {{ customLabel }}
      <q-menu
        v-model="customMenuOpen"
        anchor="bottom left"
        self="top left"
        class="bg-dark border-subtle"
      >
        <q-date
          v-model="customRange"
          range
          mask="YYYY/MM/DD"
          color="orange"
          text-color="black"
          dark
          today-btn
          class="bg-dark text-white"
          @range-end="onCustomRangeSelected"
        />
      </q-menu>
    </q-btn>

    <div class="text-caption text-grey-5">
      {{ displayLabel }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      from: '',
      to: '',
      option: 'today',
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'update:date-range'])

const selectedOption = ref(props.modelValue.option || 'today')
const customMenuOpen = ref(false)
const customRange = ref({ from: '', to: '' })

const toggleOptions = [
  { label: t('dateRange.today'), value: 'today' },
  { label: t('dateRange.last7Days'), value: 'last7days' },
  { label: t('dateRange.last30Days'), value: 'last30days' },
  { label: t('dateRange.allHistory'), value: 'all' },
  { label: t('dateRange.custom'), value: 'custom' },
]

function formatIso(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIso(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getRangeForOption(option) {
  const today = new Date()
  const to = formatIso(today)
  let from = to

  if (option === 'all') {
    return { from: '', to: '', option, range: 'ALL' }
  } else if (option === 'today') {
    from = to
  } else if (option === 'last7days') {
    const d = new Date(today)
    d.setDate(d.getDate() - 6)
    from = formatIso(d)
  } else if (option === 'last30days') {
    const d = new Date(today)
    d.setDate(d.getDate() - 29)
    from = formatIso(d)
  } else if (option === 'custom') {
    const currentFrom = props.modelValue.from || from
    const currentTo = props.modelValue.to || to
    return { from: currentFrom, to: currentTo, option }
  }

  return { from, to, option }
}

const customLabel = computed(() => {
  if (customRange.value.from && customRange.value.to) {
    return `${customRange.value.from} - ${customRange.value.to}`
  }
  if (props.modelValue.from && props.modelValue.to) {
    return `${props.modelValue.from} - ${props.modelValue.to}`
  }
  return t('dateRange.selectRange')
})

const displayLabel = computed(() => {
  if (selectedOption.value === 'all') return t('dateRange.allHistory')
  if (selectedOption.value === 'custom' && props.modelValue.from && props.modelValue.to) {
    return `${props.modelValue.from} → ${props.modelValue.to}`
  }
  return ''
})

function emitRange(range) {
  emit('update:modelValue', range)
  emit('update:date-range', range)
}

function onOptionChange(option) {
  if (option === 'custom') {
    customMenuOpen.value = true
    const from = parseIso(props.modelValue.from) || new Date()
    const to = parseIso(props.modelValue.to) || new Date()
    customRange.value = {
      from: `${from.getFullYear()}/${String(from.getMonth() + 1).padStart(2, '0')}/${String(from.getDate()).padStart(2, '0')}`,
      to: `${to.getFullYear()}/${String(to.getMonth() + 1).padStart(2, '0')}/${String(to.getDate()).padStart(2, '0')}`,
    }
    return
  }
  emitRange(getRangeForOption(option))
}

function slashToIso(dateStr) {
  const [year, month, day] = dateStr.split('/').map(Number)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function onCustomRangeSelected() {
  if (!customRange.value.from || !customRange.value.to) return
  const range = {
    from: slashToIso(customRange.value.from),
    to: slashToIso(customRange.value.to),
    option: 'custom',
  }
  emitRange(range)
  customMenuOpen.value = false
}

watch(
  () => props.modelValue,
  (newValue) => {
    selectedOption.value = newValue.option || 'today'
  },
  { deep: true },
)

// Inicializar con el rango predeterminado si no hay valores.
if (!props.modelValue.from || !props.modelValue.to) {
  selectedOption.value = 'today'
  emitRange(getRangeForOption(selectedOption.value))
}
</script>

<style lang="scss" scoped>
.date-range-filter {
  &__toggle {
    :deep(.q-btn) {
      min-height: 36px;
      padding: 0 14px;
      font-size: 0.82rem;
      font-weight: 500;
    }
  }

  &__custom {
    min-height: 36px;
    padding: 0 14px;
    font-size: 0.82rem;
    font-weight: 500;
  }
}
</style>
