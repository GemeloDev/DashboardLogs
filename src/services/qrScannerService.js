/**
 * Servicio de escaneo y lectura de codigos QR.
 */

import jsQR from 'jsqr'

export const isValidImageFile = (file) => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  return file && validTypes.includes(file.type)
}

export const readQRFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!isValidImageFile(file)) {
      reject(new Error('El archivo debe ser una imagen (PNG, JPG, JPEG, WEBP)'))
      return
    }

    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const imageDataUrl = event.target.result
        const qrContent = await decodeQRFromImage(imageDataUrl)
        resolve(qrContent)
      } catch {
        reject(new Error('No se pudo leer el codigo QR de la imagen'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsDataURL(file)
  })
}

const decodeQRFromImage = async (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = imageDataUrl

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        resolve(code.data)
      } else {
        reject(new Error('No se encontro codigo QR en la imagen'))
      }
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }
  })
}

export const startQRScanner = async (videoElement, onScan, onError) => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Tu navegador no soporta acceso a camara. Intenta actualizar tu navegador.')
    }

    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )

    if (isMobile && !isSecureContext) {
      const httpsWarning = new Error(
        'Los navegadores moviles requieren HTTPS para acceder a la camara. ' +
          'Por favor accede desde una conexion segura (https://) o usa la opcion de subir imagen.',
      )
      httpsWarning.name = 'NotSecureContextError'
      throw httpsWarning
    }

    const cameraConfigs = [
      {
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
      },
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
      },
      { video: true },
    ]

    let stream = null
    let lastError = null

    for (const config of cameraConfigs) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(config)
        break
      } catch (err) {
        lastError = err
        if (err.name === 'NotAllowedError') throw err
      }
    }

    if (!stream) {
      throw lastError || new Error('No se pudo acceder a ninguna camara')
    }

    videoElement.srcObject = stream
    videoElement.setAttribute('playsinline', true)
    await videoElement.play()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    let scanning = true
    let animationId = null

    const tick = () => {
      if (!scanning) return

      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          onScan(code.data)
          return
        }
      }

      animationId = requestAnimationFrame(tick)
    }

    tick()

    return {
      stop: () => {
        scanning = false
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
        stream.getTracks().forEach((track) => track.stop())
        videoElement.srcObject = null
      },
      stream,
    }
  } catch (error) {
    console.error('Error al iniciar escaner:', error)
    onError(error)
    throw error
  }
}

export const hasCameraAccess = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some((device) => device.kind === 'videoinput')
    }
  } catch {
    return false
  }
}

export const decryptTenantIdFromQR = (encryptedData) => {
  try {
    return atob(encryptedData)
  } catch (error) {
    console.error('Error al desencriptar tenantId:', error)
    throw new Error('QR invalido o corrupto')
  }
}

export default {
  isValidImageFile,
  readQRFromFile,
  startQRScanner,
  hasCameraAccess,
  decryptTenantIdFromQR,
}
