import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/interview',
})

export const fetchQuestions = async (role: string) => {
  const { data } = await api.get('/questions/', { params: { role } })
  return data
}

export const evaluateAnswer = async (payload: {
  question: string
  answer: string
  eye_contact_score: number
}) => {
  const { data } = await api.post('/evaluate/', payload)
  return data
}

export const generateReport = async (evaluations: unknown[]) => {
  const { data } = await api.post('/report/', { evaluations })
  return data
}
