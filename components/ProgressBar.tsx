import { Progress } from "@/components/ui/progress"
// import { useRedmineStore } from "@/lib/store"
import { useTimerStore } from "@/store/timer"

type ProgressBarProps = {
  taskId: number
  estimatedHours: number | null
}

export function ProgressBar({ taskId, estimatedHours }: ProgressBarProps) {
	const { getProgressPercentage, getElapsedSeconds } = useTimerStore()
  
	const progressPercentage = getProgressPercentage(taskId, estimatedHours ?? undefined)
  const elapsedSeconds = getElapsedSeconds(taskId)
  const elapsedHours = Math.round((elapsedSeconds / 3600) * 10) / 10

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>
          {elapsedHours}ч / {estimatedHours ?? 0}ч
        </span>
        <span className="w-[50px] text-right">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-1.5 w-full" />
    </div>
  )
}