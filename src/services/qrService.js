/**
 * Servicio de Generación de Códigos QR
 * Maneja la generación y descarga de códigos QR con tenantId
 */

import axios from "axios"
import { API_ENDPOINTS, AUTH_ENDPOINTS } from "./apiEndpoints"

// Cargar librería QRCode dinámicamente
let QRCodeLib = null

export const loadQRCodeLibrary = () => {
    return new Promise((resolve, reject) => {
        if (QRCodeLib) {
            resolve(QRCodeLib)
            return
        }

        // Verificar si ya está cargada globalmente
        if (window.QRCode) {
            QRCodeLib = window.QRCode
            resolve(QRCodeLib)
            return
        }

        // Cargar desde CDN
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
        script.onload = () => {
            QRCodeLib = window.QRCode
            resolve(QRCodeLib)
        }
        script.onerror = () => reject(new Error('No se pudo cargar la librería QRCode'))
        document.head.appendChild(script)
    })
}

/**
 * Genera un código QR con el tenantId y lo descarga como imagen
 * @param {string} tenantId - ID del tenant para incluir en el QR
 * @param {string} filename - Nombre del archivo (default: 'tenant-qr.png')
 * @returns {Promise<void>}
 */
export const generateAndDownloadTenantQR = async (tenantId, filename = 'tenant-qr.png') => {
    try {
        console.log('📱 Generando QR para tenantId:', tenantId)

        // Encriptar tenantId en Base64
        const encryptedTenantId = btoa(tenantId)
        console.log('🔐 TenantId encriptado:', encryptedTenantId)

        // Cargar librería si no está disponible
        await loadQRCodeLibrary()

        // Crear elemento temporal para el QR
        const tempDiv = document.createElement('div')
        tempDiv.style.display = 'none'
        document.body.appendChild(tempDiv)

        // Generar QR con tenantId encriptado
        new QRCodeLib(tempDiv, {
            text: encryptedTenantId,
            width: 512,
            height: 512,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCodeLib.CorrectLevel.H
        })

        // Esperar a que se genere
        await new Promise(resolve => setTimeout(resolve, 100))

        // Obtener canvas del QR
        const canvas = tempDiv.querySelector('canvas')
        if (!canvas) {
            throw new Error('No se pudo generar el canvas del QR')
        }

        // Convertir a blob y descargar
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            URL.revokeObjectURL(url)

            // Limpiar elemento temporal
            document.body.removeChild(tempDiv)

            console.log('✅ QR generado y descargado exitosamente')
        })

    } catch (error) {
        console.error('❌ Error al generar QR:', error)
        throw error
    }
}

/**
 * Genera un código QR y retorna la URL de la imagen (sin descargar)
 * @param {string} tenantId - ID del tenant
 * @returns {Promise<string>} Data URL de la imagen
 */
export const getQRCodeDataUrl = async (tenantId) => {
    try {
        // Encriptar tenantId en Base64
        const encryptedTenantId = btoa(tenantId)

        await loadQRCodeLibrary()

        const tempDiv = document.createElement('div')
        tempDiv.style.display = 'none'
        document.body.appendChild(tempDiv)

        // Generar QR con tenantId encriptado
        new QRCodeLib(tempDiv, {
            text: encryptedTenantId,
            width: 512,
            height: 512,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCodeLib.CorrectLevel.H
        })

        await new Promise(resolve => setTimeout(resolve, 100))

        const canvas = tempDiv.querySelector('canvas')
        if (!canvas) {
            throw new Error('No se pudo generar el canvas del QR')
        }

        const dataUrl = canvas.toDataURL('image/png')
        document.body.removeChild(tempDiv)

        return dataUrl
    } catch (error) {
        console.error('❌ Error al obtener QR data URL:', error)
        throw error
    }
}

/**
 * Genera múltiples QRs para diferentes tenantIds
 * @param {string[]} tenantIds - Array de tenant IDs
 * @returns {Promise<void>}
 */
export const generateMultipleQRs = async (tenantIds) => {
    for (const tenantId of tenantIds) {
        await generateAndDownloadTenantQR(tenantId, `tenant-${tenantId}-qr.png`)
        // Pequeña pausa entre descargas
        await new Promise(resolve => setTimeout(resolve, 500))
    }
}

export const generateNewContent = async () => {
  try{
    const response = await axios.get(API_ENDPOINTS.QR)
    return {
      url: `${AUTH_ENDPOINTS.LOGIN_QR}/${response.data.data.qrToken}`,
      expireTime: response.data.data.expiresInSeconds ?? ''
    }
  }catch( error ){
    console.log('🧱 Algo ocurrió durante la petición del QR', error)
    return {
      url: `${AUTH_ENDPOINTS.LOGIN_QR}/token`,
      expireTime: 120
    }
  }
}
