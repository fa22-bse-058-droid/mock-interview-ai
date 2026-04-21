import { create } from 'zustand'

type Evaluation = {
  question: string
  answer: string
  relevance_score: number
  confidence_score: number
  eye_contact_score: number
  overall_score: number
  feedback: string
}

type InterviewState = {
  role: string
  questions: string[]
  currentQuestionIndex: number
  transcript: string
  eyeContactScore: number
  evaluations: Evaluation[]
  report: Record<string, unknown> | null
  setRole: (role: string) => void
  setQuestions: (questions: string[]) => void
  setTranscript: (text: string) => void
  setEyeContactScore: (score: number) => void
  addEvaluation: (evaluation: Evaluation) => void
  nextQuestion: () => void
  setReport: (report: Record<string, unknown>) => void
  reset: () => void
}

const initialState = {
  role: 'general',
  questions: [],
  currentQuestionIndex: 0,
  transcript: '',
  eyeContactScore: 50,
  evaluations: [],
  report: null,
}

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,
  setRole: (role) => set({ role }),
  setQuestions: (questions) => set({ questions, currentQuestionIndex: 0 }),
  setTranscript: (transcript) => set({ transcript }),
  setEyeContactScore: (eyeContactScore) => set({ eyeContactScore }),
  addEvaluation: (evaluation) => set((state) => ({ evaluations: [...state.evaluations, evaluation] })),
  nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1, transcript: '' })),
  setReport: (report) => set({ report }),
  reset: () => set(initialState),
}))
