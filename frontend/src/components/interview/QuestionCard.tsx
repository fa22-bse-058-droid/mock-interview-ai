type QuestionCardProps = {
  question: string
  index: number
  total: number
}

const QuestionCard = ({ question, index, total }: QuestionCardProps) => (
  <div className="rounded-xl bg-slate-900 p-4">
    <p className="text-xs text-slate-400">Question {index + 1} / {total}</p>
    <h2 className="mt-2 text-lg font-semibold">{question}</h2>
  </div>
)

export default QuestionCard
