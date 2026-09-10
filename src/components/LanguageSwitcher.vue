<template>
  <div :class="['language-switcher', { 'language-switcher--fixed': fixed }]">
    <q-btn
      flat
      dense
      round
      icon="language"
      class="toolbar-icon-btn toolbar-icon-btn--utility"
      :aria-label="t('common.language')"
    >
      <q-menu fit anchor="bottom middle" self="top middle" class="glass-menu">
        <q-list class="language-dropdown-menu" style="min-width: 180px">
          <q-item-label header class="menu-header-label">
            {{ t('common.language') }}
          </q-item-label>

          <q-separator class="menu-separator" />

          <q-item
            clickable
            v-close-popup
            class="glass-menu-item"
            @click="setLocale('es')"
          >
            <q-item-section avatar style="min-width: 32px">
              <span class="language-flag">🇲🇽</span>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white">{{ t('layout.languageSpanish') }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="locale === 'es'" side top>
              <q-icon name="check" color="positive" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            class="glass-menu-item"
            @click="setLocale('en')"
          >
            <q-item-section avatar style="min-width: 32px">
              <span class="language-flag">🇺🇸</span>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white">{{ t('layout.languageEnglish') }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="locale === 'en'" side top>
              <q-icon name="check" color="positive" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  fixed: {
    type: Boolean,
    default: true,
  },
})

const { t, locale } = useI18n()

function setLocale(lang) {
  locale.value = lang
}
</script>

<style lang="scss" scoped>
.language-switcher {
  display: inline-flex;

  &--fixed {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 9999;
  }
}

.language-flag {
  font-size: 20px;
  line-height: 1;
}
</style>
