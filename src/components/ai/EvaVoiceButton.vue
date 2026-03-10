<template>
    <q-btn
        round
        :color="eva.isListening ? 'negative' : 'secondary'"
        :icon="eva.isListening ? 'mic_off' : 'mic'"
        @onclick="toggleVoice"
    />
</template>

<script setup>
import { useEvaStore } from 'src/stores/eva-store' 

const eva = useEvaStore()

function toggleVoice() {
    eva.setListening(!eva.isListening)

    if (eva.isListening) {
        speak('Hola, soy Eva. Estoy escuchando')
    }
}

function speak(text) {
    if (!window.speechSynthesis) return

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ex-MX'
    utter.rate = 1
    utter.pitch = 1.1

    const voices = window.speechSynthesis.getVoices()
    const femaleVoice = 
        voices.find(v => v.lang?.includes('es-MX') && /female|maria|paulina|helena/i.test(v.name)) ||
        voices.find(v => v.lang?.startsWith('es'))

    if (femaleVoice) {
        utter.voice = femaleVoice
    }

    window.speechSynthesis.speak(utter)
}
</script>