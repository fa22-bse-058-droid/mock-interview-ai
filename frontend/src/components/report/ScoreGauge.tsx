type ScoreGaugeProps = {
  score: number
}

const ScoreGauge = ({ score }: ScoreGaugeProps) => (
  <div className="rounded-xl bg-slate-900 p-4 text-center">
    <p className="text-xs text-slate-400">Overall Score</p>
    <p className="mt-2 text-4xl font-bold text-emerald-400">{score}</p>
  </div>
)

export default ScoreGauge
