import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type SpeechRecognitionResultItem = { transcript: string }

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<ArrayLike<SpeechRecognitionResultItem>>
}

type SpeechRecognitionType = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
}

type SpeechSynthesisVoiceLike = {
  lang: string
  name: string
  default?: boolean
}

type SpeechOptions = {
  maxListeningMs?: number
  onSilence?: () => void
  onTimeLimit?: () => void
}

const SPEECH_DEBUG_STORAGE_KEY = 'speech-debug'
const VOICES_LOAD_TIMEOUT_MS = 1000

export const useSpeech = (options: SpeechOptions = {}) => {
  const { maxListeningMs = 90000, onSilence, onTimeLimit } = options
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [silencePrompt, setSilencePrompt] = useState('')
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const speechDebugRef = useRef(false)
  const silenceTimerRef = useRef<number | null>(null)
  const timeLimitTimerRef = useRef<number | null>(null)
  const latestTranscriptRef = useRef('')
  const speakRequestIdRef = useRef(0)

  useEffect(() => {
    speechDebugRef.current = window.localStorage.getItem(SPEECH_DEBUG_STORAGE_KEY) === 'true'
  }, [])

  const logSpeech = useCallback((message: string, extra?: Record<string, unknown>) => {
    if (!speechDebugRef.current) return
    if (extra) {
      console.info(`[speech] ${message}`, extra)
      return
    }
    console.info(`[speech] ${message}`)
  }, [])

  const supported = useMemo(() => {
    const speechWindow = window as {
      SpeechRecognition?: new () => SpeechRecognitionType
      webkitSpeechRecognition?: new () => SpeechRecognitionType
    }
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
  }, [])

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
    if (timeLimitTimerRef.current) window.clearTimeout(timeLimitTimerRef.current)
    silenceTimerRef.current = null
    timeLimitTimerRef.current = null
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    clearTimers()
    return latestTranscriptRef.current
  }, [clearTimers])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setSilencePrompt('')
    recognitionRef.current.start()
    setIsListening(true)

    if (maxListeningMs > 0) {
      timeLimitTimerRef.current = window.setTimeout(() => {
        stopListening()
        onTimeLimit?.()
      }, maxListeningMs)
    }

    silenceTimerRef.current = window.setTimeout(() => {
      setSilencePrompt('No speech detected for 5 seconds. Try speaking clearly.')
      onSilence?.()
    }, 5000)
  }, [maxListeningMs, onSilence, onTimeLimit, stopListening])

  const resetTranscript = useCallback(() => {
    latestTranscriptRef.current = ''
    setTranscript('')
    setSilencePrompt('')
  }, [])

  const getVoices = useCallback(async () => {
    const voices = window.speechSynthesis.getVoices() as SpeechSynthesisVoiceLike[]
    if (voices.length > 0) return voices

    return await new Promise<SpeechSynthesisVoiceLike[]>((resolve) => {
      const synth = window.speechSynthesis
      let resolved = false
      const timeoutId = window.setTimeout(() => {
        if (resolved) return
        resolved = true
        synth.removeEventListener('voiceschanged', handleVoicesChanged)
        resolve(synth.getVoices() as SpeechSynthesisVoiceLike[])
      }, VOICES_LOAD_TIMEOUT_MS)

      const handleVoicesChanged = () => {
        if (resolved) return
        resolved = true
        window.clearTimeout(timeoutId)
        synth.removeEventListener('voiceschanged', handleVoicesChanged)
        resolve(synth.getVoices() as SpeechSynthesisVoiceLike[])
      }

      synth.addEventListener('voiceschanged', handleVoicesChanged)
    })
  }, [])

  const speakQuestion = useCallback(
    async (text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window)) {
        startListening()
        onEnd?.()
        return
      }

      stopListening()
      speakRequestIdRef.current += 1
      const requestId = speakRequestIdRef.current

      window.speechSynthesis.cancel()
      window.speechSynthesis.resume()
      const voices = await getVoices()
      if (requestId !== speakRequestIdRef.current) return

      const utterance = new SpeechSynthesisUtterance(text)
      const englishVoices = voices.filter((voice) => /^en(-|_)?/i.test(voice.lang))
      const preferredEnglishVoice = englishVoices.find((voice) =>
        /female|zira|susan|samantha|victoria|karen|moira|tessa|veena|amy|joanna/i.test(voice.name),
      )
      const defaultEnglishVoice = englishVoices.find((voice) => voice.default)
      const selectedVoice = preferredEnglishVoice || defaultEnglishVoice || englishVoices[0]
      if (!selectedVoice) {
        logSpeech('No English voice available, using browser default voice')
      }
      if (selectedVoice) utterance.voice = selectedVoice as unknown as SpeechSynthesisVoice
      utterance.rate = 0.85
      utterance.pitch = 1.1
      logSpeech('Preparing utterance', {
        voicesCount: voices.length,
        englishVoicesCount: englishVoices.length,
        selectedVoice: selectedVoice?.name ?? 'browser-default',
      })

      setIsSpeaking(true)
      utterance.onend = () => {
        if (requestId !== speakRequestIdRef.current) return
        setIsSpeaking(false)
        logSpeech('Utterance ended')
        startListening()
        onEnd?.()
      }
      utterance.onerror = () => {
        if (requestId !== speakRequestIdRef.current) return
        setIsSpeaking(false)
        logSpeech('Utterance error')
        startListening()
      }

      window.speechSynthesis.speak(utterance)
      logSpeech('Utterance started')
    },
    [getVoices, logSpeech, startListening, stopListening],
  )

  useEffect(() => {
    const speechWindow = window as {
      SpeechRecognition?: new () => SpeechRecognitionType
      webkitSpeechRecognition?: new () => SpeechRecognitionType
    }
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()

      if (!text) return

      setTranscript((prev) => {
        const next = `${prev} ${text}`.trim()
        latestTranscriptRef.current = next
        return next
      })

      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = window.setTimeout(() => {
        setSilencePrompt('No speech detected for 5 seconds. Try speaking clearly.')
        onSilence?.()
      }, 5000)
      setSilencePrompt('')
    }

    recognition.onend = () => {
      setIsListening(false)
      clearTimers()
    }

    recognition.onerror = () => {
      setIsListening(false)
      clearTimers()
    }

    recognitionRef.current = recognition

    return () => {
      clearTimers()
      recognition.stop()
      window.speechSynthesis.cancel()
    }
  }, [clearTimers, onSilence])

  return {
    supported,
    transcript,
    setTranscript,
    isListening,
    isSpeaking,
    silencePrompt,
    startListening,
    stopListening,
    speakQuestion,
    resetTranscript,
  }
}
