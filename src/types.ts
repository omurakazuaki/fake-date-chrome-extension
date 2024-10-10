export type Setting = {
  enabled: boolean
  date: string
  timeLapse: string
  startingTime: number
}
export type Settings = Record<string, Setting>
