import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LottieInterviewer from '../components/interview/LottieInterviewer'
import WebcamFeed from '../components/interview/WebcamFeed'
import { useSpeech } from '../hooks/useSpeech'
import { type AnswerRecord, type FinalReport, useInterviewStore } from '../store/interviewStore'

const QUESTION_DURATION_SECONDS = 90

const extractKeywords = (question: string) =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 5)

const buildAnswerFeedback = (score: number) => {
  if (score >= 85) return 'Excellent structure and clear technical depth.'
  if (score >= 70) return 'Good answer with room for stronger examples.'
  if (score >= 55) return 'Decent foundation, but add more precise details.'
  return 'Needs clearer structure and stronger core concepts.'
}

const buildFinalReport = (answers: AnswerRecord[], eyeContactPercentage: number): FinalReport => {
  const overallScore = answers.length === 0 ? 0 : Math.round(answers.reduce((sum, item) => sum + item.score, 0) / answers.length)
  const communicationScore = Math.min(100, Math.round(overallScore * 0.92 + 4))
  const technicalScore = overallScore
  const confidenceScore = Math.min(100, Math.round(overallScore * 0.88 + eyeContactPercentage * 0.25))

  const roundsMap = new Map<number, AnswerRecord[]>()
  answers.forEach((answer) => {
    const current = roundsMap.get(answer.round) || []
    roundsMap.set(answer.round, [...current, answer])
  })

  const roundTitles = ['OOP & Programming', 'Data Structures & Algorithms', 'Behavioral & Communication']
  const rounds = Array.from(roundsMap.entries()).map(([round, items]) => ({
    round,
    title: roundTitles[round - 1] || `Round ${round}`,
    score: Math.round(items.length === 0 ? 0 : items.reduce((sum, item) => sum + item.score, 0) / items.length),
    questions: items,
  }))

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    eyeContactScore: eyeContactPercentage,
    strengths: ['Strong understanding of core concepts', 'Clear and concise explanation style'],
    areasToImprove: ['Deep-dive DSA patterns', 'Reduce filler words under pressure'],
    studyPlan: [
      'Review recursion, graph traversal, and complexity tradeoffs.',
      'Practice STAR-based behavioral responses in 60-90 seconds.',
      'Run two timed mocks this week and track confidence trend.',
    ],
    rounds,
    eyeContactPercentage,
    lookedAwayCount: Math.max(0, Math.round((100 - eyeContactPercentage) / 8)),
    expressionTimeline: [
      { label: 'Confident', value: Math.min(100, confidenceScore) },
      { label: 'Neutral', value: Math.max(15, 100 - confidenceScore) },
      { label: 'Nervous', value: Math.max(5, 100 - Math.round(confidenceScore * 0.9)) },
    ],
  }
}

