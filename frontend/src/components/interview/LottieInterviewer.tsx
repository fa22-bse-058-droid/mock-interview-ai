import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import interviewerAnimation from '../../assets/interviewer.json'

type LottieInterviewerProps = {
  isSpeaking: boolean
  questionText: string
  questionNumber: number
  totalQuestions: number
  roundLabel: string
}

const waveHeights = ['h-4', 'h-7', 'h-10', 'h-7', 'h-4']

const LottieInterviewer = ({
  isSpeaking,
  questionText,
  questionNumber,
  totalQuestions,
  roundLabel,
}: LottieInterviewerProps) => {
  const animRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animRef.current) return
    const anim = lottie.loadAnimation({
      container: animRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: interviewerAnimation,
    })
    return () => anim.destroy()
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="absolute right-5 top-5 rounded-full bg-[#7C3AED]/30 px-3 py-1 text-xs font-medium text-[#F9FAFB]">
        {roundLabel}
      </div>

      <p className="text-sm text-slate-300">
        Question {questionNumber} of {totalQuestions}
      </p>

      <motion.div
        animate={
          isSpeaking
            ? {
                boxShadow: [
                  '0 0 0px #00D4FF',
                  '0 0 40px rgba(0,212,255,0.65)',
                  '0 0 0px #00D4FF',
                ],
              }
            : { boxShadow: '0 0 0px #00D4FF' }
        }
        transition={{ duration: 1.6, repeat: isSpeaking ? Infinity : 0 }}
        className="mx-auto mt-5 max-w-[360px] rounded-full border border-[#00D4FF]/40 p-2"
      >
        <div ref={animRef} className="mx-auto h-72 w-full" />
      </motion.div>

      {isSpeaking && (
        <div className="mt-4 flex items-end justify-center gap-2">
          {waveHeights.map((height, index) => (
            <motion.span
              key={height + index}
              className={`w-2 rounded-full bg-[#00D4FF] ${height}`}
              animate={{ scaleY: [0.5, 1.25, 0.6] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.12 }}
            />
          ))}
        </div>
      )}

      <motion.div
        key={`${questionNumber}-${questionText}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mt-6 rounded-2xl border border-white/10 bg-[#0A0F1E]/70 p-4"
      >
        <motion.p
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.1, ease: 'linear' }}
          className="overflow-hidden whitespace-nowrap text-sm text-[#F9FAFB]"
        >
          {questionText}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LottieInterviewer