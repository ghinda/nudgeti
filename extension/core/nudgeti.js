/* globals Store, settingsStore, browser */
/*
 * Nudgeti
 *
 */

function humanTime (milis = 1000) {
  const seconds = Math.floor(milis / 1000)
  if (seconds < 60) {
    return `${seconds} seconds`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minutes`
  }

  const hours = Math.floor(minutes / 60)
  return `${hours} hours`
}

function milis (minutes) {
  return minutes * 60 * 1000
}

const store = new Store('history', {}, false)

const pastTime = '1958-01-15'

resetAlarm()
settingsStore.change(resetAlarm)

function isBlacklisted (hostname) {
  const blacklist = settingsStore.get('blacklist')
  return !!blacklist.find((b) => b.hostname === hostname)
}

function getHostname (fullUrl) {
  const url = new URL(fullUrl)
  return url.hostname
}

function resetAlarm () {
  const notifyMinutes = parseInt(settingsStore.get('minutes'))
  browser.alarms.clearAll()
  browser.alarms.create({ periodInMinutes: notifyMinutes })
}

async function getActiveTab () {
  const tabs = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (!tabs.length) {
    return {}
  }

  const tab = tabs[0]
  const hostname = getHostname(tab.url)

  let data = store.get(hostname)
  if (!data) {
    data = {
      hostname,
      lastActive: pastTime,
      lastFocus: pastTime
    }
  }

  return Object.assign(data, {
    lastActive: new Date(data.lastActive),
    lastFocus: new Date(data.lastFocus)
  })
}

async function updateTab () {
  let data = await getActiveTab()
  if (Object.keys(data).length === 0) {
    return
  }

  const notifyMinutes = parseInt(settingsStore.get('minutes'))
  const resetTime = milis(notifyMinutes / 5)

  if (isBlacklisted(data.hostname)) {
    // was away for a while
    if (
      new Date() - data.lastFocus > resetTime &&
      // hostname changed
      store.get('lastHostname') !== data.hostname
    ) {
      // update tab data
      resetAlarm()
      data = Object.assign(data, { lastActive: new Date() })
    }

    store.set(data.hostname, Object.assign(data, { lastFocus: new Date() }))
  }

  store.set('lastHostname', data.hostname)
}

async function checkTime () {
  const data = await getActiveTab()
  if (Object.keys(data).length === 0) {
    return
  }

  const diff = new Date() - data.lastActive
  const notifyRepeat = parseInt(settingsStore.get('repeat')) + 0.5
  const notifyMinutes = parseInt(settingsStore.get('minutes'))
  const notifyTime = milis(notifyMinutes)

  if (
    isBlacklisted(data.hostname) &&
    // stayed less or more than the allowed time
    diff > notifyTime &&
    diff < notifyTime * notifyRepeat
  ) {
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('images/nudgeti-128.png'),
      title: 'Nudgeti',
      message: `You spent more than ${humanTime(diff)} on ${data.hostname}.`
    })
  }
}

// update stored data on active tab
updateTab()

// update stored data when tab changes
browser.tabs.onHighlighted.addListener(updateTab)
browser.tabs.onUpdated.addListener(updateTab)

browser.alarms.onAlarm.addListener(checkTime)
