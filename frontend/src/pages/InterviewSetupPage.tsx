import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Difficulty, type InterviewMode, useInterviewStore } from '../store/interviewStore'

const roleOptions = ['Backend Developer', 'Frontend Developer', 'Full Stack', 'Data Scientist', 'General CS']

const difficultyOptions: Array<{ key: Difficulty; icon: string; title: string; description: string }> = [
  { key: 'easy', icon: '🟢', title: 'Easy', description: 'Warm-up level with fundamentals.' },
  { key: 'medium', icon: '🟡', title: 'Medium', description: 'Balanced technical and behavioral.' },
  { key: 'hard', icon: '🔴', title: 'Hard', description: 'High-pressure, deep reasoning questions.' },
]

const questionLibrary: Record<string, string[]> = {
  'OOP & Programming': [
    'Explain the four pillars of OOP with practical examples.',
    'How do you handle error boundaries in production apps?',
    'When would you choose composition over inheritance?',
    'What is dependency inversion and why does it matter?',
    'How would you optimize a slow API response path?',
  ],
  'Data Structures & Algorithms': [
    'Compare arrays, linked lists, and hash maps for lookups.',
    'How do you detect a cycle in a linked list?',
    'Explain time and space complexity of quicksort.',
    'How would you design an LRU cache?',
    'How do graphs help solve recommendation systems?',
  ],
  'Behavioral & Communication': [
    'Tell me about a tough bug you resolved under pressure.',
    'Describe a time you handled conflicting feedback.',
    'How do you explain technical tradeoffs to non-technical stakeholders?',
    'Share an example of mentoring a teammate.',
    'How do you prioritize when deadlines collide?',
  ],
}

const seededValue = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280

const InterviewSetupPage = () => {
  const navigate = useNavigate()
  const startSession = useInterviewStore((state) => state.startSession)

  const [candidateName, setCandidateName] = useState('')
  const [role, setRole] = useState(roleOptions[0])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [mode, setMode] = useState<InterviewMode>('full')
  const [tipsOpen, setTipsOpen] = useState(false)

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => ({
        id: index,
        left: `${seededValue(index + 11) * 100}%`,
        top: `${seededValue(index + 37) * 100}%`,
        delay: seededValue(index + 71) * 2,
        duration: 3 + seededValue(index + 101) * 4,
      })),
    [],
  )

  const handleStart = () => {
    const roundTitles = mode === 'quick' ? ['OOP & Programming'] : Object.keys(questionLibrary)
    const questionsByRound = roundTitles.map((title) => questionLibrary[title])

    startSession({
      candidateName: candidateName.trim() || 'Candidate',
      role,
      difficulty,
      mode,
      roundTitles,
      questionsByRound,
    })

    navigate('/interview')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0F1E] px-4 py-10 text-[#F9FAFB]">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#00D4FF]/40"
          style={{ left: particle.left, top: particle.top }}
          animate={{ y: [-8, 8, -8], opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: particle.duration, delay: particle.delay }}
        />
      ))}

      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-[20px]">
        <h1 className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] bg-clip-text text-center text-4xl font-bold text-transparent">
          AI Mock Interview
        </h1>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-300">Your Name</span>
            <input
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
              placeholder="Enter your name"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0A0F1E] px-4 py-3 text-[#F9FAFB] outline-none transition-all duration-300 focus:border-[#00D4FF]"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Target Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0A0F1E] px-4 py-3 text-[#F9FAFB] outline-none transition-all duration-300 focus:border-[#00D4FF]"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="text-sm text-slate-300">Difficulty</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setDifficulty(option.key)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 hover:scale-[1.02] ${difficulty === option.key ? 'border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_30px_rgba(0,212,255,0.22)]' : 'border-white/10 bg-white/5'}`}
                >
                  <p className="text-lg">{option.icon}</p>
                  <p className="mt-2 font-semibold">{option.title}</p>
                  <p className="mt-1 text-xs text-slate-300">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Interview Mode</p>
            <div className="mt-3 flex items-center rounded-full border border-white/10 bg-[#0A0F1E] p-1">
              <button
                onClick={() => setMode('full')}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition-all duration-300 ${mode === 'full' ? 'bg-[#00D4FF] text-[#0A0F1E]' : 'text-slate-300'}`}
              >
                Full Interview (all 3 rounds)
              </button>
              <button
                onClick={() => setMode('quick')}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition-all duration-300 ${mode === 'quick' ? 'bg-[#7C3AED] text-white' : 'text-slate-300'}`}
              >
                Quick Mode (1 round)
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-5 py-3 font-semibold text-[#0A0F1E] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(0,212,255,0.35)]"
          >
            <motion.span animate={{ opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              Start Interview
            </motion.span>
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <button onClick={() => setTipsOpen((prev) => !prev)} className="flex w-full items-center justify-between text-left">
              <span className="font-medium">What to expect</span>
              <span>{tipsOpen ? '−' : '+'}</span>
            </button>
            <AnimatePresence>
              {tipsOpen && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-300"
                >
                  <li>AI interviewer asks role-specific questions in timed rounds.</li>
                  <li>Your eye contact, confidence, and communication are tracked.</li>
                  <li>You receive a full report with targeted study plan.</li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewSetupPage
