type BreakdownItem = {
  question: string
  overall_score: number
  feedback: string
}

type QuestionBreakdownProps = {
  items: BreakdownItem[]
}

const QuestionBreakdown = ({ items }: QuestionBreakdownProps) => (
  <div className="rounded-xl bg-slate-900 p-4">
    <h3 className="mb-3 font-semibold">Question Breakdown</h3>
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="rounded bg-slate-800 p-3">
          <p className="text-sm">{item.question}</p>
          <p className="text-xs text-slate-400">Score: {item.overall_score} | {item.feedback}</p>
        </div>
      ))}
    </div>
  </div>
)

export default QuestionBreakdown
