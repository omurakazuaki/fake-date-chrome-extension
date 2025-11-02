import { useEffect, useState } from 'react'

declare global {
  interface DateConstructor {
    real: DateConstructor
  }
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    const realNow = Date.real ? new Date.real() : new Date()

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`,
      realNow,
    }
  }

  const { date, time, realNow } = formatTime(currentTime)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'monospace',
        backgroundColor: '#1a1a1a',
        color: '#00ff00',
        margin: 0,
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Fake Date Test Page
      </h1>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '2rem',
          border: '2px solid #00ff00',
          borderRadius: '10px',
          backgroundColor: '#0a0a0a',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>{date}</div>
        <div style={{ fontSize: '6rem' }}>{time}</div>
      </div>
      <div style={{ marginTop: '2rem', fontSize: '1rem', opacity: 0.7 }}>
        <p>real now: {realNow.toLocaleString('ja-JP')}</p>
      </div>
    </div>
  )
}

export default App
