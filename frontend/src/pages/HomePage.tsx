import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HomePage = () => (
  <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 text-center">
    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold">
      Mock Interview AI
    </motion.h1>
    <p className="text-slate-300">Practice with AI-powered questions, speech feedback, and focus tracking.</p>
    <Link to="/setup" className="rounded bg-indigo-600 px-4 py-2 font-medium">Start Interview</Link>
  </div>
)

export default HomePage