const InterviewPage = () => {
  const navigate = useNavigate()

  const {
    candidateName,
    roundTitles,
    questionsByRound,
    currentRound,
    currentQuestion,
    allAnswers,
    isInterviewActive,
    submitAnswer,
    nextQuestion,
    completeInterview,
    saveEyeContactData,
  } = useInterviewStore()

  const [eyeContact, setEyeContact] = useState<'good' | 'poor' | 'unknown'>('unknown')
  const [expression, setExpression] = useState('neutral')
  const [confidenceLevel, setConfidenceLevel] = useState(0)
  const [eyeContactPercentage, setEyeContactPercentage] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_SECONDS)

  const {
    supported,
    transcript,
    isListening,
    isSpeaking,
    silencePrompt,
    startListening,
    stopListening,
    speakQuestion,
    resetTranscript,
  } = useSpeech({
    maxListeningMs: QUESTION_DURATION_SECONDS * 1000,
    onSilence: () => window.alert('No speech for 5 seconds. Please continue your answer.'),
  })

  const totalRounds = questionsByRound.length
  const currentRoundQuestions = questionsByRound[currentRound - 1] || []
  const currentQuestionText = currentRoundQuestions[currentQuestion - 1] || ''
  const totalQuestions = currentRoundQuestions.length || 1
  const totalQuestionsAcrossRounds = questionsByRound.reduce((sum, round) => sum + round.length, 0)
  const completedQuestions = allAnswers.length
  const progress = totalQuestionsAcrossRounds === 0 ? 0 : Math.round((completedQuestions / totalQuestionsAcrossRounds) * 100)

  useEffect(() => {
    if (!isInterviewActive) {
      navigate('/setup')
    }
  }, [isInterviewActive, navigate])

  useEffect(() => {
    if (!currentQuestionText) return
    resetTranscript()
    const timeoutId = window.setTimeout(() => {
      speakQuestion(currentQuestionText)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [currentQuestionText, resetTranscript, speakQuestion])

  useEffect(() => {
    if (timeLeft <= 0) {
      stopListening()
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [stopListening, timeLeft])

  const handleFaceUpdate = useCallback(
    (faceData: {
      faceDetected: boolean
      eyeContact: 'good' | 'poor' | 'unknown'
      expression: string
      confidenceLevel: number
      eyeContactPercentage: number
    }) => {
      setEyeContact(faceData.eyeContact)
      setExpression(faceData.expression)
      setConfidenceLevel(faceData.confidenceLevel)
      setEyeContactPercentage(faceData.eyeContactPercentage)
      saveEyeContactData({
        timestamp: Date.now(),
        eyeContact: faceData.eyeContact,
        expression: faceData.expression,
        confidenceLevel: faceData.confidenceLevel,
      })
    },
    [saveEyeContactData],
  )

  const createAnswerRecord = useCallback((): AnswerRecord => {
    const keywords = extractKeywords(currentQuestionText)
    const normalizedAnswer = transcript.toLowerCase()
    const keywordsMatched = keywords.filter((word) => normalizedAnswer.includes(word))
    const keywordsMissed = keywords.filter((word) => !normalizedAnswer.includes(word))
    const CLARITY_SCORE_MIN = 45
    const CLARITY_SCORE_MAX = 100
    const CLARITY_SCORE_DIVISOR = 2
    const clarityScore = Math.min(CLARITY_SCORE_MAX, Math.max(CLARITY_SCORE_MIN, transcript.length / CLARITY_SCORE_DIVISOR))
    const eyeContactScore = eyeContact === 'good' ? 90 : eyeContact === 'poor' ? 55 : 65
    const score = Math.round(clarityScore * 0.65 + eyeContactScore * 0.35)

    return {
      round: currentRound,
      questionNumber: currentQuestion,
      questionText: currentQuestionText,
      transcript: transcript || 'No response submitted.',
      score,
      keywordsMatched,
      keywordsMissed,
      feedback: buildAnswerFeedback(score),
    }
  }, [currentQuestion, currentQuestionText, currentRound, eyeContact, transcript])

  const finishInterview = useCallback(
    (answers: AnswerRecord[]) => {
      const report = buildFinalReport(answers, eyeContactPercentage)
      completeInterview(report)
      navigate('/report')
    },
    [completeInterview, eyeContactPercentage, navigate],
  )

  const submitCurrentAnswer = () => {
    const answer = createAnswerRecord()
    submitAnswer(answer)
    const next = nextQuestion()
    if (next.completed) {
      finishInterview([...allAnswers, answer])
      return
    }
    setTimeLeft(QUESTION_DURATION_SECONDS)
  }

  const skipCurrentQuestion = () => {
    const answer = createAnswerRecord()
    answer.transcript = 'Skipped by candidate.'
    answer.score = Math.max(35, answer.score - 25)
    answer.feedback = 'Question skipped. Try answering to improve confidence score.'
    submitAnswer(answer)
    const next = nextQuestion()
    if (next.completed) {
      finishInterview([...allAnswers, answer])
      return
    }
    setTimeLeft(QUESTION_DURATION_SECONDS)
  }

  const formattedTime = useMemo(
    () => `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`,
    [timeLeft],
  )

  return (
    <div className="min-h-screen bg-[#0A0F1E] px-4 py-6 text-[#F9FAFB]">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[45%_55%]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-[20px]">
          <p className="text-sm text-slate-300">Round {currentRound} of {totalRounds}</p>
          <h2 className="text-xl font-semibold">{roundTitles[currentRound - 1] || `Round ${currentRound}`}</h2>

          <LottieInterviewer
            isSpeaking={isSpeaking}
            questionText={currentQuestionText}
            questionNumber={currentQuestion}
            totalQuestions={totalQuestions}
            roundLabel={`Round ${currentRound}`}
          />

          <div className="rounded-2xl border border-white/10 bg-[#0A0F1E]/70 p-4 text-sm">
            <p className="text-slate-300">⏱️ {formattedTime} remaining</p>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-[20px]">
          <WebcamFeed isRecording={isListening} onFaceUpdate={handleFaceUpdate} />

          <div className="rounded-2xl border border-white/10 bg-[#0A0F1E]/70 p-4 text-sm">
            <p>👁️ Eye contact: <span className={eyeContact === 'good' ? 'text-[#10B981]' : eyeContact === 'poor' ? 'text-[#F59E0B]' : 'text-slate-300'}>{eyeContact.toUpperCase()}</span></p>
            <p className="mt-1 text-slate-300">Expression: {expression} • Confidence: {confidenceLevel}%</p>
          </div>

          <motion.button
            onClick={isListening ? () => stopListening() : startListening}
            animate={{ scale: isListening ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isListening ? Infinity : 0, duration: 1.1 }}
            className="w-full rounded-2xl border border-red-400/60 bg-red-500/80 px-5 py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(239,68,68,0.35)]"
          >
            🎤 {isListening ? 'Listening… Tap to Stop' : 'SPEAK NOW'}
          </motion.button>

          <div className="rounded-2xl border border-white/10 bg-[#0A0F1E]/70 p-4">
            <p className="text-sm text-slate-300">Transcript:</p>
            <p className="mt-2 min-h-24 text-sm">{transcript || 'Start speaking to record your answer...'}</p>
            {silencePrompt && <p className="mt-2 text-xs text-[#F59E0B]">{silencePrompt}</p>}
            {!supported && <p className="mt-2 text-xs text-[#EF4444]">Speech recognition is not supported in this browser.</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={skipCurrentQuestion} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">Skip</button>
            <button onClick={submitCurrentAnswer} className="flex-1 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-4 py-3 font-semibold text-[#0A0F1E] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.35)]">Submit Answer</button>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-5 max-w-7xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-[20px]">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalRounds }).map((_, index) => (
            <span
              key={index}
              className={`rounded-full px-3 py-1 text-xs ${index + 1 === currentRound ? 'bg-[#00D4FF] text-[#0A0F1E]' : 'bg-white/10 text-slate-300'}`}
            >
              R{index + 1}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-300">Candidate: {candidateName}</p>
      </div>
    </div>
  )
}

export default InterviewPage
