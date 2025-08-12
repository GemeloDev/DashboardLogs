import { ref, computed, onMounted } from 'vue'

export function useSearchableSelect(loadOptions, initialValue = null) {
    const options = ref([])
    const loading = ref(false)
    const searchText = ref('')
    const selectedValue = ref(initialValue)

    // Opciones filtradas basadas en el texto de búsqueda
    const filteredOptions = computed(() => {
        if (!searchText.value) return options.value

        const search = searchText.value.toLowerCase()
        return options.value.filter(option =>
            option.label.toLowerCase().includes(search) ||
            (option.curp && option.curp.toLowerCase().includes(search)) ||
            (option.nombres && option.nombres.toLowerCase().includes(search)) ||
            (option.direccion && option.direccion.toLowerCase().includes(search))
        )
    })

    // Cargar opciones al montar
    const loadData = async () => {
        loading.value = true
        try {
            options.value = await loadOptions()
        } catch (error) {
            console.error('Error cargando opciones:', error)
        } finally {
            loading.value = false
        }
    }

    // Filtrar opciones mientras se escribe
    const filterFn = (val, update) => {
        update(() => {
            searchText.value = val
        })
    }

    // Limpiar búsqueda cuando se selecciona una opción
    const onSelect = (value) => {
        selectedValue.value = value
        searchText.value = ''
    }

    onMounted(() => {
        loadData()
    })

    return {
        options: filteredOptions,
        loading,
        searchText,
        selectedValue,
        filterFn,
        onSelect,
        loadData
    }
}
