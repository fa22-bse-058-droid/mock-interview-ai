import { create } from 'zustand'

export type InterviewMode = 'full' | 'quick'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type FacialDataPoint = {
  timestamp: number
  eyeContact: 'good' | 'poor' | 'unknown'
  expression: string
  confidenceLevel: number
}

export type AnswerRecord = {
  round: number
  questionNumber: number
  questionText: string
  transcript: string
  score: number
  keywordsMatched: string[]
  keywordsMissed: string[]
  feedback: string
}

export type RoundReport = {
  round: number
  title: string
  score: number
  questions: AnswerRecord[]
}

export type FinalReport = {
  overallScore: number
  technicalScore: number
  communicationScore: number
  confidenceScore: number
  eyeContactScore: number
  strengths: string[]
  areasToImprove: string[]
  studyPlan: string[]
  rounds: RoundReport[]
  eyeContactPercentage: number
  lookedAwayCount: number
  expressionTimeline: Array<{ label: string; value: number }>
}

type StartSessionPayload = {
  candidateName: string
  role: string
  difficulty: Difficulty
  mode: InterviewMode
  roundTitles: string[]
  questionsByRound: string[][]
}

type InterviewState = {
  sessionId: string
  candidateName: string
  role: string
  difficulty: Difficulty
  currentRound: number
  currentQuestion: number
  allAnswers: AnswerRecord[]
  finalReport: FinalReport | null
  isInterviewActive: boolean
  facialData: FacialDataPoint[]
  interviewMode: InterviewMode
  roundTitles: string[]
  questionsByRound: string[][]
  startSession: (payload: StartSessionPayload) => void
  submitAnswer: (answer: AnswerRecord) => void
  nextQuestion: () => { completed: boolean; movedToNewRound: boolean }
  completeInterview: (report: FinalReport) => void
  saveEyeContactData: (data: FacialDataPoint) => void
  resetSession: () => void
}

const initialState: Omit<
  InterviewState,
  'startSession' | 'submitAnswer' | 'nextQuestion' | 'completeInterview' | 'saveEyeContactData' | 'resetSession'
> = {
  sessionId: '',
  candidateName: '',
  role: 'General CS',
  difficulty: 'medium',
  currentRound: 1,
  currentQuestion: 1,
  allAnswers: [],
  finalReport: null,
  isInterviewActive: false,
  facialData: [],
  interviewMode: 'full',
  roundTitles: ['OOP & Programming', 'Data Structures', 'Behavioral'],
  questionsByRound: [[], [], []],
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  ...initialState,
  startSession: ({ candidateName, role, difficulty, mode, roundTitles, questionsByRound }) =>
    set({
      sessionId: crypto.randomUUID(),
      candidateName,
      role,
      difficulty,
      currentRound: 1,
      currentQuestion: 1,
      allAnswers: [],
      finalReport: null,
      isInterviewActive: true,
      facialData: [],
      interviewMode: mode,
      roundTitles,
      questionsByRound,
    }),
  submitAnswer: (answer) => set((state) => ({ allAnswers: [...state.allAnswers, answer] })),
  nextQuestion: () => {
    const state = get()
    const roundIndex = state.currentRound - 1
    const questionCount = state.questionsByRound[roundIndex]?.length ?? 0

    if (state.currentQuestion < questionCount) {
      set({ currentQuestion: state.currentQuestion + 1 })
      return { completed: false, movedToNewRound: false }
    }

    if (state.currentRound < state.questionsByRound.length) {
      set({ currentRound: state.currentRound + 1, currentQuestion: 1 })
      return { completed: false, movedToNewRound: true }
    }

    set({ isInterviewActive: false })
    return { completed: true, movedToNewRound: false }
  },
  completeInterview: (finalReport) => set({ finalReport, isInterviewActive: false }),
  saveEyeContactData: (data) => set((state) => ({ facialData: [...state.facialData, data] })),
  resetSession: () => set({ ...initialState }),
}))
