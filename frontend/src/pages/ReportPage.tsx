import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '../store/interviewStore'

const getGrade = (score: number) => {
  if (score >= 85) return { label: 'Excellent', color: '#10B981' }
  if (score >= 70) return { label: 'Good', color: '#F59E0B' }
  if (score >= 50) return { label: 'Average', color: '#F97316' }
  return { label: 'Needs Work', color: '#EF4444' }
}

const ReportPage = () => {
  const navigate = useNavigate()
  const { candidateName, role, finalReport, resetSession } = useInterviewStore()
  const [displayScore, setDisplayScore] = useState(0)
  const [activeRound, setActiveRound] = useState(1)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  useEffect(() => {
    if (!finalReport) navigate('/setup')
  }, [finalReport, navigate])

  useEffect(() => {
    if (!finalReport) return
    setDisplayScore(0)
    const target = finalReport.overallScore
    const step = Math.max(1, Math.ceil(target / 40))
    const timer = window.setInterval(() => {
      setDisplayScore((prev) => {
        const next = prev + step
        if (next >= target) {
          window.clearInterval(timer)
          return target
        }
        return next
      })
    }, 30)

    return () => window.clearInterval(timer)
  }, [finalReport])

  const activeRoundData = useMemo(() => finalReport?.rounds.find((round) => round.round === activeRound), [activeRound, finalReport])

  if (!finalReport) return null

  const grade = getGrade(finalReport.overallScore)
  const circumference = 2 * Math.PI * 94
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  const handleShare = async () => {
    const shareText = `I scored ${finalReport.overallScore}% on my Mock Interview AI report!`
    if (navigator.share) {
      await navigator.share({ title: 'Mock Interview AI', text: shareText })
      return
    }

    await navigator.clipboard.writeText(shareText)
    window.alert('Result copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] px-4 py-8 text-[#F9FAFB]">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-[20px]">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="relative mx-auto h-60 w-60">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r="94" stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none" />
                <motion.circle
                  cx="110"
                  cy="110"
                  r="94"
                  stroke={grade.color}
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.4 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-300">Overall Score</p>
                <p className="text-5xl font-bold">{displayScore}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${grade.color}30`, color: grade.color }}>
                {grade.label}
              </span>
              <h1 className="text-3xl font-bold">{candidateName || 'Candidate'} — {role}</h1>
              <p className="text-slate-300">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Technical Score', value: finalReport.technicalScore },
            { label: 'Communication', value: finalReport.communicationScore },
            { label: 'Confidence', value: finalReport.confidenceScore },
            { label: 'Eye Contact', value: finalReport.eyeContactScore },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-[20px] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]">
              <p className="text-sm text-slate-300">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}%</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-[20px]">
          <div className="mb-4 flex gap-2">
            {finalReport.rounds.map((round) => (
              <button
                key={round.round}
                onClick={() => setActiveRound(round.round)}
                className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${activeRound === round.round ? 'bg-[#00D4FF] text-[#0A0F1E]' : 'bg-white/10 text-slate-300'}`}
              >
                Round {round.round}
              </button>
            ))}
          </div>

          {activeRoundData && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Round score: {activeRoundData.score}%</p>
              {activeRoundData.questions.map((question) => {
                const questionKey = `${question.round}-${question.questionNumber}`
                const expanded = openQuestion === questionKey

                return (
                  <div key={questionKey} className="rounded-2xl border border-white/10 bg-[#0A0F1E]/70 p-4">
                    <button className="flex w-full items-start justify-between gap-4 text-left" onClick={() => setOpenQuestion(expanded ? null : questionKey)}>
                      <div>
                        <p className="text-sm">Q{question.questionNumber}: {question.questionText}</p>
                        <p className="mt-1 text-xs text-slate-400">Score: {question.score}%</p>
                      </div>
                      <span>{expanded ? '−' : '+'}</span>
                    </button>

                    {expanded && (
                      <div className="mt-4 space-y-3 text-sm">
                        <p className="text-slate-200">{question.transcript}</p>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[#00D4FF]" style={{ width: `${question.score}%` }} />
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-[#10B981]">✅ Keywords matched</p>
                          <div className="flex flex-wrap gap-2">
                            {question.keywordsMatched.map((keyword) => (
                              <span key={keyword} className="rounded-full bg-[#10B981]/20 px-2 py-1 text-xs text-[#10B981]">{keyword}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-[#EF4444]">❌ Keywords missed</p>
                          <div className="flex flex-wrap gap-2">
                            {question.keywordsMissed.map((keyword) => (
                              <span key={keyword} className="rounded-full bg-[#EF4444]/20 px-2 py-1 text-xs text-[#EF4444]">{keyword}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-300">{question.feedback}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-[20px]">
            <h3 className="text-lg font-semibold">💪 Your Strengths</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-300">
              {finalReport.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="mt-6 text-lg font-semibold">⚠️ Areas to Improve</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-300">
              {finalReport.areasToImprove.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="mt-6 text-lg font-semibold">📚 Your Study Plan</h3>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-300">
              {finalReport.studyPlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-[20px]">
            <h3 className="text-lg font-semibold">Expression Analysis</h3>
            <p className="mt-2 text-sm text-slate-300">Eye contact: {finalReport.eyeContactPercentage}% • You looked away {finalReport.lookedAwayCount} times.</p>
            <div className="mt-4 space-y-3">
              {finalReport.expressionTimeline.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetSession()
              navigate('/setup')
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 transition-all duration-300 hover:scale-[1.02]"
          >
            Retake Interview
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-[#7C3AED] px-4 py-3 text-white transition-all duration-300 hover:scale-[1.02]"
          >
            Download PDF Report
          </button>
          <button
            onClick={() => {
              void handleShare()
            }}
            className="rounded-xl bg-[#00D4FF] px-4 py-3 text-[#0A0F1E] transition-all duration-300 hover:scale-[1.02]"
          >
            Share Results
          </button>
        </section>
      </div>
    </div>
  )
}

export default ReportPage
