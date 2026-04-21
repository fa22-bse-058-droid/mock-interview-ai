type TranscriptBoxProps = {
  transcript: string
}

const TranscriptBox = ({ transcript }: TranscriptBoxProps) => (
  <div className="rounded-xl bg-slate-900 p-4">
    <p className="text-xs text-slate-400">Transcript</p>
    <p className="mt-2 min-h-20 text-sm">{transcript || 'Start speaking to see transcript…'}</p>
  </div>
)

export default TranscriptBox
