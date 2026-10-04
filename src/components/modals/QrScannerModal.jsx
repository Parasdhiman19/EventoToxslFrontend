import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import {
  X,
  Camera,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Armchair,
  Ticket,
  ShieldCheck,
} from 'lucide-react'

// Synthesize pleasant web audio chimes without external asset dependencies
const playScanChime = (type = 'success') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    if (type === 'success') {
      // 2-tone pleasant high chime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now) // A5
      osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12) // E6

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1760, now + 0.12) // A6

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc1.stop(now + 0.12)
      osc2.start(now + 0.12)
      osc2.stop(now + 0.3)
    } else if (type === 'duplicate') {
      // 2-tone warning amber buzz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(370, now + 0.15)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } else {
      // Low error buzz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, now)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    }
  } catch {
    // AudioContext blocked by browser policy or unsupported
  }
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanResult,
  activeEventTitle = 'Event Gate',
}) {
  const [cameraError, setCameraError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [cameras, setCameras] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState(null)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [lastScanResult, setLastScanResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const scannerRef = useRef(null)
  const scannerContainerId = 'evento-qr-reader-container'
  const isCooldownRef = useRef(false)

  // Handle Scan result with debouncing & haptic feedback
  const handleDecodedText = useCallback(
    async (decodedText) => {
      if (isCooldownRef.current || isProcessing) return

      const cleanCode = decodedText?.trim()
      if (!cleanCode) return

      isCooldownRef.current = true
      setIsProcessing(true)

      try {
        const result = await onScanResult(cleanCode)

        if (result?.status === 'already_checked_in' || result?.alreadyCheckedIn) {
          playScanChime('duplicate')
          navigator.vibrate?.([150, 80, 150])
          setLastScanResult({
            type: 'duplicate',
            code: cleanCode,
            data: result,
            message: result.message || 'Already Admitted Previously',
          })
        } else if (result?.success || result?.checkedIn || result?.is_checked_in) {
          playScanChime('success')
          navigator.vibrate?.([100, 50, 100])
          setLastScanResult({
            type: 'success',
            code: cleanCode,
            data: result,
            message: result.message || 'Admitted to Venue',
          })
        } else {
          playScanChime('error')
          navigator.vibrate?.([250])
          setLastScanResult({
            type: 'error',
            code: cleanCode,
            message: result?.detail || result?.message || 'Invalid or Unrecognized Pass',
          })
        }
      } catch (err) {
        playScanChime('error')
        navigator.vibrate?.([250])
        const errorMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to verify pass at gate.'
        setLastScanResult({
          type: 'error',
          code: cleanCode,
          message: errorMsg,
        })
      } finally {
        setIsProcessing(false)
        // Resume scanning after 2.2s cooldown
        setTimeout(() => {
          isCooldownRef.current = false
        }, 2200)
      }
    },
    [onScanResult, isProcessing]
  )

  // Initialize & Start Scanner
  useEffect(() => {
    if (!isOpen) return

    let html5QrCode = null
    let isCancelled = false

    const startCamera = async () => {
      setIsInitializing(true)
      setCameraError(null)

      try {
        const devices = await Html5Qrcode.getCameras()
        if (isCancelled) return

        if (!devices || devices.length === 0) {
          setCameraError('No camera found on this device.')
          setIsInitializing(false)
          return
        }

        setCameras(devices)

        // Prefer rear/environment camera for phones
        let targetCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        )
        if (!targetCamera && devices.length > 0) {
          targetCamera = devices[devices.length - 1] // Often the back camera on mobile devices
        }

        const chosenId = targetCamera?.id || devices[0].id
        setSelectedCameraId(chosenId)

        html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
        scannerRef.current = html5QrCode

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        }

        await html5QrCode.start(
          chosenId,
          config,
          (decodedText) => {
            handleDecodedText(decodedText)
          },
          () => {
            // Frame parse non-match (silent)
          }
        )

        // Check if flashlight / torch capability is present
        try {
          const track = html5QrCode.getRunningTrackCameraCapabilities?.()
          if (track && track.torchFeature && track.torchFeature().isSupported()) {
            setHasTorch(true)
          }
        } catch {
          setHasTorch(false)
        }

        setIsInitializing(false)
      } catch (err) {
        if (!isCancelled) {
          console.error('Camera initialization error:', err)
          if (err?.name === 'NotAllowedError' || err?.toString().includes('Permission')) {
            setCameraError('Camera permission was denied. Please allow camera access in your browser settings to scan passes.')
          } else {
            setCameraError('Could not start camera feed. Please ensure no other application is using the camera.')
          }
          setIsInitializing(false)
        }
      }
    }

    // Delay start slightly to allow modal DOM container to paint
    const timer = setTimeout(() => {
      startCamera()
    }, 150)

    return () => {
      isCancelled = true
      clearTimeout(timer)
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              try {
                scannerRef.current?.clear()
              } catch {}
            }).catch(() => {})
          } else {
            try {
              scannerRef.current?.clear()
            } catch {}
          }
        } catch {}
      }
    }
  }, [isOpen, handleDecodedText])

  // Switch between available cameras
  const handleSwitchCamera = async () => {
    if (!scannerRef.current || cameras.length <= 1) return
    try {
      const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId)
      const nextIndex = (currentIndex + 1) % cameras.length
      const nextCamera = cameras[nextIndex]

      setIsInitializing(true)
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }

      setSelectedCameraId(nextCamera.id)

      await scannerRef.current.start(
        nextCamera.id,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecodedText(decodedText)
        },
        () => {}
      )
      setIsInitializing(false)
    } catch (err) {
      console.error('Error switching camera:', err)
      setIsInitializing(false)
    }
  }

  // Toggle Torch / Flashlight
  const handleToggleTorch = async () => {
    if (!scannerRef.current) return
    try {
      const newTorchState = !isTorchOn
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newTorchState }],
      })
      setIsTorchOn(newTorchState)
    } catch (err) {
      console.warn('Torch toggle not supported on this device/browser:', err)
    }
  }

  // Close modal with keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-stone-900 text-stone-100 shadow-2xl border border-stone-800 overflow-hidden relative my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-tight">
                Live Gate Pass Scanner
              </h3>
              <p className="text-[11px] font-mono text-stone-400 truncate max-w-[240px] sm:max-w-xs">
                {activeEventTitle}
              </p>
            </div>
          </div>

          {/* Quick Hardware Controls & Close */}
          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                type="button"
                onClick={handleToggleTorch}
                title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isTorchOn
                    ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
                }`}
              >
                {isTorchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
              </button>
            )}

            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                title="Switch Camera (Front/Back)"
                className="p-2 rounded-xl bg-stone-800 text-stone-300 border border-stone-700 hover:text-white transition-colors cursor-pointer"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white border border-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Camera Viewfinder Body */}
        <div className="relative bg-black min-h-[320px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Mount Point */}
          <div
            id={scannerContainerId}
            className="w-full h-full min-h-[320px] sm:min-h-[360px] [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
          />

          {/* Viewfinder Target Reticle HUD */}
          {!cameraError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 border-2 border-dashed border-amber-400/50 rounded-2xl flex items-center justify-center bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-5 h-5 sm:w-6 sm:h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 sm:w-6 sm:h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                {/* Animated Scanning Beam */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-[0_0_8px_#fbbf24]" />
              </div>

              <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-mono font-medium text-stone-300 drop-shadow-md bg-stone-950/70 px-3 py-1 rounded-full border border-stone-800">
                Align attendee pass QR code within frame
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center gap-3 z-10">
              <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
              <p className="text-xs font-mono text-stone-400">Initializing camera feed...</p>
            </div>
          )}

          {/* Camera Error State */}
          {cameraError && (
            <div className="absolute inset-0 bg-stone-950 p-6 flex flex-col items-center justify-center text-center gap-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-white text-sm">Camera Unavailable</h4>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 rounded-xl bg-stone-800 text-stone-200 hover:text-white border border-stone-700 text-xs font-mono transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>

        {/* Real-time Scan Result Notification HUD */}
        {lastScanResult && (
          <div
            className={`p-4 border-t transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              lastScanResult.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
                : lastScanResult.type === 'duplicate'
                ? 'bg-amber-950/90 border-amber-800 text-amber-100'
                : 'bg-rose-950/90 border-rose-800 text-rose-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {lastScanResult.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {lastScanResult.type === 'duplicate' && (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  {lastScanResult.type === 'error' && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {lastScanResult.type === 'success'
                        ? 'ADMITTED • GUEST CHECKED IN'
                        : lastScanResult.type === 'duplicate'
                        ? 'DUPLICATE • ALREADY CHECKED IN'
                        : 'SCAN ERROR'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                      {lastScanResult.code}
                    </span>
                  </div>

                  {lastScanResult.data?.attendeeName && (
                    <div className="text-xs font-medium text-white flex items-center gap-3 pt-0.5">
                      <span>👤 {lastScanResult.data.attendeeName}</span>
                      {lastScanResult.data.tier && (
                        <span className="inline-flex items-center gap-1 text-stone-300">
                          <Ticket className="w-3 h-3 text-amber-400" />
                          {lastScanResult.data.tier}
                        </span>
                      )}
                      {lastScanResult.data.seatOrGate && (
                        <span className="inline-flex items-center gap-1 text-stone-300">
                          <Armchair className="w-3 h-3 text-amber-400" />
                          {lastScanResult.data.seatOrGate}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] opacity-90 leading-tight">
                    {lastScanResult.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLastScanResult(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Status Footer */}
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs font-mono text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Gate Admission</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors font-medium cursor-pointer"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  )
}
