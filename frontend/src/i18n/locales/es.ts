// Spanish (neutral Latin American) catalog.
//
// Typed as a COMPLETE Catalog on purpose: a key missing here is a tsc error,
// not a silent English fallback. If you add a key to en.ts, tsc will tell you
// to add it here too.

import type { Catalog } from '../catalog'

export const es: Catalog = {
  // ─── Language switcher ────────────────────────────────────────────────
  'lang.label': 'Idioma',
  'lang.switchTo': 'Cambiar idioma',

  // ─── Shared UI ────────────────────────────────────────────────────────
  'common.back': 'Atrás',
  'common.backToOptions': 'Volver a las opciones',
  'common.loading': 'Cargando...',
  'common.tryAgain': 'Reintentar',
  'common.continue': 'Continuar',
  'common.processing': 'Procesando...',
  'common.processingEllipsis': 'Procesando…',
  'common.uploading': 'Subiendo...',
  'common.goBack': 'Volver',
  'common.retake': 'Repetir',
  'common.usePhoto': 'Usar foto',
  'common.skip': 'Omitir',
  'common.done': 'Listo',
  'common.restarting': 'Reiniciando...',
  'common.restartingEllipsis': 'Reiniciando…',
  'common.poweredBy': 'Con tecnología de Idswyft',
  'common.closeWindow': 'Ya puedes cerrar esta ventana.',
  'common.redirecting': 'Redirigiendo en 3 segundos...',
  'common.redirectingEllipsis': 'Redirigiendo en 3 segundos…',
  'common.preparingSession': 'Preparando tu sesión...',
  'common.startingCamera': 'Iniciando la cámara…',
  'common.restartCamera': 'Reiniciar cámara',
  'common.enableCamera': 'Activar cámara',
  'common.maxRetries': 'Alcanzaste el máximo de intentos.',
  'common.logoAlt': 'Logotipo',
  'common.photoCaptured': '¡Foto capturada!',
  'common.documentPreviewAlt': 'Vista previa del documento',
  'common.selfiePreviewAlt': 'Vista previa de la selfie',

  // ─── Status badges ────────────────────────────────────────────────────
  'badge.pass': 'PASA',
  'badge.fail': 'FALLA',
  'badge.review': 'REVISIÓN',
  'badge.verified': 'VERIFICADO',
  'badge.failed': 'FALLIDO',
  'badge.err': 'ERR',
  'badge.error': 'ERROR',
  'badge.warn': 'AVISO',
  'badge.captured': 'CAPTURADO',
  'badge.recommended': 'RECOMENDADO',

  // ─── Result field labels ──────────────────────────────────────────────
  'field.status': 'Estado',
  'field.confidence': 'Confianza',
  'field.faceMatch': 'Coincidencia facial',
  'field.liveness': 'Prueba de vida',
  'field.livenessScore': 'Puntaje de vida',
  'field.livenessCheck': 'Prueba de vida',
  'field.faceMatching': 'Coincidencia facial',
  'field.crossValidation': 'Validación cruzada',
  'field.docCrossCheck': 'Cotejo del documento',
  'field.verdict': 'Veredicto',
  'field.amlScreening': 'Filtro AML',
  'field.riskScore': 'Puntaje de riesgo',
  'field.rejection': 'Rechazo',
  'field.detail': 'Detalle',
  'field.ageCheck': 'Control de edad',
  'field.minimumAge': 'Edad mínima',
  'field.name': 'Nombre',
  'field.documentNumber': 'N.º de documento',
  'field.dateOfBirth': 'Fecha de nacimiento',
  'field.expiry': 'Vencimiento',
  'field.nationality': 'Nacionalidad',
  'field.score': 'Puntaje',
  'field.nameMatch': 'Coincidencia de nombre',
  'field.address': 'Dirección',
  'field.clear': 'Sin coincidencias',
  'field.passed': 'Aprobado',
  'field.failed': 'Fallido',
  'field.enabled': 'Activado',
  'field.disabled': 'Desactivado',
  'field.pendingReview': 'Pendiente de revisión',

  // ─── Document types ───────────────────────────────────────────────────
  'docType.label': 'Tipo de documento',
  'docType.national_id': 'Documento de identidad',
  'docType.passport': 'Pasaporte',
  'docType.drivers_license': 'Licencia de conducir',
  'docType.utility_bill': 'Factura de servicios',
  'docType.bank_statement': 'Estado de cuenta bancario',
  'docType.tax_document': 'Documento fiscal',

  // ─── Session errors ───────────────────────────────────────────────────
  'session.expired': 'Este enlace de verificación venció. Solicita uno nuevo.',
  'session.invalid': 'Enlace de verificación inválido o vencido.',
  'session.unavailableTitle': 'Verificación no disponible',

  // ─── Preview / view-only banner ───────────────────────────────────────
  'preview.title': 'Modo de vista previa',
  'preview.body':
    'Esta página necesita un token {token} (de {endpoint}) para iniciar una verificación real.',
  'preview.readonly': 'Estás viendo una vista previa de solo lectura.',

  // ─── Device choice screen ─────────────────────────────────────────────
  'choice.title': 'Verifica tu identidad',
  'choice.titleWithCompany': 'Verifica con {company}',
  'choice.titleAge': 'Verifica tu edad',
  'choice.subtitle': 'Elige cómo quieres completar la verificación',
  'choice.subtitleAge': 'Sube tu documento para confirmar que tienes {age} años o más',
  'choice.mobile.eyebrow': 'MÓVIL',
  'choice.mobile.title': 'Continúa en tu teléfono',
  'choice.mobile.benefit1': 'Mejor calidad de cámara',
  'choice.mobile.benefit2': 'Captura guiada paso a paso',
  'choice.mobile.benefit3': 'Mayor tasa de éxito',
  'choice.mobile.cta': 'Escanear código QR',
  'choice.desktop.eyebrow': 'ESCRITORIO',
  'choice.desktop.title': 'Usar este dispositivo',
  'choice.desktop.body':
    'Sube fotos y usa tu cámara web para completar la verificación en esta computadora.',
  'choice.desktop.cta': 'Continuar en escritorio',

  // ─── Age-only completion ──────────────────────────────────────────────
  'age.verified': 'Edad verificada',
  'age.failedTitle': 'No se pudo verificar la edad',
  'age.meetsRequirement': 'Cumples con la edad mínima requerida de {age} años.',
  'age.couldNotComplete': 'No se pudo completar la verificación de edad.',

  // ─── Proof-of-address step ────────────────────────────────────────────
  'address.title': 'Identidad verificada',
  'address.subtitle':
    'Ahora sube un comprobante de domicilio para completar tu verificación.',
  'address.uploadPrompt': 'Haz clic para subir o arrastra el archivo',
  'address.uploadHint': 'JPEG, PNG o PDF (máx. 10 MB)',
  'address.verifyCta': 'Verificar domicilio',
  'address.skip': 'Omitir — lo haré más tarde',
  'address.verified': 'Domicilio verificado',
  'address.underReview': 'Domicilio en revisión',

  // ─── Continue-on-phone (QR handoff) ───────────────────────────────────
  'phone.title': 'Continuar en el teléfono',
  'phone.recommended': 'Recomendado',
  'phone.body': 'Mejor calidad de cámara para la prueba de vida y la captura del documento.',
  'phone.generate': 'Generar código QR',
  'phone.generating': 'Generando…',
  'phone.qrError': 'No se pudo generar el código QR. Inténtalo de nuevo.',
  'phone.scanPrompt': 'Escanea con la cámara de tu teléfono',
  'phone.waiting': 'Esperando al teléfono…',
  'phone.cancel': 'Cancelar — usar este dispositivo',
  'phone.completedOnMobile': 'Completado en el dispositivo móvil',
  'phone.localTipTitle': 'Consejo para desarrollo local:',
  'phone.localTipBody':
    'Abre esta página en {url} (tu IP de red local) para que el código QR funcione en tu teléfono.',

  // ─── Shared completion screen ─────────────────────────────────────────
  'completion.verified': 'Verificación completada',
  'completion.failedHeading': 'Verificación fallida',
  'completion.reviewHeading': 'Verificación en revisión',
  'completion.successBody': 'Tu identidad se verificó correctamente.',
  'completion.failedBody': 'No se pudo completar la verificación. Inténtalo de nuevo.',
  'completion.reviewBody': 'Tu verificación está en revisión. Te notificaremos el resultado.',

  // ─── Desktop flow ─────────────────────────────────────────────────────
  'desktop.step.start': 'Inicio',
  'desktop.step.frontId': 'Frente',
  'desktop.step.scanning': 'Leyendo',
  'desktop.step.backId': 'Reverso',
  'desktop.step.checking': 'Cotejo',
  'desktop.step.selfie': 'Selfie',
  'desktop.step.voice': 'Voz',
  'desktop.step.done': 'Listo',
  'desktop.step.uploadId': 'Subir ID',

  'desktop.choice.title': '¿Cómo quieres verificarte?',
  'desktop.choice.subtitle':
    'Completa en este dispositivo o escanea un código QR para usar tu teléfono',
  'desktop.choice.desktopEyebrow': 'ESCRITORIO',
  'desktop.choice.startHere': 'Empezar aquí',
  'desktop.choice.startHereBody': 'Usa tu cámara web y sube los documentos en este dispositivo',
  'desktop.choice.startCta': 'Empezar en este dispositivo',

  'desktop.init.title': 'Iniciando la verificación',
  'desktop.init.body': 'Preparando tu sesión de verificación...',

  'desktop.front.title': 'Sube el frente de tu documento',
  'desktop.front.titleAge': 'Sube tu documento',
  'desktop.front.body':
    'Toma una foto nítida del frente de tu documento oficial de identidad',
  'desktop.front.bodyAge': 'Sube tu documento oficial de identidad para verificar tu edad',
  'desktop.front.bodyIdentity':
    'Toma una foto nítida del frente de tu documento -- no hace falta el reverso',

  'desktop.scanning.title': 'Leyendo tu documento',
  'desktop.scanning.body': 'Extrayendo la información del frente de tu documento...',
  'desktop.scanning.hint': 'No cierres esta ventana',

  'desktop.back.title': 'Sube el reverso de tu documento',
  'desktop.back.body': 'Necesitamos ambos lados para cotejar tu identidad',

  'desktop.crossCheck.title': 'Verificando tus documentos',
  'desktop.crossCheck.body': 'Cotejando el frente y el reverso de tu documento...',
  'desktop.crossCheck.item1': 'Lectura de código de barras / QR',
  'desktop.crossCheck.item2': 'Validación cruzada de datos',
  'desktop.crossCheck.item3': 'Control de autenticidad',

  'desktop.ocrSummary.title': 'Frente del documento -- datos extraídos',
  'desktop.upload.cta': 'Subir el frente del documento',
  'desktop.upload.ctaBack': 'Subir el reverso del documento',
  'desktop.upload.hint': 'JPG o PNG, hasta 10 MB',
  'desktop.upload.previewAlt': 'Vista previa',

  'desktop.result.processingTitle': 'Procesando la verificación',
  'desktop.result.processingBody': 'Analizando tu foto en vivo...',
  'desktop.result.identityVerified': 'Identidad verificada',
  'desktop.result.failed': 'Verificación fallida',
  'desktop.result.underReview': 'En revisión',
  'desktop.result.successBody': 'Tu identidad se verificó correctamente.',
  'desktop.result.failedBody': 'No se pudo completar la verificación. Inténtalo de nuevo.',
  'desktop.result.reviewBody':
    'Tu verificación está en revisión manual. Te notificaremos el resultado.',

  'desktop.error.missingParams': 'Faltan parámetros obligatorios',
  'desktop.error.startFailed': 'No se pudo iniciar la verificación',
  'desktop.error.uploadFailed': 'No se pudo subir el documento',
  'desktop.error.uploadBackFailed': 'No se pudo subir el reverso del documento',
  'desktop.error.timedOut': 'La verificación tardó demasiado. Recarga la página e inténtalo de nuevo.',
  'desktop.error.validationTimedOut':
    'La validación del documento tardó demasiado. Recarga la página e inténtalo de nuevo.',
  'desktop.error.liveTimedOut':
    'La captura en vivo tardó demasiado. Recarga la página e inténtalo de nuevo.',
  'desktop.error.restartFailed': 'No se pudo reiniciar la verificación',
  'desktop.toast.uploaded': 'Documento subido correctamente',
  'desktop.toast.backUploaded': 'Reverso del documento subido',

  // ─── Voice / speaker verification ─────────────────────────────────────
  'voice.title': 'Verificación de voz',
  'voice.subtitle': 'Di en voz alta los dígitos que aparecen abajo.',
  'voice.speakDigits': 'Di estos dígitos',
  'voice.expiresIn': 'Vence en {seconds} s',
  'voice.recording': 'Grabando: {seconds} s',
  'voice.captured': 'Grabado ({seconds} s)',
  'voice.capturedLong': 'Grabación capturada ({seconds} s)',
  'voice.getChallenge': 'Obtener desafío',
  'voice.getChallengeDigits': 'Obtener dígitos del desafío',
  'voice.startRecording': 'Empezar a grabar',
  'voice.stopRecording': 'Detener grabación',
  'voice.submit': 'Enviar voz',
  'voice.submitCapture': 'Enviar grabación de voz',
  'voice.requestNew': 'Solicitar un nuevo desafío',
  'voice.error.challengeFailed': 'No se pudo obtener el desafío',
  'voice.error.micDenied': 'Acceso al micrófono denegado',
  'voice.error.verifyFailed': 'No se pudo verificar la voz',

  // ─── Mobile flow ──────────────────────────────────────────────────────
  'mobile.secureSession': 'Sesión segura',
  'mobile.unableToLoad': 'No se pudo cargar',

  'mobile.step.frontId': 'Frente',
  'mobile.step.backId': 'Reverso',
  'mobile.step.checking': 'Cotejo',
  'mobile.step.livePhoto': 'Foto viva',
  'mobile.step.voice': 'Voz',
  'mobile.step.complete': 'Listo',
  'mobile.step.uploadId': 'Subir ID',

  'mobile.stepOf': 'Paso {current} de {total} — {label}',
  'mobile.label.uploadId': 'Sube tu documento',
  'mobile.label.frontOfId': 'Frente del documento',
  'mobile.label.backOfId': 'Reverso del documento',
  'mobile.label.verification': 'Verificación',
  'mobile.label.livePhoto': 'Foto en vivo',

  'mobile.front.title': 'Escanea el frente\nde tu documento',
  'mobile.front.titleAge': 'Sube tu documento\npara verificar tu edad',
  'mobile.front.body':
    'Coloca tu documento y toma una foto nítida. Asegúrate de que se vean las cuatro esquinas y que el texto se lea bien.',
  'mobile.front.bodyAge':
    'Revisaremos tu fecha de nacimiento para confirmar que tienes {age} años o más. No se guarda ningún otro dato.',
  'mobile.front.tip': 'Buena luz · Sin reflejos · Pulso firme',
  'mobile.front.reading': 'LEYENDO FRENTE',
  'mobile.front.takePhoto': 'Tomar foto del frente',
  'mobile.front.scan': 'Escanear el frente',

  'mobile.back.title': 'Ahora dale la vuelta\ny escanea el reverso',
  'mobile.back.body':
    'Mantén las mismas condiciones: buena luz y superficie plana. El código de barras del reverso debe verse completo.',
  'mobile.back.tip': 'El código de barras debe verse completo',
  'mobile.back.reading': 'LEYENDO CÓDIGO',
  'mobile.back.takePhoto': 'Tomar foto del reverso',
  'mobile.back.scan': 'Escanear el reverso',

  'mobile.checking.msg1': 'Verificando tu documento…',
  'mobile.checking.msg2': 'Cotejando los datos…',
  'mobile.checking.msg3': 'Ya casi…',
  'mobile.checking.hint': 'Esto solo toma un momento',
  'mobile.checking.tag1': 'Documento leído',
  'mobile.checking.tag2': 'Datos cotejados',
  'mobile.checking.tag3': 'Controles de seguridad',
  'mobile.checking.overlay': 'COTEJANDO',

  'mobile.live.title': 'Prueba de vida',
  'mobile.live.body':
    'Sigue las instrucciones en pantalla: mira a la cámara y gira la cabeza cuando se te indique.',
  'mobile.live.tip': 'Sin lentes · Cara bien iluminada · Sin gorra',
  'mobile.live.start': 'Iniciar prueba de vida',
  'mobile.live.selfieTitle': 'Tómate una\nselfie rápida',
  'mobile.live.selfieBody':
    'Necesitamos confirmar que tu rostro coincide con tu documento. Mira directo a la cámara en un lugar bien iluminado.',
  'mobile.live.takeSelfie': 'Tomar selfie',
  'mobile.live.submitSelfie': 'Enviar selfie',
  'mobile.live.cueLookAhead': 'Mira al frente',
  'mobile.live.cueSmile': 'Sonríe',
  'mobile.live.cueTurn': 'Gira un poco',

  'mobile.done.processing': 'Procesando tu verificación…',
  'mobile.done.analyzingLive': 'Analizando tu foto en vivo',
  'mobile.done.finalizing': 'Finalizando tu verificación',
  'mobile.done.eyebrowAge': 'Edad verificada',
  'mobile.done.eyebrowDocument': 'Documento verificado',
  'mobile.done.eyebrowFull': 'Verificación completa',
  'mobile.done.title': 'Todo listo',
  'mobile.done.redirectBody': 'Verificación completa. Te estamos redirigiendo…',
  'mobile.done.bodyAge':
    'Tu edad quedó verificada. Puedes cerrar esta pestaña y volver a tu computadora.',
  'mobile.done.bodyDocument':
    'Tu documento quedó verificado. Puedes cerrar esta pestaña y volver a tu computadora.',
  'mobile.done.bodyFull':
    'Tu identidad quedó verificada. Puedes cerrar esta pestaña y volver a tu computadora.',
  'mobile.done.checkDocScanned': 'Documento escaneado',
  'mobile.done.checkAgeMet': 'Edad mínima ({age}+) cumplida',
  'mobile.done.checkDocVerified': 'Documento de identidad verificado',
  'mobile.done.checkDetailsConfirmed': 'Datos del documento confirmados',
  'mobile.done.checkLiveness': 'Prueba de vida superada',
  'mobile.done.checkFaceMatch': 'Rostro coincide correctamente',
  'mobile.done.patchFailed':
    'Nota: no pudimos avisarle a tu computadora automáticamente. Recárgala para ver tu resultado.',
  'mobile.done.failedAge': 'No se pudo verificar la edad',
  'mobile.done.failedDocument': 'No se pudo verificar el documento',
  'mobile.done.failedFull': 'Verificación fallida',
  'mobile.done.underReview': 'En revisión',
  'mobile.done.failedBody':
    'No pudimos verificar tu identidad. Vuelve a tu computadora para ver los detalles.',
  'mobile.done.reviewBody':
    'Tu verificación está en revisión. Te notificaremos el resultado.',

  'mobile.error.noToken': 'Enlace inválido: no se recibió ningún token.',
  'mobile.error.qrExpired':
    'Este código QR venció. Genera uno nuevo desde tu computadora.',
  'mobile.error.linkUsed': 'Este enlace ya se usó.',
  'mobile.error.linkInvalid': 'Enlace inválido o no reconocido.',
  'mobile.error.sessionIncomplete':
    'La respuesta de la sesión está incompleta. Vuelve a escanear el código QR.',
  'mobile.error.network':
    'No pudimos conectar con el servidor de verificación. Asegúrate de que tu teléfono y tu computadora estén en la misma red Wi-Fi y vuelve a escanear el código QR.',
  'mobile.error.startFailed': 'No se pudo iniciar la verificación',
  'mobile.error.uploadFailed': 'No se pudo subir el archivo',
  'mobile.error.blurryId':
    'La foto de tu documento no se ve con suficiente claridad. Vuelve a tomarla con buena luz.',
  'mobile.error.ocrTimeout': 'La lectura del documento tardó demasiado. Inténtalo de nuevo.',
  'mobile.error.validationTimeout': 'La validación tardó demasiado. Inténtalo de nuevo.',
  'mobile.error.livenessFailed': 'No se superó la prueba de vida',
  'mobile.error.selfieFailed': 'No se pudo subir la selfie',
  'mobile.error.tooLong': 'La verificación está tardando demasiado. Cierra e inténtalo de nuevo.',
  'mobile.error.restartFailed': 'No se pudo reiniciar la verificación',

  // ─── Active liveness ──────────────────────────────────────────────────
  'liveness.intro.title': 'Se necesita acceso a la cámara',
  'liveness.intro.body':
    'Usaremos la cámara frontal para una prueba de vida rápida y confirmar que realmente eres tú. Tu video se procesa para la prueba y no se guarda como grabación.',
  'liveness.intro.start': 'Iniciar cámara',
  'liveness.errorTitle': 'Error de cámara',

  'liveness.phase.ready': 'Coloca tu rostro dentro del óvalo',
  'liveness.phase.turnLeft': 'Gira lentamente la cabeza a la izquierda',
  'liveness.phase.turnRight': 'Gira lentamente la cabeza a la derecha',
  'liveness.phase.returnCenter': 'Ahora mira al frente',
  'liveness.phase.capturing': 'No te muevas — capturando...',
  'liveness.phase.completed': '¡Prueba de vida superada!',
  'liveness.phase.failed': 'No se superó la prueba de vida. Toca para reintentar.',
  'liveness.phase.fallback': 'Cámara no disponible. Usando la captura estándar.',

  'liveness.tip.ready': 'Buena luz · Rostro descubierto · Sin lentes de sol',
  'liveness.tip.failed': 'Asegúrate de tener buena luz y el rostro centrado',
  'liveness.tip.completed': 'Verificación completa',
  'liveness.tip.default': 'Mantén tu rostro visible en todo momento',

  'liveness.processing': 'Procesando la verificación...',
  'liveness.processingSub': 'Analizando tu documento y tu identidad',

  'liveness.error.timedOut': 'El desafío tardó demasiado. Inténtalo de nuevo.',
  'liveness.error.noCanvas': 'No hay lienzo disponible para la captura',
  'liveness.error.noContext': 'No hay contexto de lienzo disponible',
  'liveness.error.frameFailed': 'No se pudo capturar el fotograma',
  'liveness.error.permissionDenied':
    'Acceso a la cámara denegado. Permite el acceso en la configuración de tu navegador e inténtalo de nuevo.',
  'liveness.error.notFound': 'No se detectó ninguna cámara en este dispositivo.',
  'liveness.error.inUse':
    'Otra aplicación está usando la cámara. Ciérrala e inténtalo de nuevo.',
  'liveness.error.overconstrained':
    'La cámara no cumple los requisitos (se necesita una cámara frontal).',
  'liveness.error.generic': 'Falló el acceso a la cámara ({name}): {message}',
  'liveness.error.unknown': 'Falló el acceso a la cámara por un motivo desconocido.',
  'liveness.error.previewFailed':
    'No se pudo iniciar la vista previa del video. Inténtalo de nuevo.',
  'liveness.error.startTimeout':
    'La cámara no se inició en 8 segundos. Inténtalo de nuevo.',

  // ─── Guided ID camera ─────────────────────────────────────────────────
  'idcam.frontOfId': 'Frente del documento',
  'idcam.backOfId': 'Reverso del documento',
  'idcam.positionFront': 'Coloca el frente de tu documento',
  'idcam.positionBack': 'Coloca el lado del código de barras',
  'idcam.guidance.blurry': 'Acércate más a tu documento',
  'idcam.guidance.medium': 'Mantén el pulso firme…',
  'idcam.guidance.sharp': '¡Perfecto! Capturando…',
  'idcam.error.noAccess': 'No se pudo acceder a la cámara. Revisa los permisos.',
  'idcam.error.restartFailed': 'No se pudo reiniciar la cámara.',
  'idcam.capturedAlt': 'Documento capturado',
  'idcam.closeLabel': 'Cerrar la cámara',

  // ─── Guided selfie camera ─────────────────────────────────────────────
  'selfiecam.title': 'Selfie',
  'selfiecam.guidance.noFace': 'Coloca tu rostro dentro del óvalo',
  'selfiecam.guidance.adjusting': 'Centra tu rostro… mantén el pulso firme',
  'selfiecam.guidance.ready': '¡Perfecto! Capturando…',
  'selfiecam.error.noAccess': 'No se pudo acceder a la cámara frontal. Revisa los permisos.',
  'selfiecam.capturedAlt': 'Selfie capturada',

  // ─── Live capture widget ──────────────────────────────────────────────
  'widget.title': 'Captura de foto en vivo',
  'widget.subtitleActive': 'Sigue las instrucciones en pantalla para verificar tu identidad',
  'widget.subtitleFallback': 'Necesitamos una foto en vivo para verificar tu identidad',
  'widget.capturedTitle': 'Foto capturada',
  'widget.capturedBody': 'Procesando tu verificación...',
  'widget.cameraEyebrow': 'CÁMARA',
  'widget.accessTitle': 'Se necesita acceso a la cámara',
  'widget.accessBody':
    'Necesitamos tu cámara para tomar una foto en vivo y verificar tu identidad.',
  'widget.startingCamera': 'Iniciando la cámara...',
  'widget.startingCameraBody': 'Iniciando la cámara...',
  'widget.cameraFailed': 'Falló la cámara',
  'widget.faceDetectedStats':
    'Rostro detectado / Vida {liveness}% / Estabilidad {stability}%',
  'widget.positionFace': 'Coloca tu rostro en el centro del cuadro',
  'widget.holdStill': 'No te muevas...',
  'widget.positionFirst': 'Primero coloca tu rostro',
  'widget.improveLighting': 'Mejora la luz y no te muevas',
  'widget.capturePhoto': 'Capturar foto',
  'widget.blinkTwice': 'Mira directo a la cámara y parpadea dos veces...',
  'widget.tip1': 'Procura buena luz -- evita el contraluz',
  'widget.tip2': 'Centra tu rostro en el cuadro y no te muevas',
  'widget.tip3': 'Espera el indicador de «rostro detectado» antes de capturar',
  'widget.overlay.faceDetected': 'Rostro detectado',
  'widget.overlay.positionFace': 'Coloca tu rostro',
  'widget.error.notSupported': 'Este navegador no admite el uso de la cámara',
  'widget.error.permissionDenied':
    'Acceso a la cámara denegado. Activa el acceso a la cámara.',
  'widget.error.notFound': 'No se encontró ninguna cámara.',
  'widget.error.inUse': 'Otra aplicación ya está usando la cámara.',
  'widget.error.generic': 'Error de cámara: {message}',
  'widget.error.noFace': 'No se detecta ningún rostro. Colócalo dentro del cuadro.',
  'widget.error.lighting': 'Asegúrate de tener buena luz y que tu rostro se vea con claridad.',
  'widget.error.steady': 'Mantén tu rostro quieto dentro del cuadro.',
  'widget.error.faceLost': 'Se perdió el rostro durante la cuenta regresiva. Inténtalo de nuevo.',
  'widget.error.missingData': 'Faltan datos necesarios para la captura.',
  'widget.error.captureFailed': 'Falló la captura en vivo',
  'widget.error.timedOut': 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.',
  'widget.error.retryFailed': 'Falló la captura. Inténtalo de nuevo.',
  'widget.error.maxAttempts':
    'Alcanzaste el máximo de intentos de captura. Recarga la página e inténtalo de nuevo.',
  'widget.error.cancelled': 'Captura en vivo cancelada',
  'widget.error.livenessFailed': 'No se pudo verificar la prueba de vida',

  // ─── Standalone live-capture page ─────────────────────────────────────
  'livepage.eyebrow': 'idswyft / captura-en-vivo',
  'livepage.title': 'Verificación de identidad en vivo',
  'livepage.subtitle': 'Completa tu verificación con una captura facial en vivo',
  'livepage.expiredTitle': 'Sesión vencida',
  'livepage.expiredBody':
    'Tu sesión de captura en vivo venció. Inicia una nueva verificación.',
  'livepage.startNew': 'Iniciar una nueva verificación',
  'livepage.processing': 'Procesando...',
  'livepage.captureComplete': 'Captura completa',
  'livepage.processingBody': 'Espera mientras verificamos tu identidad.',
  'livepage.verifiedBody': 'Tu identidad se verificó correctamente.',
  'livepage.failedBody': 'Falló la verificación. Inténtalo de nuevo.',
  'livepage.reviewBody': 'Tu verificación está en revisión manual.',
  'livepage.processedBody': 'Tu captura en vivo se procesó correctamente.',
  'livepage.viewResults': 'Ver resultados completos',
  'livepage.checkingStatus': 'Consultando el estado de la verificación...',
  'livepage.processingVerification': 'Procesando la verificación...',
  'livepage.checkManually': 'Consultar los resultados manualmente',
  'livepage.accessTitle': 'Se necesita acceso a la cámara',
  'livepage.accessBody':
    'Necesitamos acceso a tu cámara para la verificación de identidad en vivo con tecnología Face-API.',
  'livepage.loadingFaceApi': 'Cargando Face-API...',
  'livepage.initializingCamera': 'Iniciando la cámara...',
  'livepage.cameraFailedTitle': 'Falló el acceso a la cámara',
  'livepage.challengeTitle': 'Desafío de prueba de vida',
  'livepage.defaultChallenge': 'Mira directo a la cámara y parpadea dos veces',
  'livepage.faceReady': 'Rostro detectado -- listo',
  'livepage.noFace': 'No se detecta ningún rostro',
  'livepage.positionInFrame': 'Coloca tu rostro dentro del cuadro',
  'livepage.livenessPct': 'Vida: {value}%',
  'livepage.stabilityPct': 'Estabilidad: {value}%',
  'livepage.getReady': 'Prepárate...',
  'livepage.attempts': 'Intentos: {current}/{max}',
  'livepage.expiresAt': 'Vence: {time}',
  'livepage.positionYourFace': 'Coloca tu rostro',
  'livepage.improveLighting': 'Mejora la luz',
  'livepage.holdSteady': 'No te muevas',
  'livepage.startCapture': 'Iniciar captura',
  'livepage.performingChallenge': 'Ejecutando el desafío...',
  'livepage.instructionsTitle': 'Instrucciones para la captura en vivo',
  'livepage.instruction1': 'Usa Face-API para un procesamiento de cámara confiable',
  'livepage.instruction2': 'Procura buena luz sobre tu rostro',
  'livepage.instruction3': 'Coloca tu rostro en el centro del cuadro',
  'livepage.instruction4': 'Espera el indicador verde de rostro detectado',
  'livepage.statusPrefix': 'Estado: {info}',
  'livepage.overlay.faceDetected': 'ROSTRO DETECTADO',
  'livepage.overlay.positionFace': 'COLOCA TU ROSTRO EN EL CUADRO',
  'livepage.overlay.stats': 'VIDA {liveness}%  |  ESTABILIDAD {stability}%',
  'livepage.error.noToken': 'Token de captura en vivo inválido o ausente',
  'livepage.error.takingLong':
    'La verificación está tardando más de lo esperado. Consulta los resultados manualmente.',
  'livepage.error.statusCheck':
    'No se pudo consultar el estado de la verificación. Intenta recargar la página.',
  'livepage.error.noCanvas': 'No se encontró el elemento de lienzo. Recarga la página.',
  'livepage.error.accessFailed': 'Falló el acceso a la cámara',
  'livepage.error.permissionDenied':
    'Acceso a la cámara denegado. Activa el acceso a la cámara.',
  'livepage.error.notFound': 'No se encontró ninguna cámara. Conecta una cámara.',
  'livepage.error.inUse': 'Otra aplicación ya está usando la cámara.',
  'livepage.error.security': 'Acceso a la cámara bloqueado por la configuración de seguridad.',
  'livepage.error.generic': 'Error de cámara: {message}',
  'livepage.error.unknown': 'Error desconocido',
  'livepage.error.missingData': 'Faltan datos necesarios para la captura',
  'livepage.error.faceLostCapture':
    'Se perdió la detección del rostro. Asegúrate de que se vea con claridad e inténtalo de nuevo.',
  'livepage.error.noFaceDetected':
    'No se detecta ningún rostro. Colócalo con claridad en el centro del cuadro.',
  'livepage.error.poorLighting':
    'Asegúrate de tener buena luz y de que tu rostro se vea con claridad para la prueba de vida.',
  'livepage.error.unsteady': 'Mantén tu rostro quieto en el centro del cuadro.',
  'livepage.error.faceLostCountdown':
    'Se perdió la detección del rostro durante la cuenta regresiva. Inténtalo de nuevo.',
  'livepage.error.faceLostRemain':
    'Se perdió la detección del rostro durante la cuenta regresiva. Mantén tu rostro visible.',
  'livepage.error.captureFailed': 'No se pudo capturar la imagen. Inténtalo de nuevo.',
  'livepage.error.timedOut':
    'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.',
  'livepage.error.maxAttempts':
    'Superaste el máximo de intentos de captura. Recarga la página e inténtalo de nuevo.',
  'livepage.error.liveCaptureFailed': 'Falló la captura en vivo',
  'livepage.error.livenessFailed': 'No se pudo verificar la prueba de vida',
}
