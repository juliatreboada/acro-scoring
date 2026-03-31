export type TrafficLight = 'red' | 'yellow' | 'green'

export type Answers = Record<string, number>
// key = `${sectionIndex}:${questionIndex}` (both 0-based)
// value = numeric value (0, 0.1, 0.2, 0.3, or 0.4)

export type Lang = 'en' | 'es'

export type Performance = {
  id: string
  gymnasts: string
  ageGroup: string
  category: string
  routineType: string
  position: number
  tsUrl?: string | null
}
