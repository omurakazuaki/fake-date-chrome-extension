import dayjs, { Dayjs } from 'dayjs'
import { ChangeEvent, useEffect, useState } from 'react'
import { useStorage } from './useStorage'

export function useForm() {
  const [origin, setOrigin] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const [autoReload, setAutoReload] = useState(false)
  const [timeLapse, setTimeLapse] = useState<string>('RESET')
  const { saveSetting, loadSetting } = useStorage(origin)

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newEnabled = event.target.checked
    setEnabled(newEnabled)
    saveSetting(newEnabled, date?.format() || '', autoReload, timeLapse)
  }

  const handleDateChange = (newDate: Dayjs | null) => {
    setDate(newDate ?? dayjs())
    saveSetting(enabled, newDate?.format() || '', autoReload, timeLapse)
  }

  const handleAutoReloadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newAutoReload = event.target.checked
    setAutoReload(newAutoReload)
    saveSetting(enabled, date?.format() || '', newAutoReload, timeLapse)
  }

  const handleTimeLapseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTimeLapse = event.target.value
    setTimeLapse(newTimeLapse)
    saveSetting(enabled, date?.format() || '', autoReload, newTimeLapse)
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.url) return
      const url = new URL(tab.url)
      setOrigin(url.origin)
      loadSetting(setEnabled, setDate, setAutoReload, setTimeLapse)
    })
  }, [loadSetting])

  return {
    origin,
    enabled,
    date,
    autoReload,
    timeLapse,
    handleSwitchChange,
    handleDateChange,
    handleAutoReloadChange,
    handleTimeLapseChange,
  }
}
