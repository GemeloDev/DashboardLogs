import { ref, computed } from 'vue'

export function useFilterableSelect(originalOptions) {
    const filteredOptions = ref([])
    const searchText = ref('')

    // Función para filtrar opciones de manera segura
    const filterOptions = (val, update, abort) => {
        // Validar entrada
        if (typeof val !== 'string') {
            abort()
            return
        }

        update(() => {
            try {
                if (val === '') {
                    // Si no hay búsqueda, mostrar todas las opciones
                    filteredOptions.value = originalOptions.value
                } else {
                    // Filtrar de manera segura
                    const needle = val.toLowerCase().trim()

                    filteredOptions.value = originalOptions.value.filter(option => {
                        // Verificar que la opción tenga la estructura correcta
                        if (!option || typeof option !== 'object' || !option.label) {
                            return false
                        }

                        // Buscar en el label de manera segura
                        const label = String(option.label).toLowerCase()
                        return label.includes(needle)
                    })
                }
            } catch (error) {
                console.warn('Error filtrando opciones:', error)
                // En caso de error, mostrar todas las opciones
                filteredOptions.value = originalOptions.value
            }
        })
    }

    // Función para limpiar el filtro
    const clearFilter = () => {
        searchText.value = ''
        filteredOptions.value = originalOptions.value
    }

    // Inicializar con todas las opciones
    const initializeOptions = () => {
        if (originalOptions.value && Array.isArray(originalOptions.value)) {
            filteredOptions.value = originalOptions.value
        }
    }

    // Computed para verificar si hay opciones disponibles
    const hasOptions = computed(() => {
        return Array.isArray(filteredOptions.value) && filteredOptions.value.length > 0
    })

    return {
        filteredOptions,
        searchText,
        filterOptions,
        clearFilter,
        initializeOptions,
        hasOptions
    }
}
