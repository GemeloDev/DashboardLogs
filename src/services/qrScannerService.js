/**
 * Servicio de Escaneo y Lectura de Códigos QR
 * Soporta:
 * - Escaneo desde cámara en tiempo real
 * - Upload de imagen con QR
 * - Validación de archivos de imagen
 * - Extracción de tenantId
 */

/**
 * Valida que el archivo sea una imagen
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export const isValidImageFile = (file) => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  return file && validTypes.includes(file.type)
}

/**
 * Lee un código QR desde una imagen (File o Blob)
 * @param {File|Blob} file - Archivo de imagen
 * @returns {Promise<string>} Contenido del QR (tenantId)
 */
export const readQRFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!isValidImageFile(file)) {
      reject(new Error('El archivo debe ser una imagen (PNG, JPG, JPEG, WEBP)'))
      return
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const imageDataUrl = e.target.result
        const qrContent = await decodeQRFromImage(imageDataUrl)
        resolve(qrContent)
      } catch {
        reject(new Error('No se pudo leer el código QR de la imagen'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Decodifica un QR desde una imagen (usando librería jsQR)
 * @param {string} imageDataUrl - Data URL de la imagen
 * @returns {Promise<string>}
 */
const decodeQRFromImage = async (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    // Crear imagen
    const img = new Image()
    img.src = imageDataUrl

    img.onload = () => {
      // Crear canvas para procesar imagen
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Obtener datos de la imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Cargar jsQR si no está disponible
      if (!window.jsQR) {
        loadJsQR().then(() => {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            resolve(code.data)
          } else {
            reject(new Error('No se encontró código QR en la imagen'))
          }
        }).catch(reject)
      } else {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          resolve(code.data)
        } else {
          reject(new Error('No se encontró código QR en la imagen'))
        }
      }
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }
  })
}

/**
 * Carga la librería jsQR desde CDN
 * @returns {Promise<void>}
 */
const loadJsQR = () => {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar la librería jsQR'))
    document.head.appendChild(script)
  })
}

/**
 * Inicia el escaneo de QR desde la cámara
 * @param {HTMLVideoElement} videoElement - Elemento de video
 * @param {Function} onScan - Callback cuando se detecta un QR
 * @param {Function} onError - Callback de error
 * @returns {Object} Controles { stop, stream }
 */
export const startQRScanner = async (videoElement, onScan, onError) => {
  try {
    // Cargar jsQR
    await loadJsQR()

    // Verificar que getUserMedia esté disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Tu navegador no soporta acceso a cámara. Intenta actualizar tu navegador.')
    }

    // Verificar contexto seguro (HTTPS) - CRÍTICO PARA MÓVILES
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    console.log('🔒 Contexto seguro (HTTPS):', isSecureContext)
    console.log('📱 Dispositivo:', { isMobile, isIOS })

    // ADVERTENCIA: Navegadores móviles requieren HTTPS para cámara
    if (isMobile && !isSecureContext) {
      const httpsWarning = new Error(
        'Los navegadores móviles requieren HTTPS para acceder a la cámara. ' +
        'Por favor accede desde una conexión segura (https://) o usa la opción de subir imagen.'
      )
      httpsWarning.name = 'NotSecureContextError'
      throw httpsWarning
    }

    // Configuraciones de cámara optimizadas para móviles
    const cameraConfigs = [
      // Config 1: Cámara trasera con resolución moderada (mejor para móviles)
      {
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      },
      // Config 2: Cámara trasera sin exact (más compatible)
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      // Config 3: Cualquier cámara con resolución media
      {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        }
      },
      // Config 4: Solo video básico (máxima compatibilidad)
      { video: true }
    ]

    let stream = null
    let lastError = null

    // Intentar con cada configuración
    for (let i = 0; i < cameraConfigs.length; i++) {
      const config = cameraConfigs[i]
      try {
        console.log(`🎥 Intento ${i + 1}/${cameraConfigs.length}:`, config)
        stream = await navigator.mediaDevices.getUserMedia(config)
        console.log('✅ Cámara iniciada exitosamente')
        break
      } catch (err) {
        console.warn(`⚠️ Intento ${i + 1} falló:`, err.name, err.message)
        lastError = err

        // Si es NotAllowedError (permiso denegado), no seguir intentando
        if (err.name === 'NotAllowedError') {
          throw err
        }

        continue
      }
    }

    if (!stream) {
      throw lastError || new Error('No se pudo acceder a ninguna cámara')
    }

    videoElement.srcObject = stream
    videoElement.setAttribute('playsinline', true)
    await videoElement.play()

    // Canvas para procesar frames
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
        const code = window.jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          console.log('✅ QR detectado:', code.data)
          onScan(code.data)
          return // Detener escaneo
        }
      }

      animationId = requestAnimationFrame(tick)
    }

    tick()

    // Retornar controles
    return {
      stop: () => {
        scanning = false
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
        stream.getTracks().forEach(track => track.stop())
        videoElement.srcObject = null
      },
      stream
    }
  } catch (error) {
    console.error('❌ Error al iniciar escáner:', error)
    onError(error)
    throw error
  }
}

/**
 * Verifica si el dispositivo tiene cámara disponible
 * @returns {Promise<boolean>}
 */
export const hasCameraAccess = async () => {
  try {
    // Verificar si getUserMedia está disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('❌ getUserMedia no soportado')
      return false
    }

    // Intentar solicitar permiso de cámara
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Detener inmediatamente el stream de prueba
      stream.getTracks().forEach(track => track.stop())
      console.log('✅ Permiso de cámara concedido')
      return true
    } catch (permissionError) {
      console.warn('⚠️ Permiso de cámara denegado o no disponible:', permissionError)

      // Verificar dispositivos disponibles como fallback
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasCamera = devices.some(device => device.kind === 'videoinput')

      if (hasCamera) {
        console.log('📹 Cámara detectada pero permiso no concedido')
      }

      return hasCamera
    }
  } catch (error) {
    console.error('❌ Error al verificar cámara:', error)
    return false
  }
}

/**
 * Desencripta el tenantId desde un QR escaneado
 * @param {string} encryptedData - Datos encriptados del QR
 * @returns {string} TenantId desencriptado
 */
export const decryptTenantIdFromQR = (encryptedData) => {
  try {
    // Desencriptar desde Base64
    const decryptedTenantId = atob(encryptedData)
    console.log('🔓 TenantId desencriptado:', decryptedTenantId)
    return decryptedTenantId
  } catch (error) {
    console.error('❌ Error al desencriptar tenantId:', error)
    throw new Error('QR inválido o corrupto')
  }
}

export default {
  isValidImageFile,
  readQRFromFile,
  startQRScanner,
  hasCameraAccess,
  decryptTenantIdFromQR
}
