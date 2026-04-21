import { Link } from 'react-router-dom'
import ImprovementTips from '../components/report/ImprovementTips'
import QuestionBreakdown from '../components/report/QuestionBreakdown'
import ScoreGauge from '../components/report/ScoreGauge'
import { useInterviewStore } from '../store/interviewStore'

const ReportPage = () => {
  const report = useInterviewStore((state) => state.report)
  const evaluations = useInterviewStore((state) => state.evaluations)

  const overall = Number(report?.overall_score || 0)
  const tips = (report?.improvement_tips as string[]) || []

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Interview Report</h1>
      <ScoreGauge score={overall} />
      <QuestionBreakdown items={evaluations} />
      <ImprovementTips tips={tips} />
      <Link className="inline-block rounded bg-indigo-600 px-4 py-2 text-white" to="/setup">Try Again</Link>
    </div>
  )
}

export default ReportPage
