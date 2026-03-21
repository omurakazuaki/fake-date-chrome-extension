import dayjs, { Dayjs } from 'dayjs'
import { ChangeEvent, useEffect, useState } from 'react'
import { History } from '../../types'
import { useStorage } from './useStorage'

export function useForm() {
  const [origin, setOrigin] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const [autoReload, setAutoReload] = useState(false)
  const [timeLapse, setTimeLapse] = useState<string>('RESET')
  const [timeSpeed, setTimeSpeed] = useState<number>(1)
  const [history, setHistory] = useState<History>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [applied, setApplied] = useState(false)
  const {
    saveSetting,
    loadSetting,
    loadHistory,
    deleteHistoryItem,
  } = useStorage(origin)

  const handleSwitchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const newEnabled = event.target.checked
    setEnabled(newEnabled)
    // enabledの切り替えは即時反映
    await saveSetting(
      newEnabled,
      date?.format() || '',
      autoReload,
      timeLapse,
      timeSpeed,
      false,
    )
  }

  const handleDateChange = (newDate: Dayjs | null) => {
    setDate(newDate ?? dayjs())
    setHasChanges(true)
  }

  const handleAutoReloadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newAutoReload = event.target.checked
    setAutoReload(newAutoReload)
    setHasChanges(true)
  }

  const handleTimeLapseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTimeLapse = event.target.value
    setTimeLapse(newTimeLapse)
    setHasChanges(true)
  }

  const handleTimeSpeedChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    if (!isNaN(value) && value >= 0) {
      setTimeSpeed(value)
      setHasChanges(true)
    }
  }

  const handleApply = async () => {
    await saveSetting(
      enabled,
      date?.format() || '',
      autoReload,
      timeLapse,
      timeSpeed,
      true,
    )
    setHasChanges(false)
    setApplied(true)
    const historyData = await loadHistory()
    setHistory(historyData)
  }

  const handleAppliedClose = () => {
    setApplied(false)
  }

  const handleHistorySelect = (historyItem: History[0]) => {
    setDate(dayjs(historyItem.date))
    setHasChanges(true)
  }

  const handleHistoryDelete = async (date: string) => {
    await deleteHistoryItem(date)
    const historyData = await loadHistory()
    setHistory(historyData)
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]
      if (!tab?.url) return
      const url = new URL(tab.url)
      setOrigin(url.origin)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!origin) return
    const loadData = async () => {
      await loadSetting(setEnabled, setDate, setAutoReload, setTimeLapse, setTimeSpeed)
      const historyData = await loadHistory()
      setHistory(historyData)
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin])

  return {
    origin,
    enabled,
    date,
    autoReload,
    timeLapse,
    timeSpeed,
    history,
    hasChanges,
    applied,
    handleSwitchChange,
    handleDateChange,
    handleAutoReloadChange,
    handleTimeLapseChange,
    handleTimeSpeedChange,
    handleApply,
    handleAppliedClose,
    handleHistorySelect,
    handleHistoryDelete,
  }
}
