import Lottie from 'lottie-react'
import interviewerAnimation from '../../assets/interviewer.json'

const LottieInterviewer = () => (
  <div className="rounded-xl bg-slate-900 p-4">
    <Lottie animationData={interviewerAnimation} loop className="mx-auto h-52" />
  </div>
)

export default LottieInterviewer
