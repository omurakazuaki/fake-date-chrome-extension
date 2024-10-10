import dayjs, { Dayjs } from 'dayjs'
import { Settings } from '../../types'

export function useStorage(origin: string | null) {
  const saveSetting = (
    enabled: boolean,
    date: string,
    timeLapse: string,
    startingTime: number,
  ) => {
    if (!origin) return
    chrome.storage.local.set({
      [origin]: { enabled, date, timeLapse, startingTime },
    })
  }

  const loadSetting = (
    setEnabled: (enabled: boolean) => void,
    setDate: (date: Dayjs) => void,
    setTimeLapse: (timeLapse: string) => void,
    setStartRealTime: (startRealTime: number) => void,
  ) => {
    chrome.storage.local.get<Settings>(origin, (settings) => {
      if (!origin) return
      const setting = settings[origin]
      if (!setting) return
      setEnabled(setting.enabled ?? false)
      setDate(dayjs(setting.date ?? Date.now()))
      setTimeLapse(setting.timeLapse ?? 'RESET')
      setStartRealTime(setting.startingTime ?? Date.now())
    })
  }

  return {
    saveSetting,
    loadSetting,
  }
}
