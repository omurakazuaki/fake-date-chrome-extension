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

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes) {
    const origins = Object.keys(changes)
    if (!origins.length) return
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tab?.url) return
        const url = new URL(tab.url)
        const setting = changes[url.origin]?.newValue
        if (!setting) return
        executeFakeDateFunction(tab.id!, setting)
        updateBadge(setting)
      })
    })
  }
})

function executeFakeDateFunction(tabId: number, setting: Setting | undefined) {
  if (setting?.enabled) {
    execteInjectFakeDate(
      tabId,
      setting.date,
      setting.timeLapse,
      setting.startingTime,
    )
  } else {
    executeRemoveFakeDate(tabId)
  }
}

function updateBadge(setting: Setting | undefined) {
  if (setting?.enabled) {
    chrome.action.setIcon({ path: 'icon128.png' })
    chrome.action.setTitle({ title: 'Fake Date' })
  } else {
    chrome.action.setIcon({ path: 'icon128_disabled.png' })
    chrome.action.setTitle({ title: 'Fake Date (OFF)' })
  }
}

function executeCreateFakeDate(
  tabId: number,
  date: string,
  timelapse: string,
  startingTime: number,
) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: createFakeDate,
    args: [date, timelapse, startingTime],
    world: 'MAIN',
    injectImmediately: true,
  })
}

function execteInjectFakeDate(
  tabId: number,
  date: string,
  timelapse: string,
  startingTime: number,
) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: injectFakeDate,
    args: [date, timelapse, startingTime],
    world: 'MAIN',
    injectImmediately: true,
  })
}

function executeRemoveFakeDate(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: removeFakeDate,
    world: 'MAIN',
    injectImmediately: true,
  })
}

async function executeFakeDate(tabId: number) {
  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url) return
    const url = new URL(tab.url)
    const origin = url.origin
    chrome.storage.local.get<Settings>(origin, (settings) => {
      const setting = settings[origin]
      executeCreateFakeDate(
        tabId,
        setting?.enabled ? setting.date : '',
        setting?.timeLapse ?? 'RESET',
        setting?.startingTime ?? Date.now(),
      )
      updateBadge(setting)
    })
  })
}
