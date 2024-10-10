import dayjs, { Dayjs } from 'dayjs'
import { ChangeEvent, useEffect, useState } from 'react'
import { useStorage } from './useStorage'

export function useForm() {
  const [origin, setOrigin] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const [timeLapse, setTimeLapse] = useState<string>('RESET')
  const [startRealTime, setStartRealTime] = useState(Date.now())
  const { saveSetting, loadSetting } = useStorage(origin)

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newEnabled = event.target.checked
    setEnabled(newEnabled)
    const newStartRealTime = Date.now()
    setStartRealTime(newStartRealTime)
    saveSetting(newEnabled, date?.format() || '', timeLapse, newStartRealTime)
  }

  const handleDateChange = (newDate: Dayjs | null) => {
    setDate(newDate ?? dayjs())
    const newStartRealTime = Date.now()
    setStartRealTime(newStartRealTime)
    saveSetting(enabled, newDate?.format() || '', timeLapse, newStartRealTime)
  }

  const handleTimeLapseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTimeLapse = event.target.value
    setTimeLapse(newTimeLapse)
    const newStartRealTime = Date.now()
    const delta = timeLapse === 'STOP' ? 0 : newStartRealTime - startRealTime
    const newDate = date?.add(delta, 'millisecond')
    setStartRealTime(newStartRealTime)
    saveSetting(
      enabled,
      newDate?.format() || '',
      newTimeLapse,
      newStartRealTime,
    )
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.url) return
      const url = new URL(tab.url)
      setOrigin(url.origin)
      loadSetting(setEnabled, setDate, setTimeLapse, setStartRealTime)
    })
  }, [loadSetting])

  return {
    origin,
    enabled,
    date,
    timeLapse,
    handleSwitchChange,
    handleDateChange,
    handleTimeLapseChange,
  }
}
