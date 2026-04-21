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
}

type SpeechOptions = {
  maxListeningMs?: number
  onSilence?: () => void
  onTimeLimit?: () => void
}

export const useSpeech = (options: SpeechOptions = {}) => {
  const { maxListeningMs = 90000, onSilence, onTimeLimit } = options
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [silencePrompt, setSilencePrompt] = useState('')
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const timeLimitTimerRef = useRef<number | null>(null)
  const latestTranscriptRef = useRef('')

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
      const previousVoicesChanged = window.speechSynthesis.onvoiceschanged
      const timeoutId = window.setTimeout(() => {
        window.speechSynthesis.onvoiceschanged = previousVoicesChanged
        resolve(window.speechSynthesis.getVoices() as SpeechSynthesisVoiceLike[])
      }, 1000)

      window.speechSynthesis.onvoiceschanged = (event) => {
        window.clearTimeout(timeoutId)
        window.speechSynthesis.onvoiceschanged = previousVoicesChanged
        if (previousVoicesChanged) previousVoicesChanged.call(window.speechSynthesis, event)
        resolve(window.speechSynthesis.getVoices() as SpeechSynthesisVoiceLike[])
      }
    })
  }, [])

  const speakQuestion = useCallback(
    async (text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window)) {
        startListening()
        onEnd?.()
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const voices = await getVoices()
      const femaleVoice = voices.find((voice) => /female|zira|susan|samantha|victoria/i.test(voice.name))
      const fallbackEnglishVoice = voices.find((voice) => /^en/i.test(voice.lang))
      const selectedVoice = femaleVoice || fallbackEnglishVoice
      if (selectedVoice) utterance.voice = selectedVoice as unknown as SpeechSynthesisVoice
      utterance.rate = 0.85
      utterance.pitch = 1.1

      setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        startListening()
        onEnd?.()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        startListening()
      }

      window.speechSynthesis.speak(utterance)
    },
    [getVoices, startListening],
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
