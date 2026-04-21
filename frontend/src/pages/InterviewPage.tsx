import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluateAnswer, generateReport } from '../api/interviewApi'
import LottieInterviewer from '../components/interview/LottieInterviewer'
import QuestionCard from '../components/interview/QuestionCard'
import SpeechHandler from '../components/interview/SpeechHandler'
import Timer from '../components/interview/Timer'
import TranscriptBox from '../components/interview/TranscriptBox'
import WebcamFeed from '../components/interview/WebcamFeed'
import { useFaceDetection } from '../hooks/useFaceDetection'
import { useInterviewStore } from '../store/interviewStore'

const InterviewPage = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    questions,
    currentQuestionIndex,
    transcript,
    setTranscript,
    eyeContactScore,
    setEyeContactScore,
    addEvaluation,
    nextQuestion,
    evaluations,
    setReport,
  } = useInterviewStore()

  useFaceDetection(videoRef, setEyeContactScore)

  const currentQuestion = useMemo(() => questions[currentQuestionIndex] || '', [questions, currentQuestionIndex])

  const submitAnswer = async () => {
    if (!currentQuestion) return
    const result = await evaluateAnswer({
      question: currentQuestion,
      answer: transcript,
      eye_contact_score: eyeContactScore,
    })
    addEvaluation(result)

    if (currentQuestionIndex + 1 >= questions.length) {
      const report = await generateReport([...evaluations, result])
      setReport(report)
      navigate('/report')
      return
    }

    nextQuestion()
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-2">
      <div className="space-y-4">
        <LottieInterviewer />
        <QuestionCard question={currentQuestion || 'No questions found'} index={currentQuestionIndex} total={questions.length || 1} />
        <Timer />
      </div>

      <div className="space-y-4">
        <WebcamFeed videoRef={videoRef} />
        <SpeechHandler onTranscript={setTranscript} />
        <TranscriptBox transcript={transcript} />
        <div className="rounded-xl bg-slate-900 p-4 text-sm">Eye Contact Score: {Math.round(eyeContactScore)}</div>
        <button className="rounded bg-emerald-600 px-4 py-2" onClick={submitAnswer}>Submit Answer</button>
      </div>
    </div>
  )
}

export default InterviewPage
