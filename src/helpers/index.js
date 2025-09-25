const formatearFecha = (fecha) => {

  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };

  if (!fecha) return 'No disponible'
  try {
    return new Date(fecha).toLocaleString('es-ES', opciones)
  } catch {
    return fecha
  }
}

const counterKeyRegister = (object) => {
  const persons = object.filter(obj => "person" in obj).length
  const oficina = object.filter(obj => "oficina" in obj).length
  return {
    persons,
    oficina
  }
}

const getEventIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'SUCCESS':
      return 'check_circle'
    case 'ERROR':
      return 'error'
    case 'WARNING':
      return 'warning'
    case 'INFO':
      return 'info'
    default:
      return 'timeline'
  }
}

const getEventColor = (type) => {
  switch (type?.toUpperCase()) {
    case 'SUCCESS':
      return 'green-5'
    case 'ERROR':
      return 'red-5'
    case 'WARNING':
      return 'orange-5'
    case 'INFO':
      return 'blue-5'
    default:
      return 'grey-5'
  }
}

export {
  formatearFecha,
  getEventIcon,
  getEventColor,
  counterKeyRegister
}
