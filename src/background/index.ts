import {
  createFakeDate,
  injectFakeDate,
  removeFakeDate,
} from '../lib/fake-date'
import { Setting, Settings } from '../types'

chrome.tabs.onActivated.addListener((activeInfo) => {
  executeFakeDate(activeInfo.tabId)
})

chrome.tabs.onUpdated.addListener((tabId) => {
  executeFakeDate(tabId)
})

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local' && changes) {
    const origins = Object.keys(changes)
    if (!origins.length) return
    const tabs = await chrome.tabs.query({})
    tabs.forEach((tab) => {
      if (!tab?.url) return
      const url = new URL(tab.url)
      const setting = changes[url.origin]?.newValue
      if (!setting) return
      executeFakeDateFunction(tab.id!, setting)
      updateBadge(setting)
    })
  }
})

function executeFakeDateFunction(tabId: number, setting: Setting | undefined) {
  if (setting?.enabled) {
    executeInjectFakeDate(
      tabId,
      setting.date,
      calculateStartingTime(setting),
      setting.autoReload,
    )
  } else {
    executeRemoveFakeDate(tabId, setting?.autoReload ?? false)
  }
}

function updateBadge(setting: Setting | undefined) {
  const { path, title } = setting?.enabled
    ? {
        path: 'icon128.png',
        title: `Fake Date (${setting.date})`,
      }
    : {
        path: 'icon128_disabled.png',
        title: 'Fake Date (OFF)',
      }
  chrome.action.setIcon({ path })
  chrome.action.setTitle({ title })
}

function executeCreateFakeDate(
  tabId: number,
  date: string,
  startingTime: number,
) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: createFakeDate,
    args: [date, startingTime],
    world: 'MAIN',
    injectImmediately: true,
  })
}

function executeInjectFakeDate(
  tabId: number,
  date: string,
  startingTime: number,
  autReload: boolean,
) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: injectFakeDate,
    args: [date, startingTime, autReload],
    world: 'MAIN',
    injectImmediately: true,
  })
}

function executeRemoveFakeDate(tabId: number, autReload: boolean) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: removeFakeDate,
    args: [autReload],
    world: 'MAIN',
    injectImmediately: true,
  })
}

async function executeFakeDate(tabId: number) {
  const tab = await chrome.tabs.get(tabId)
  if (!tab?.url) return
  const url = new URL(tab.url)
  const origin = url.origin
  const settings = await chrome.storage.local.get<Settings>(origin)
  const setting = settings[origin]
  executeCreateFakeDate(
    tabId,
    setting?.enabled ? setting.date : '',
    calculateStartingTime(setting),
  )
  updateBadge(setting)
}

function calculateStartingTime(setting: Setting | undefined) {
  switch (setting?.timeLapse) {
    case 'STOP':
      return -1
    case 'RESET':
      return Date.now()
    default:
      return setting?.startingTime ?? Date.now()
  }
}
