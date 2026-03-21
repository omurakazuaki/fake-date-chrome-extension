import dayjs, { Dayjs } from 'dayjs'
import { History, HistoryItem, Settings } from '../../types'

const MAX_HISTORY_SIZE = 10

const getHistoryKey = (origin: string) => `dateHistory_${origin}`

export function useStorage(origin: string | null) {
  const saveSetting = async (
    enabled: boolean,
    date: string,
    autoReload: boolean,
    timeLapse: string,
    timeSpeed: number,
    addToHistoryFlag = false,
  ) => {
    if (!origin) return
    await chrome.storage.local.set({
      [origin]: {
        enabled,
        date,
        autoReload,
        timeLapse,
        timeSpeed,
        startingTime: Date.now(),
      },
    })

    // 履歴に追加（Applyボタン押下時のみ）
    if (addToHistoryFlag && enabled && date) {
      await addToHistory({ date, timestamp: Date.now() })
    }
  }

  const loadSetting = async (
    setEnabled: (enabled: boolean) => void,
    setDate: (date: Dayjs) => void,
    setAutoReload: (autoReload: boolean) => void,
    setTimeLapse: (timeLapse: string) => void,
    setTimeSpeed: (timeSpeed: number) => void,
  ) => {
    const settings = await chrome.storage.local.get<Settings>(origin)
    if (!origin) return
    const setting = settings[origin]
    if (!setting) return
    setEnabled(setting.enabled ?? false)
    setDate(dayjs(setting.date ?? Date.now()))
    setAutoReload(setting.autoReload ?? false)
    setTimeLapse(setting.timeLapse ?? 'RESET')
    setTimeSpeed(setting.timeSpeed ?? 1)
  }

  const addToHistory = async (item: HistoryItem) => {
    if (!origin) return
    const historyKey = getHistoryKey(origin)
    const result = await chrome.storage.local.get<{ [key: string]: History }>(
      historyKey,
    )
    const history: History = result[historyKey] || []

    // 同じ日付が既に存在する場合は削除
    const filtered = history.filter((h) => h.date !== item.date)

    // 新しいアイテムを先頭に追加
    const newHistory = [item, ...filtered].slice(0, MAX_HISTORY_SIZE)

    await chrome.storage.local.set({ [historyKey]: newHistory })
  }

  const loadHistory = async (): Promise<History> => {
    if (!origin) return []
    const historyKey = getHistoryKey(origin)
    const result = await chrome.storage.local.get<{ [key: string]: History }>(
      historyKey,
    )
    return result[historyKey] || []
  }

  const deleteHistoryItem = async (date: string) => {
    if (!origin) return
    const historyKey = getHistoryKey(origin)
    const result = await chrome.storage.local.get<{ [key: string]: History }>(
      historyKey,
    )
    const history: History = result[historyKey] || []
    const newHistory = history.filter((h) => h.date !== date)
    await chrome.storage.local.set({ [historyKey]: newHistory })
  }

  return {
    saveSetting,
    loadSetting,
    loadHistory,
    deleteHistoryItem,
    addToHistory
  }
}
