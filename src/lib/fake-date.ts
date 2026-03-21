declare global {
  interface Window {
    __FakeDate: FakeDate
  }
}

interface FakeDate {
  inject: (date: string, startingTime: number, timeSpeed: number) => void
  remove: () => void
}

export const createFakeDate = (date: string, startingTime: number, timeSpeed: number) => {
  if (window.__FakeDate) return window.__FakeDate
  window.__FakeDate = (() => {
    const RealDate = window.Date
    return {
      inject: (date: string, startingTime: number, timeSpeed: number) => {
        function FakeDate(...args: ConstructorParameters<typeof Date>) {
          return [...args].length === 0
            ? new RealDate(FakeDate.now())
            : new RealDate(...args)
        }
        FakeDate.now = () => {
          const delta = (RealDate.now() - startingTime) * timeSpeed
          return new RealDate(date).getTime() + delta
        }
        FakeDate.real = RealDate
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
    window.__FakeDate.inject(date, startingTime, timeSpeed)
  }
}

export const injectFakeDate = (
  date: string,
  startingTime: number,
  timeSpeed: number,
  autoReload: boolean,
) => {
  window.__FakeDate.inject(date, startingTime, timeSpeed)
  if (autoReload) location.reload()
}

export const removeFakeDate = (autoReload: boolean) => {
  window.__FakeDate.remove()
  if (autoReload) location.reload()
}
