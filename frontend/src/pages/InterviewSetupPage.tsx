import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchQuestions } from '../api/interviewApi'
import { useInterviewStore } from '../store/interviewStore'

const InterviewSetupPage = () => {
  const [loading, setLoading] = useState(false)
  const [role, setRoleLocal] = useState('general')
  const navigate = useNavigate()
  const setRole = useInterviewStore((state) => state.setRole)
  const setQuestions = useInterviewStore((state) => state.setQuestions)

  const onStart = async () => {
    setLoading(true)
    setRole(role)
    const data = await fetchQuestions(role)
    setQuestions(data.questions || [])
    setLoading(false)
    navigate('/interview')
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-20">
      <h1 className="text-2xl font-semibold">Interview Setup</h1>
      <select className="w-full rounded bg-slate-800 p-3" value={role} onChange={(e) => setRoleLocal(e.target.value)}>
        <option value="general">General</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
      </select>
      <button className="rounded bg-indigo-600 px-4 py-2" onClick={onStart} disabled={loading}>
        {loading ? 'Loading...' : 'Begin'}
      </button>
    </div>
  )
}

export default InterviewSetupPage
