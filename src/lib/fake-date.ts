declare global {
  interface Window {
    __FakeDate: FakeDate
  }
}

interface FakeDate {
  inject: (date: string, timelapse: string, startingTime: number) => void
  remove: () => void
}

export const createFakeDate = (
  date: string,
  timelapse: string,
  startingTime: number,
) => {
  if (window.__FakeDate) return window.__FakeDate
  window.__FakeDate = (() => {
    const RealDate = window.Date
    return {
      inject: (date: string, timelapse: string, startingTime: number) => {
        const startRealTime =
          timelapse == 'KEEP' ? startingTime : RealDate.now()
        function FakeDate(...args: ConstructorParameters<typeof Date>) {
          return [...args].length === 0
            ? new RealDate(FakeDate.now())
            : new RealDate(...args)
        }
        FakeDate.now = () => {
          const delta =
            timelapse === 'STOP' ? 0 : RealDate.now() - startRealTime
          return new RealDate(date).getTime() + delta
        }
        FakeDate.prototype = RealDate.prototype
        Object.setPrototypeOf(FakeDate, RealDate)
        window.Date = FakeDate as unknown as DateConstructor
      },
      remove: () => {
        window.Date = RealDate
      },
    }
  })()
  if (date) {
    window.__FakeDate.inject(date, timelapse, startingTime)
  }
}

export const injectFakeDate = (
  date: string,
  timelapse: string,
  startingTime: number,
) => {
  window.__FakeDate.inject(date, timelapse, startingTime)
}

export const removeFakeDate = () => {
  window.__FakeDate.remove()
}
