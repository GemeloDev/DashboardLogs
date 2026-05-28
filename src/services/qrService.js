/**
 * Servicio de generacion de codigos QR.
 */

import axios from 'axios'
import QRCode from 'qrcode'
import { AUTH } from './endpoints'

const encodeTenantId = (tenantId) => btoa(tenantId)

const renderTenantQR = async (tenantId) => {
  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, encodeTenantId(tenantId), {
    width: 512,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
  return canvas
}

export const generateAndDownloadTenantQR = async (tenantId, filename = 'tenant-qr.png') => {
  try {
    const canvas = await renderTenantQR(tenantId)

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    })
  } catch (error) {
    console.error('Error al generar QR:', error)
    throw error
  }
}

export const getQRCodeDataUrl = async (tenantId) => {
  try {
    const canvas = await renderTenantQR(tenantId)
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error al obtener QR data URL:', error)
    throw error
  }
}

export const generateMultipleQRs = async (tenantIds) => {
  for (const tenantId of tenantIds) {
    await generateAndDownloadTenantQR(tenantId, `tenant-${tenantId}-qr.png`)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

export const generateNewContent = async () => {
  try {
    const response = await axios.get(AUTH.QR_TOKEN)
    const qrToken = response.data?.data?.qrToken

    if (!qrToken) {
      throw new Error('Respuesta inválida al generar el token QR')
    }

    return {
      url: `${AUTH.LOGIN_QR}/${qrToken}`,
      expireTime: response.data.data.expiresInSeconds ?? 60,
    }
  } catch (error) {
    console.error('Error durante la peticion del QR:', error?.message || error)
    throw new Error(error?.response?.data?.message || error?.message || 'No se pudo generar el código QR')
  }
}
