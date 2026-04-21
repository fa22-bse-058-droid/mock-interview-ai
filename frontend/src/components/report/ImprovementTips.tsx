type ImprovementTipsProps = {
  tips: string[]
}

const ImprovementTips = ({ tips }: ImprovementTipsProps) => (
  <div className="rounded-xl bg-slate-900 p-4">
    <h3 className="mb-3 font-semibold">Improvement Tips</h3>
    <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
      {tips.map((tip, idx) => (
        <li key={idx}>{tip}</li>
      ))}
    </ul>
  </div>
)

export default ImprovementTips
