import dayjs, { Dayjs } from 'dayjs'
import { Settings } from '../../types'

export function useStorage(origin: string | null) {
  const saveSetting = (
    enabled: boolean,
    date: string,
    autoReload: boolean,
    timeLapse: string,
  ) => {
    if (!origin) return
    chrome.storage.local.set({
      [origin]: {
        enabled,
        date,
        autoReload,
        timeLapse,
        startingTime: Date.now(),
      },
    })
  }

  const loadSetting = async (
    setEnabled: (enabled: boolean) => void,
    setDate: (date: Dayjs) => void,
    setAutoReload: (autoReload: boolean) => void,
    setTimeLapse: (timeLapse: string) => void,
  ) => {
    const settings = await chrome.storage.local.get<Settings>(origin)
    if (!origin) return
    const setting = settings[origin]
    if (!setting) return
    setEnabled(setting.enabled ?? false)
    setDate(dayjs(setting.date ?? Date.now()))
    setAutoReload(setting.autoReload ?? false)
    setTimeLapse(setting.timeLapse ?? 'RESET')
  }

  return {
    saveSetting,
    loadSetting,
  }
}
