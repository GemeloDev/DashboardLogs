<template>
  <q-btn
    v-if="canOpen"
    flat
    dense
    round
    size="sm"
    icon="open_in_new"
    color="grey-5"
    @click.stop="openWindow"
  >
    <q-tooltip>{{ t('dashboard.openInWindow') }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDashboardSectionDefinition } from 'src/constants/dashboardSections'

const props = defineProps({
  sectionId: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

const canOpen = computed(() => !$q.platform.is.mobile && typeof window !== 'undefined')

function openWindow() {
  if (!canOpen.value) return

  const section = getDashboardSectionDefinition(props.sectionId)
  if (!section) return

  const route = router.resolve({
    name: 'dashboardSectionWindow',
    params: { section: props.sectionId },
  })

  const features = [
    `width=${section.width || 1180}`,
    `height=${section.height || 860}`,
    'left=120',
    'top=80',
    'resizable=yes',
    'scrollbars=yes',
    'noopener=no',
  ]

  const popup = window.open(
    route.href,
    `dashboard-section-${props.sectionId}`,
    features.join(','),
  )
  if (popup && typeof window !== 'undefined') {
    if (!window.__dashboardPopupRegistry) {
      window.__dashboardPopupRegistry = new Set()
    }
    window.__dashboardPopupRegistry.add(popup)
  }
  popup?.focus()
}
</script>
