// English catalog — the SOURCE OF TRUTH for the end-user verification flow.
//
// TranslationKey is derived from this object, so:
//   • t('does.not.exist')      → tsc error
//   • a key missing from es.ts → tsc error (es is typed as a complete Catalog)
//
// Keys are FLAT and dot-namespaced by surface. Keep them that way — nesting
// would need recursive key types for no practical gain.
//
// Scope: only what an end user sees while verifying. The developer portal,
// docs, and admin surfaces are intentionally English-only.
//
// NOT in here (by design): copy the integrating developer authors — page-builder
// headerTitle / headerSubtitle / step labels / completionTitle / completionMessage,
// and branding.company_name. Those are the customer's words and must never be
// overwritten by a translation.

export const en = {
  // ─── Language switcher ────────────────────────────────────────────────
  'lang.label': 'Language',
  'lang.switchTo': 'Switch language',

  // ─── Shared UI ────────────────────────────────────────────────────────
  'common.back': 'Back',
  'common.backToOptions': 'Back to options',
  'common.loading': 'Loading...',
  'common.tryAgain': 'Try Again',
  'common.continue': 'Continue',
  'common.processing': 'Processing...',
  'common.processingEllipsis': 'Processing…',
  'common.uploading': 'Uploading...',
  'common.goBack': 'Go Back',
  'common.retake': 'Retake',
  'common.usePhoto': 'Use Photo',
  'common.skip': 'Skip',
  'common.done': 'Done',
  'common.restarting': 'Restarting...',
  'common.restartingEllipsis': 'Restarting…',
  'common.poweredBy': 'Powered by Idswyft',
  'common.closeWindow': 'You can close this window.',
  'common.redirecting': 'Redirecting in 3 seconds...',
  'common.redirectingEllipsis': 'Redirecting in 3 seconds…',
  'common.preparingSession': 'Preparing your session...',
  'common.startingCamera': 'Starting camera…',
  'common.restartCamera': 'Restart Camera',
  'common.enableCamera': 'Enable Camera',
  'common.maxRetries': 'Maximum retry attempts reached.',
  'common.logoAlt': 'Logo',
  'common.photoCaptured': 'Photo captured!',
  'common.documentPreviewAlt': 'Document preview',
  'common.selfiePreviewAlt': 'Selfie preview',

  // ─── Status badges ────────────────────────────────────────────────────
  'badge.pass': 'PASS',
  'badge.fail': 'FAIL',
  'badge.review': 'REVIEW',
  'badge.verified': 'VERIFIED',
  'badge.failed': 'FAILED',
  'badge.err': 'ERR',
  'badge.error': 'ERROR',
  'badge.warn': 'WARN',
  'badge.captured': 'CAPTURED',
  'badge.recommended': 'RECOMMENDED',

  // ─── Result field labels ──────────────────────────────────────────────
  'field.status': 'Status',
  'field.confidence': 'Confidence',
  'field.faceMatch': 'Face Match',
  'field.liveness': 'Liveness',
  'field.livenessScore': 'Liveness Score',
  'field.livenessCheck': 'Liveness Check',
  'field.faceMatching': 'Face Matching',
  'field.crossValidation': 'Cross-Validation',
  'field.docCrossCheck': 'Doc Cross-Check',
  'field.verdict': 'Verdict',
  'field.amlScreening': 'AML Screening',
  'field.riskScore': 'Risk Score',
  'field.rejection': 'Rejection',
  'field.detail': 'Detail',
  'field.ageCheck': 'Age Check',
  'field.minimumAge': 'Minimum Age',
  'field.name': 'Name',
  'field.documentNumber': 'Document #',
  'field.dateOfBirth': 'Date of Birth',
  'field.expiry': 'Expiry',
  'field.nationality': 'Nationality',
  'field.score': 'Score',
  'field.nameMatch': 'Name Match',
  'field.address': 'Address',
  'field.clear': 'Clear',
  'field.passed': 'Passed',
  'field.failed': 'Failed',
  'field.enabled': 'Enabled',
  'field.disabled': 'Disabled',
  'field.pendingReview': 'Pending Review',

  // ─── Document types ───────────────────────────────────────────────────
  'docType.label': 'Document Type',
  'docType.national_id': 'National ID',
  'docType.passport': 'Passport',
  'docType.drivers_license': "Driver's License",
  'docType.utility_bill': 'Utility Bill',
  'docType.bank_statement': 'Bank Statement',
  'docType.tax_document': 'Tax Document',

  // ─── Session errors (UserVerificationPage) ────────────────────────────
  'session.expired': 'This verification link has expired. Please request a new one.',
  'session.invalid': 'Invalid or expired verification link.',
  'session.unavailableTitle': 'Verification Unavailable',

  // ─── Preview / view-only banner (shown to integrating developers) ─────
  'preview.title': 'Preview Mode',
  'preview.body':
    'This page requires a {token} token (from {endpoint}) to start a real verification.',
  'preview.readonly': "You're seeing a read-only preview.",

  // ─── Device choice screen ─────────────────────────────────────────────
  'choice.title': 'Verify Your Identity',
  'choice.titleWithCompany': 'Verify with {company}',
  'choice.titleAge': 'Verify Your Age',
  'choice.subtitle': "Choose how you'd like to complete verification",
  'choice.subtitleAge': 'Upload your ID to confirm you are {age}+',
  'choice.mobile.eyebrow': 'MOBILE',
  'choice.mobile.title': 'Continue on Your Phone',
  'choice.mobile.benefit1': 'Better camera quality',
  'choice.mobile.benefit2': 'Guided capture experience',
  'choice.mobile.benefit3': 'Higher success rate',
  'choice.mobile.cta': 'Scan QR Code',
  'choice.desktop.eyebrow': 'DESKTOP',
  'choice.desktop.title': 'Use This Device',
  'choice.desktop.body':
    'Upload photos and use your webcam to complete verification on this computer.',
  'choice.desktop.cta': 'Continue on Desktop',

  // ─── Age-only completion ──────────────────────────────────────────────
  'age.verified': 'Age Verified',
  'age.failedTitle': 'Age Verification Failed',
  'age.meetsRequirement': 'You meet the minimum age requirement of {age}.',
  'age.couldNotComplete': 'Age verification could not be completed.',

  // ─── Proof-of-address step ────────────────────────────────────────────
  'address.title': 'Identity Verified',
  'address.subtitle': 'Now upload a proof-of-address document to complete your verification.',
  'address.uploadPrompt': 'Click to upload or drag and drop',
  'address.uploadHint': 'JPEG, PNG, or PDF (max 10MB)',
  'address.verifyCta': 'Verify Address',
  'address.skip': "Skip -- I'll do this later",
  'address.verified': 'Address Verified',
  'address.underReview': 'Address Under Review',

  // ─── Continue-on-phone (QR handoff) ───────────────────────────────────
  'phone.title': 'Continue on Phone',
  'phone.recommended': 'Recommended',
  'phone.body': 'Better camera quality for liveness and document capture.',
  'phone.generate': 'Generate QR Code',
  'phone.generating': 'Generating…',
  'phone.qrError': 'Could not generate QR code. Please try again.',
  'phone.scanPrompt': 'Scan with your phone camera',
  'phone.waiting': 'Waiting for phone…',
  'phone.cancel': 'Cancel — use this device instead',
  'phone.completedOnMobile': 'Completed on mobile device',
  'phone.localTipTitle': 'Local dev tip:',
  'phone.localTipBody':
    'Open this page at {url} (your LAN IP) so the QR code works on your phone.',

  // ─── Shared completion screen ─────────────────────────────────────────
  'completion.verified': 'Verification Verified',
  'completion.failedHeading': 'Verification Failed',
  'completion.reviewHeading': 'Verification Under Review',
  'completion.successBody': 'Your identity has been successfully verified.',
  'completion.failedBody': 'Verification could not be completed. Please try again.',
  'completion.reviewBody': 'Your verification is being reviewed. You will be notified of the result.',

  // ─── Desktop flow (EndUserVerification) ───────────────────────────────
  'desktop.step.start': 'Start',
  'desktop.step.frontId': 'Front ID',
  'desktop.step.scanning': 'Scanning',
  'desktop.step.backId': 'Back ID',
  'desktop.step.checking': 'Checking',
  'desktop.step.selfie': 'Selfie',
  'desktop.step.voice': 'Voice',
  'desktop.step.done': 'Done',
  'desktop.step.uploadId': 'Upload ID',

  'desktop.choice.title': 'How would you like to verify?',
  'desktop.choice.subtitle': 'Complete on this device or scan a QR code to use your phone',
  'desktop.choice.desktopEyebrow': 'DESKTOP',
  'desktop.choice.startHere': 'Start Here',
  'desktop.choice.startHereBody': 'Use your webcam and upload documents on this device',
  'desktop.choice.startCta': 'Start on This Device',

  'desktop.init.title': 'Starting Verification',
  'desktop.init.body': 'Initializing your verification session...',

  'desktop.front.title': 'Upload Front of ID',
  'desktop.front.titleAge': 'Upload Your ID',
  'desktop.front.body': 'Take a clear photo of the front of your government-issued ID',
  'desktop.front.bodyAge': 'Upload your government-issued ID to verify your age',
  'desktop.front.bodyIdentity': 'Take a clear photo of the front of your ID -- no back scan needed',

  'desktop.scanning.title': 'Reading Your ID',
  'desktop.scanning.body': 'Extracting information from the front of your document...',
  'desktop.scanning.hint': "Please don't close this window",

  'desktop.back.title': 'Upload Back of ID',
  'desktop.back.body': 'We need both sides to cross-validate your identity',

  'desktop.crossCheck.title': 'Verifying Your Documents',
  'desktop.crossCheck.body': 'Cross-checking the front and back of your ID...',
  'desktop.crossCheck.item1': 'Barcode / QR scanning',
  'desktop.crossCheck.item2': 'Data cross-validation',
  'desktop.crossCheck.item3': 'Authenticity check',

  'desktop.ocrSummary.title': 'Front ID -- Extracted Data',
  'desktop.upload.cta': 'Upload Front of ID',
  'desktop.upload.ctaBack': 'Upload Back of ID',
  'desktop.upload.hint': 'JPG, PNG up to 10MB',
  'desktop.upload.previewAlt': 'Preview',

  'desktop.result.processingTitle': 'Processing Verification',
  'desktop.result.processingBody': 'Analyzing your live photo...',
  'desktop.result.identityVerified': 'Identity Verified',
  'desktop.result.failed': 'Verification Failed',
  'desktop.result.underReview': 'Under Review',
  'desktop.result.successBody': 'Your identity has been successfully verified.',
  'desktop.result.failedBody': 'Verification could not be completed. Please try again.',
  'desktop.result.reviewBody':
    'Your verification is under manual review. You will be notified of the result.',

  // Toast + error messages raised by the desktop flow itself
  'desktop.error.missingParams': 'Missing required parameters',
  'desktop.error.startFailed': 'Failed to start verification',
  'desktop.error.uploadFailed': 'Failed to upload document',
  'desktop.error.uploadBackFailed': 'Failed to upload back document',
  'desktop.error.timedOut': 'Verification timed out. Please refresh and try again.',
  'desktop.error.validationTimedOut': 'Document validation timed out. Please refresh and try again.',
  'desktop.error.liveTimedOut': 'Live capture verification timed out. Please refresh and try again.',
  'desktop.error.restartFailed': 'Failed to restart verification',
  'desktop.toast.uploaded': 'Document uploaded successfully',
  'desktop.toast.backUploaded': 'Back document uploaded',

  // ─── Voice / speaker verification (desktop + mobile) ──────────────────
  'voice.title': 'Speaker Verification',
  'voice.subtitle': 'Speak the digits shown below into your microphone.',
  'voice.speakDigits': 'Speak these digits',
  'voice.expiresIn': 'Expires in {seconds}s',
  'voice.recording': 'Recording: {seconds}s',
  'voice.captured': 'Captured ({seconds}s)',
  'voice.capturedLong': 'Recording captured ({seconds}s)',
  'voice.getChallenge': 'Get Challenge',
  'voice.getChallengeDigits': 'Get Challenge Digits',
  'voice.startRecording': 'Start Recording',
  'voice.stopRecording': 'Stop Recording',
  'voice.submit': 'Submit Voice',
  'voice.submitCapture': 'Submit Voice Capture',
  'voice.requestNew': 'Request New Challenge',
  'voice.error.challengeFailed': 'Failed to get challenge',
  'voice.error.micDenied': 'Microphone access denied',
  'voice.error.verifyFailed': 'Voice verification failed',

  // ─── Mobile flow (MobileVerificationPage) ─────────────────────────────
  'mobile.secureSession': 'Secure Session',
  'mobile.unableToLoad': 'Unable to Load',

  // Step tracker labels
  'mobile.step.frontId': 'Front ID',
  'mobile.step.backId': 'Back ID',
  'mobile.step.checking': 'Checking',
  'mobile.step.livePhoto': 'Live Photo',
  'mobile.step.voice': 'Voice',
  'mobile.step.complete': 'Complete',
  'mobile.step.uploadId': 'Upload ID',

  // Eyebrow: "Step 2 of 5 — Back of ID"
  'mobile.stepOf': 'Step {current} of {total} — {label}',
  'mobile.label.uploadId': 'Upload ID',
  'mobile.label.frontOfId': 'Front of ID',
  'mobile.label.backOfId': 'Back of ID',
  'mobile.label.verification': 'Verification',
  'mobile.label.livePhoto': 'Live Photo',

  'mobile.front.title': 'Scan the front\nof your ID',
  'mobile.front.titleAge': 'Upload your ID\nto verify your age',
  'mobile.front.body':
    'Position your ID card and take a clear photo. Make sure all four corners are visible and the text is clear.',
  'mobile.front.bodyAge':
    "We'll check your date of birth to confirm you are {age}+. No other data is stored.",
  'mobile.front.tip': 'Good lighting · No glare · Hold steady',
  'mobile.front.reading': 'READING FRONT',
  'mobile.front.takePhoto': 'Take Photo of Front',
  'mobile.front.scan': 'Scan Front of ID',

  'mobile.back.title': 'Now flip it over\nand scan the back',
  'mobile.back.body':
    'Keep the same conditions — good lighting, flat surface. The barcode on the back must be fully visible.',
  'mobile.back.tip': 'Barcode must be unobstructed',
  'mobile.back.reading': 'READING BARCODE',
  'mobile.back.takePhoto': 'Take Photo of Back',
  'mobile.back.scan': 'Scan Back of ID',

  'mobile.checking.msg1': 'Verifying your document…',
  'mobile.checking.msg2': 'Cross-checking details…',
  'mobile.checking.msg3': 'Almost there…',
  'mobile.checking.hint': 'This only takes a moment',
  'mobile.checking.tag1': 'Document read',
  'mobile.checking.tag2': 'Details matched',
  'mobile.checking.tag3': 'Security checks',
  'mobile.checking.overlay': 'CHECKING',

  'mobile.live.title': 'Liveness check',
  'mobile.live.body':
    'Follow the on-screen instructions — look at the camera and turn your head when prompted.',
  'mobile.live.tip': 'Remove glasses · Face well-lit · No hat',
  'mobile.live.start': 'Start Liveness Check',
  'mobile.live.selfieTitle': 'Take a quick\nselfie',
  'mobile.live.selfieBody':
    'We need to confirm your identity matches your ID. Look directly at the camera in a well-lit area.',
  'mobile.live.takeSelfie': 'Take Selfie',
  'mobile.live.submitSelfie': 'Submit Selfie',
  'mobile.live.cueLookAhead': 'Look ahead',
  'mobile.live.cueSmile': 'Smile',
  'mobile.live.cueTurn': 'Turn slightly',

  'mobile.done.processing': 'Processing your verification…',
  'mobile.done.analyzingLive': 'Analyzing your live photo',
  'mobile.done.finalizing': 'Finalizing your verification',
  'mobile.done.eyebrowAge': 'Age verified',
  'mobile.done.eyebrowDocument': 'Document verified',
  'mobile.done.eyebrowFull': 'Verification complete',
  'mobile.done.title': "You're all set",
  'mobile.done.redirectBody': 'Verification complete. Redirecting you back…',
  'mobile.done.bodyAge':
    'Your age has been verified. You can close this tab and return to your desktop.',
  'mobile.done.bodyDocument':
    'Your document has been verified. You can close this tab and return to your desktop.',
  'mobile.done.bodyFull':
    'Your identity has been verified. You can close this tab and return to your desktop.',
  'mobile.done.checkDocScanned': 'Document scanned',
  'mobile.done.checkAgeMet': 'Age requirement ({age}+) met',
  'mobile.done.checkDocVerified': 'Identity document verified',
  'mobile.done.checkDetailsConfirmed': 'Document details confirmed',
  'mobile.done.checkLiveness': 'Liveness check passed',
  'mobile.done.checkFaceMatch': 'Face matched successfully',
  'mobile.done.patchFailed':
    "Note: We couldn't notify your desktop automatically. Please refresh it to see your result.",
  'mobile.done.failedAge': 'Age Verification Failed',
  'mobile.done.failedDocument': 'Document Verification Failed',
  'mobile.done.failedFull': 'Verification Failed',
  'mobile.done.underReview': 'Under Review',
  'mobile.done.failedBody':
    'We were unable to verify your identity. Please return to your desktop to see details.',
  'mobile.done.reviewBody':
    'Your verification is being reviewed. You will be notified of the result.',

  // Mobile error messages
  'mobile.error.noToken': 'Invalid link — no token provided.',
  'mobile.error.qrExpired': 'This QR code has expired. Please generate a new one on your desktop.',
  'mobile.error.linkUsed': 'This link has already been used.',
  'mobile.error.linkInvalid': 'Invalid or unrecognised link.',
  'mobile.error.sessionIncomplete':
    'Session response is incomplete. Please try scanning the QR code again.',
  'mobile.error.network':
    'Could not reach the verification server. Make sure your phone and computer are on the same Wi-Fi network, then scan the QR code again.',
  'mobile.error.startFailed': 'Failed to start verification',
  'mobile.error.uploadFailed': 'Upload failed',
  'mobile.error.blurryId':
    'The photo of your ID is not clear enough. Please retake it in good lighting.',
  'mobile.error.ocrTimeout': 'OCR timed out. Please try again.',
  'mobile.error.validationTimeout': 'Validation timed out. Please try again.',
  'mobile.error.livenessFailed': 'Liveness check failed',
  'mobile.error.selfieFailed': 'Selfie upload failed',
  'mobile.error.tooLong': 'Verification is taking too long. Please close and try again.',
  'mobile.error.restartFailed': 'Failed to restart verification',

  // ─── Active liveness (ActiveLivenessCapture + useActiveLiveness) ──────
  'liveness.intro.title': 'Camera access required',
  'liveness.intro.body':
    "We'll use your front-facing camera for a quick liveness check to verify it's really you. Your video is processed for the check and not stored as a recording.",
  'liveness.intro.start': 'Start camera',
  'liveness.errorTitle': 'Camera error',

  'liveness.phase.ready': 'Position your face in the oval',
  'liveness.phase.turnLeft': 'Slowly turn your head left',
  'liveness.phase.turnRight': 'Slowly turn your head right',
  'liveness.phase.returnCenter': 'Now look straight ahead',
  'liveness.phase.capturing': 'Hold still — capturing...',
  'liveness.phase.completed': 'Liveness check passed!',
  'liveness.phase.failed': 'Liveness check failed. Tap to retry.',
  'liveness.phase.fallback': 'Camera unavailable. Using standard capture.',

  'liveness.tip.ready': 'Good lighting · Face uncovered · No sunglasses',
  'liveness.tip.failed': 'Ensure good lighting and face is centred',
  'liveness.tip.completed': 'Verification complete',
  'liveness.tip.default': 'Keep your face visible throughout',

  'liveness.processing': 'Processing verification...',
  'liveness.processingSub': 'Analyzing your document and identity',

  'liveness.error.timedOut': 'Challenge timed out. Please try again.',
  'liveness.error.noCanvas': 'Canvas not available for capture',
  'liveness.error.noContext': 'Canvas context not available',
  'liveness.error.frameFailed': 'Frame capture failed',
  'liveness.error.permissionDenied':
    'Camera permission denied. Please grant camera access in your browser settings and try again.',
  'liveness.error.notFound': 'No camera detected on this device.',
  'liveness.error.inUse':
    'Camera is in use by another app. Close other apps using the camera and try again.',
  'liveness.error.overconstrained':
    'Camera does not meet requirements (a front-facing camera is needed).',
  'liveness.error.generic': 'Camera access failed ({name}): {message}',
  'liveness.error.unknown': 'Camera access failed for an unknown reason.',
  'liveness.error.previewFailed': 'Could not start the video preview. Please try again.',
  'liveness.error.startTimeout': 'Camera failed to start within 8 seconds. Please try again.',

  // ─── Guided ID camera (IDCameraCapture) ───────────────────────────────
  'idcam.frontOfId': 'Front of ID',
  'idcam.backOfId': 'Back of ID',
  'idcam.positionFront': 'Position the front of your ID',
  'idcam.positionBack': 'Position the barcode side',
  'idcam.guidance.blurry': 'Move closer to your ID',
  'idcam.guidance.medium': 'Hold steady…',
  'idcam.guidance.sharp': 'Perfect! Capturing…',
  'idcam.error.noAccess': 'Unable to access camera. Please check permissions.',
  'idcam.error.restartFailed': 'Could not restart camera.',
  'idcam.capturedAlt': 'Captured ID',
  'idcam.closeLabel': 'Close camera',

  // ─── Guided selfie camera (SelfieCameraCapture) ───────────────────────
  'selfiecam.title': 'Selfie',
  'selfiecam.guidance.noFace': 'Position your face in the oval',
  'selfiecam.guidance.adjusting': 'Center your face… hold steady',
  'selfiecam.guidance.ready': 'Perfect! Capturing…',
  'selfiecam.error.noAccess': 'Unable to access front camera. Please check permissions.',
  'selfiecam.capturedAlt': 'Captured selfie',

  // ─── Live capture widget (desktop OpenCV fallback) ────────────────────
  'widget.title': 'Live Photo Capture',
  'widget.subtitleActive': 'Follow the on-screen instructions to verify your identity',
  'widget.subtitleFallback': 'We need a live photo to verify your identity',
  'widget.capturedTitle': 'Photo Captured',
  'widget.capturedBody': 'Processing your verification...',
  'widget.cameraEyebrow': 'CAMERA',
  'widget.accessTitle': 'Camera Access Required',
  'widget.accessBody': 'We need your camera to capture a live photo for identity verification.',
  'widget.startingCamera': 'Starting Camera...',
  'widget.startingCameraBody': 'Starting camera...',
  'widget.cameraFailed': 'Camera Failed',
  'widget.faceDetectedStats':
    'Face detected / Liveness {liveness}% / Stability {stability}%',
  'widget.positionFace': 'Position your face in the center of the frame',
  'widget.holdStill': 'Hold still...',
  'widget.positionFirst': 'Position Your Face First',
  'widget.improveLighting': 'Improve Lighting & Hold Steady',
  'widget.capturePhoto': 'Capture Photo',
  'widget.blinkTwice': 'Look directly at the camera and blink twice...',
  'widget.tip1': 'Ensure good lighting -- avoid backlighting',
  'widget.tip2': 'Center your face in the frame and hold still',
  'widget.tip3': 'Wait for the "Face detected" indicator before capturing',
  'widget.overlay.faceDetected': 'Face Detected',
  'widget.overlay.positionFace': 'Position Face',
  'widget.error.notSupported': 'Camera not supported in this browser',
  'widget.error.permissionDenied': 'Camera permission denied. Please enable camera access.',
  'widget.error.notFound': 'No camera found.',
  'widget.error.inUse': 'Camera is already in use by another app.',
  'widget.error.generic': 'Camera error: {message}',
  'widget.error.noFace': 'No face detected. Position your face in the frame.',
  'widget.error.lighting': 'Ensure good lighting and your face is clearly visible.',
  'widget.error.steady': 'Hold your face steady in the frame.',
  'widget.error.faceLost': 'Face lost during countdown. Please try again.',
  'widget.error.missingData': 'Missing required capture data.',
  'widget.error.captureFailed': 'Live capture failed',
  'widget.error.timedOut': 'Request timed out. Check your connection and try again.',
  'widget.error.retryFailed': 'Capture failed. Please try again.',
  'widget.error.maxAttempts': 'Maximum capture attempts reached. Please refresh and try again.',
  'widget.error.cancelled': 'Live capture cancelled',
  'widget.error.livenessFailed': 'Liveness verification failed',

  // ─── Standalone live-capture page ─────────────────────────────────────
  'livepage.eyebrow': 'idswyft / live-capture',
  'livepage.title': 'Live Identity Verification',
  'livepage.subtitle': 'Complete your verification with live face capture',
  'livepage.expiredTitle': 'Session Expired',
  'livepage.expiredBody': 'Your live capture session has expired. Please start a new verification.',
  'livepage.startNew': 'Start New Verification',
  'livepage.processing': 'Processing...',
  'livepage.captureComplete': 'Capture Complete',
  'livepage.processingBody': 'Please wait while we verify your identity.',
  'livepage.verifiedBody': 'Your identity has been successfully verified.',
  'livepage.failedBody': 'Verification failed. Please try again.',
  'livepage.reviewBody': 'Your verification is under manual review.',
  'livepage.processedBody': 'Your live capture has been successfully processed.',
  'livepage.viewResults': 'View Full Results',
  'livepage.checkingStatus': 'Checking verification status...',
  'livepage.processingVerification': 'Processing verification...',
  'livepage.checkManually': 'Check results manually',
  'livepage.accessTitle': 'Camera Access Required',
  'livepage.accessBody':
    'We need access to your camera for live identity verification using Face-API technology.',
  'livepage.loadingFaceApi': 'Loading Face-API...',
  'livepage.initializingCamera': 'Initializing Camera...',
  'livepage.cameraFailedTitle': 'Camera Access Failed',
  'livepage.challengeTitle': 'Liveness Challenge',
  'livepage.defaultChallenge': 'Please look directly at the camera and blink twice',
  'livepage.faceReady': 'Face Detected -- Ready',
  'livepage.noFace': 'No Face Detected',
  'livepage.positionInFrame': 'Position your face in frame',
  'livepage.livenessPct': 'Liveness: {value}%',
  'livepage.stabilityPct': 'Stability: {value}%',
  'livepage.getReady': 'Get ready...',
  'livepage.attempts': 'Attempts: {current}/{max}',
  'livepage.expiresAt': 'Expires: {time}',
  'livepage.positionYourFace': 'Position Your Face',
  'livepage.improveLighting': 'Improve Lighting',
  'livepage.holdSteady': 'Hold Steady',
  'livepage.startCapture': 'Start Capture',
  'livepage.performingChallenge': 'Performing challenge...',
  'livepage.instructionsTitle': 'Live Capture Instructions',
  'livepage.instruction1': 'Uses Face-API for reliable camera processing',
  'livepage.instruction2': 'Ensure good lighting on your face',
  'livepage.instruction3': 'Position your face in the center of frame',
  'livepage.instruction4': 'Wait for green indicator showing face detection',
  'livepage.statusPrefix': 'Status: {info}',
  'livepage.overlay.faceDetected': 'FACE DETECTED',
  'livepage.overlay.positionFace': 'POSITION FACE IN FRAME',
  'livepage.overlay.stats': 'LIVENESS {liveness}%  |  STABILITY {stability}%',
  'livepage.error.noToken': 'Invalid or missing live capture token',
  'livepage.error.takingLong':
    'Verification is taking longer than expected. Please check results manually.',
  'livepage.error.statusCheck': 'Failed to check verification status. Please try refreshing.',
  'livepage.error.noCanvas': 'Canvas element not found. Please refresh the page.',
  'livepage.error.accessFailed': 'Camera access failed',
  'livepage.error.permissionDenied': 'Camera permission denied. Please enable camera access.',
  'livepage.error.notFound': 'No camera found. Please connect a camera.',
  'livepage.error.inUse': 'Camera is already in use by another application.',
  'livepage.error.security': 'Camera access blocked due to security settings.',
  'livepage.error.generic': 'Camera error: {message}',
  'livepage.error.unknown': 'Unknown error',
  'livepage.error.missingData': 'Missing required data for capture',
  'livepage.error.faceLostCapture':
    'Face detection lost. Please ensure your face is clearly visible and try again.',
  'livepage.error.noFaceDetected':
    'No face detected. Please position your face clearly in the center of the frame.',
  'livepage.error.poorLighting':
    'Please ensure good lighting and face clearly visible for liveness detection.',
  'livepage.error.unsteady': 'Please hold your face steady in the center of the frame.',
  'livepage.error.faceLostCountdown': 'Face detection lost during countdown. Please try again.',
  'livepage.error.faceLostRemain':
    'Face detection lost during countdown. Please ensure your face remains visible.',
  'livepage.error.captureFailed': 'Failed to capture image. Please try again.',
  'livepage.error.timedOut': 'Request timed out. Please check your connection and try again.',
  'livepage.error.maxAttempts': 'Maximum capture attempts exceeded. Please refresh and try again.',
  'livepage.error.liveCaptureFailed': 'Live capture failed',
  'livepage.error.livenessFailed': 'Liveness verification failed',
}
