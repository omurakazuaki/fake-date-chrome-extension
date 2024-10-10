export type Setting = {
  enabled: boolean
  date: string
  timeLapse: string
  autoReload: boolean
  startingTime: number
}
export type Settings = Record<string, Setting>
