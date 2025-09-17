import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export class ExportService {
  static formatearFecha(fecha) {
    if (!fecha) return 'No disponible'
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return fecha.toString()
    }
  }

  static truncarTexto(texto, maxLength = 50) {
    if (!texto) return ''
    const textoLimpio = texto.toString().replace(/[^\w\s\-.,]/g, '')
    return textoLimpio.length > maxLength
      ? textoLimpio.substring(0, maxLength) + '...'
      : textoLimpio
  }

  static obtenerNombreOficina(codigoOficina) {
    const oficinas = {
      '001': 'Oficina Central',
      '002': 'Sucursal Norte',
      '003': 'Sucursal Sur',
      '004': 'Sucursal Este',
      '005': 'Sucursal Oeste'
    }
    return oficinas[codigoOficina] || `Oficina ${codigoOficina || 'N/A'}`
  }

  static async exportErrorCode(datos, formato) {
    try {
      if (!datos || !datos.data || !Array.isArray(datos.data) || datos.data.length === 0) {
        throw new Error('No hay datos para exportar')
      }

      // Tomar el primer registro como base para información general
      const registro = datos.data[0]

      const datosParaExportar = {
        // Información general
        codigoConsulta: datos.errorCode || registro.errorCode || 'N/A',
        baseCode: registro.baseCode || datos.summary?.baseCode || 'N/A',
        trackingCode: registro.trackingCode || 'N/A',
        sessionToken: registro.sessionToken || datos.summary?.sessionToken || 'N/A',
        fecha: this.formatearFecha(registro.date),
        oficina: registro.oficina?.nombre || datos.summary?.office || 'N/A',
        usuario: registro.person?.nombreCompleto || datos.summary?.user || 'N/A',
        curp: registro.person?.curp || 'N/A',
        dispositivo: registro.device || 'N/A',
        totalRegistros: datos.data.length,

        // TODOS los registros detallados
        registrosDetallados: datos.data.map((reg, index) => ({
          numero: index + 1,
          id: reg.id || 'N/A',
          fecha: this.formatearFecha(reg.date),
          tipo: reg.type || 'N/A',
          dispositivo: reg.device || 'N/A',
          dispositivoScan: reg.scanDevice || 'N/A',
          proceso: reg.process || 'N/A',
          mensaje: reg.message || 'N/A',
          errorCode: reg.errorCode || 'N/A',
          sessionToken: reg.sessionToken || 'N/A',
          baseCode: reg.baseCode || 'N/A',
          trackingCode: reg.trackingCode || 'N/A',
          usuario: reg.person?.nombreCompleto || 'N/A',
          curp: reg.person?.curp || 'N/A',
          oficina: reg.oficina?.nombre || 'N/A'
        }))
      }

      switch (formato.toLowerCase()) {
        case 'pdf':
          return this.exportarCodigoErrorPDF(datosParaExportar)
        case 'excel':
          return this.exportarCodigoErrorExcel(datosParaExportar)
        case 'json':
          return this.exportarCodigoErrorJSON(datosParaExportar)
        default:
          throw new Error('Formato no soportado')
      }
    } catch (error) {
      console.error('Error en exportErrorCode:', error)
      throw error
    }
  }

  static async exportSession(datos, formato) {
    try {
      if (!datos || !datos.data || !Array.isArray(datos.data) || datos.data.length === 0) {
        throw new Error('No hay datos de sesion para exportar')
      }

      // Tomar información de todos los registros para la sesión
      const primerRegistro = datos.data[0]
      const sessionToken = primerRegistro.sessionToken || datos.summary?.sessionToken || 'N/A'
      const baseCode = primerRegistro.baseCode || datos.summary?.baseCode || 'N/A'

      const datosParaExportar = {
        sessionToken: sessionToken,
        baseCode: baseCode,
        usuario: primerRegistro.person?.nombreCompleto || datos.summary?.user || 'N/A',
        curp: primerRegistro.person?.curp || 'N/A',
        fechaInicio: this.formatearFecha(datos.data[0]?.date),
        fechaFin: this.formatearFecha(datos.data[datos.data.length - 1]?.date),
        oficina: primerRegistro.oficina?.nombre || datos.summary?.office || 'N/A',
        dispositivo: primerRegistro.device || 'N/A',
        totalRegistros: datos.data.length,
        actividades: datos.data.map(registro => ({
          fecha: this.formatearFecha(registro.date),
          tipo: registro.type || 'N/A',
          proceso: registro.process || 'N/A',
          mensaje: this.truncarTexto(registro.message, 100),
          errorCode: registro.errorCode || 'N/A'
        }))
      }

      switch (formato.toLowerCase()) {
        case 'pdf':
          return this.exportarSesionPDF(datosParaExportar)
        case 'excel':
          return this.exportarSesionExcel(datosParaExportar)
        case 'json':
          return this.exportarSesionJSON(datosParaExportar)
        default:
          throw new Error('Formato no soportado')
      }
    } catch (error) {
      console.error('Error en exportSession:', error)
      throw error
    }
  }

  static exportarCodigoErrorPDF(datos) {
    const doc = new jsPDF()

    // Configuracion del documento
    doc.setFontSize(16)
    doc.text('REPORTE DE CODIGO DE ERROR', 20, 20)

    doc.setFontSize(12)
    doc.text(`Fecha de generacion: ${new Date().toLocaleString('es-ES')}`, 20, 35)

    // Datos principales
    const datosTabla = [
      ['Campo', 'Valor'],
      ['Codigo de Consulta', datos.codigoConsulta],
      ['Codigo Base', datos.baseCode],
      ['Session Token', datos.sessionToken],
      ['Tracking Code', datos.trackingCode],
      ['Fecha', datos.fecha],
      ['Oficina', datos.oficina],
      ['Usuario', datos.usuario],
      ['CURP', datos.curp],
      ['Tipo', datos.tipo],
      ['Dispositivo', datos.dispositivo],
      ['Proceso', datos.proceso],
      ['Descripcion', datos.descripcion],
      ['Total Registros', datos.totalRegistros]
    ]

    doc.autoTable({
      head: [datosTabla[0]],
      body: datosTabla.slice(1),
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    })

    // Tabla detallada de TODOS los registros
    if (datos.registrosDetallados && datos.registrosDetallados.length > 0) {
      doc.setFontSize(14)
      doc.text(`Detalle de los ${datos.totalRegistros} Registros:`, 20, doc.lastAutoTable.finalY + 20)

      const registrosTabla = [
        ['#', 'ID', 'Fecha', 'Tipo', 'Proceso', 'Dispositivo', 'Error Code', 'Mensaje'],
        ...datos.registrosDetallados.map(reg => [
          reg.numero || '',
          reg.id || '',
          reg.fecha || '',
          reg.tipo || '',
          reg.proceso || '',
          reg.dispositivo || '',
          reg.errorCode || '',
          this.truncarTexto(reg.mensaje || '', 40)
        ])
      ]

      doc.autoTable({
        head: [registrosTabla[0]],
        body: registrosTabla.slice(1),
        startY: doc.lastAutoTable.finalY + 30,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },  // #
          1: { cellWidth: 15 },  // ID
          2: { cellWidth: 25 },  // Fecha
          3: { cellWidth: 20 },  // Tipo
          4: { cellWidth: 20 },  // Proceso
          5: { cellWidth: 25 },  // Dispositivo
          6: { cellWidth: 30 },  // Error Code
          7: { cellWidth: 'auto' } // Mensaje
        }
      })
    }

    doc.save(`codigo-error-${datos.codigoConsulta}-${Date.now()}.pdf`)
  }

  static exportarCodigoErrorExcel(datos) {
    const workbook = XLSX.utils.book_new()

    // Hoja de resumen
    const datosResumen = [
      ['Campo', 'Valor'],
      ['Codigo de Consulta', datos.codigoConsulta],
      ['Codigo Base', datos.baseCode],
      ['Session Token', datos.sessionToken],
      ['Usuario', datos.usuario],
      ['CURP', datos.curp],
      ['Oficina', datos.oficina],
      ['Dispositivo', datos.dispositivo],
      ['Total Registros', datos.totalRegistros]
    ]

    const worksheetResumen = XLSX.utils.aoa_to_sheet(datosResumen)
    XLSX.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen')

    // Hoja con TODOS los registros detallados
    if (datos.registrosDetallados && datos.registrosDetallados.length > 0) {
      const registrosDetalle = [
        ['#', 'ID', 'Fecha', 'Tipo', 'Dispositivo', 'Scan Device', 'Proceso', 'Mensaje', 'Error Code', 'Session Token', 'Base Code', 'Tracking Code', 'Usuario', 'CURP', 'Oficina'],
        ...datos.registrosDetallados.map(reg => [
          reg.numero,
          reg.id,
          reg.fecha,
          reg.tipo,
          reg.dispositivo,
          reg.dispositivoScan,
          reg.proceso,
          reg.mensaje,
          reg.errorCode,
          reg.sessionToken,
          reg.baseCode,
          reg.trackingCode,
          reg.usuario,
          reg.curp,
          reg.oficina
        ])
      ]

      const worksheetDetalle = XLSX.utils.aoa_to_sheet(registrosDetalle)
      XLSX.utils.book_append_sheet(workbook, worksheetDetalle, 'Registros Detallados')
    }

    XLSX.writeFile(workbook, `codigo-error-${datos.codigoConsulta}-${Date.now()}.xlsx`)
  } static exportarCodigoErrorJSON(datos) {
    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codigo-error-${datos.codigoConsulta}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  static exportarSesionPDF(datos) {
    const doc = new jsPDF()

    // Configuracion del documento
    doc.setFontSize(16)
    doc.text('REPORTE DE SESION', 20, 20)

    doc.setFontSize(12)
    doc.text(`Fecha de generacion: ${new Date().toLocaleString('es-ES')}`, 20, 35)

    // Datos principales
    const datosTabla = [
      ['Campo', 'Valor'],
      ['Session Token', datos.sessionToken],
      ['Codigo Base', datos.baseCode],
      ['Usuario', datos.usuario],
      ['CURP', datos.curp],
      ['Fecha Inicio', datos.fechaInicio],
      ['Fecha Fin', datos.fechaFin],
      ['Oficina', datos.oficina],
      ['Dispositivo', datos.dispositivo],
      ['Total Registros', datos.totalRegistros]
    ]

    doc.autoTable({
      head: [datosTabla[0]],
      body: datosTabla.slice(1),
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    })

    // Actividades si existen
    if (datos.actividades && datos.actividades.length > 0) {
      doc.setFontSize(14)
      doc.text('Actividades de la Sesion:', 20, doc.lastAutoTable.finalY + 20)

      const actividadesTabla = [
        ['Fecha', 'Tipo', 'Proceso', 'Error Code', 'Mensaje'],
        ...datos.actividades.map(act => [
          act.fecha,
          act.tipo,
          act.proceso,
          act.errorCode,
          act.mensaje
        ])
      ]

      doc.autoTable({
        head: [actividadesTabla[0]],
        body: actividadesTabla.slice(1),
        startY: doc.lastAutoTable.finalY + 30,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        styles: { fontSize: 9 }
      })
    }

    doc.save(`sesion-${datos.sessionToken}-${Date.now()}.pdf`)
  }

  static exportarSesionExcel(datos) {
    const workbook = XLSX.utils.book_new()

    // Hoja principal con datos de sesion
    const datosSesion = [
      ['Campo', 'Valor'],
      ['Session Token', datos.sessionToken],
      ['Codigo Base', datos.baseCode],
      ['Usuario', datos.usuario],
      ['CURP', datos.curp],
      ['Fecha Inicio', datos.fechaInicio],
      ['Fecha Fin', datos.fechaFin],
      ['Oficina', datos.oficina],
      ['Dispositivo', datos.dispositivo],
      ['Total Registros', datos.totalRegistros]
    ]

    const worksheetSesion = XLSX.utils.aoa_to_sheet(datosSesion)
    XLSX.utils.book_append_sheet(workbook, worksheetSesion, 'Sesion')

    // Hoja de actividades si existen
    if (datos.actividades && datos.actividades.length > 0) {
      const datosActividades = [
        ['Fecha', 'Tipo', 'Proceso', 'Error Code', 'Mensaje'],
        ...datos.actividades.map(act => [
          act.fecha,
          act.tipo || 'N/A',
          act.proceso || 'N/A',
          act.errorCode || 'N/A',
          act.mensaje || 'N/A'
        ])
      ]

      const worksheetActividades = XLSX.utils.aoa_to_sheet(datosActividades)
      XLSX.utils.book_append_sheet(workbook, worksheetActividades, 'Actividades')
    }

    XLSX.writeFile(workbook, `sesion-${datos.sessionToken}-${Date.now()}.xlsx`)
  }

  static exportarSesionJSON(datos) {
    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sesion-${datos.sessionToken}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Exportacion por defecto para compatibilidad
export default ExportService
