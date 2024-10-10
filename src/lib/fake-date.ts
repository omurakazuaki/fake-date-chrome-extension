declare global {
  interface Window {
    __FakeDate: FakeDate
  }
}

interface FakeDate {
  inject: (date: string, startingTime: number) => void
  remove: () => void
}

export const createFakeDate = (date: string, startingTime: number) => {
  if (window.__FakeDate) return window.__FakeDate
  window.__FakeDate = (() => {
    const RealDate = window.Date
    return {
      inject: (date: string, startingTime: number) => {
        function FakeDate(...args: ConstructorParameters<typeof Date>) {
          return [...args].length === 0
            ? new RealDate(FakeDate.now())
            : new RealDate(...args)
        }
        FakeDate.now = () => {
          const delta = startingTime < 0 ? 0 : RealDate.now() - startingTime
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
    window.__FakeDate.inject(date, startingTime)
  }
}

export const injectFakeDate = (
  date: string,
  startingTime: number,
  autReload: boolean,
) => {
  window.__FakeDate.inject(date, startingTime)
  if (autReload) location.reload()
}

export const removeFakeDate = (autReload: boolean) => {
  window.__FakeDate.remove()
  if (autReload) location.reload()
}
