import { useEffect, useRef, useState } from 'react'

type SpeechRecognitionResultItem = {
  transcript: string
}

type SpeechRecognitionEventLike = {
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
}

export const useSpeech = () => {
  const supported =
    typeof window !== 'undefined' &&
    !!((window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)

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

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
      setTranscript(text)
    }

    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
  }, [supported])

  const startListening = () => {
    recognitionRef.current?.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return { supported, listening, transcript, setTranscript, startListening, stopListening }
}
