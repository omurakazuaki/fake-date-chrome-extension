export type Setting = {
  enabled: boolean
  date: string
  timeLapse: string
  autoReload: boolean
  startingTime: number
  timeSpeed: number
}
export type Settings = Record<string, Setting>

export type HistoryItem = {
  date: string
  timestamp: number
}

export type History = HistoryItem[]
