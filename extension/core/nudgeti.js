/*
 * Nudgeti
 *
 */

function noop () {
  return
}

function humanTime (milis = 1000) {
  var seconds = Math.floor(milis / 1000)
  if (seconds < 60) {
    return `${seconds} seconds`
  }

  var minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minutes`
  }

  var hours = Math.floor(minutes / 60)
  return `${hours} hours`
}

function milis (minutes) {
  return minutes * 60 * 1000
}

var alarmKey = 'nudgeti'
var lastHostname = ''
var store = new Store()

var notifyMinutes = 0
var notifyRepeat = 2.5
var notifySound = 0
var blacklist = []
var resetTime = 0
var notifyTime = 0
var pastTime = '1958-01-15'

function updateSettings () {
  notifyMinutes = parseInt(settingsStore.get('minutes'))
  notifyRepeat = parseInt(settingsStore.get('repeat')) + 0.5
  blacklist = settingsStore.get('blacklist')
  resetTime = milis(notifyMinutes / 5)
  notifyTime = milis(notifyMinutes)
  notifySound = parseFloat(settingsStore.get('sound'))

  resetAlarm()
}

updateSettings()
settingsStore.change(updateSettings)

function isBlacklisted (hostname) {
  return !!blacklist.find((b) => b.hostname === hostname)
}

function getHostname (fullUrl) {
  var url = new URL(fullUrl)
  return url.hostname
}

function resetAlarm () {
  browser.alarms.clearAll()
  browser.alarms.create({periodInMinutes: notifyMinutes})
}

function getActiveTab () {
  return browser.tabs.query({
    active: true,
    currentWindow: true
  }).then((res) => {
    if (!res.length) {
      // probably in devtools,
      // get from all windows.
      return browser.tabs.query({active: true})
    }

    return res
  }).then((res) => {
    if (!res.length) {
      return Promise.reject()
    }

    var tab = res[0]
    var hostname = getHostname(tab.url)

    var data = store.get(hostname)
    if (!data) {
      data = {
        hostname: hostname,
        lastActive: pastTime,
        lastFocus: pastTime
      }
    }

    return Object.assign(data, {
      lastActive: new Date(data.lastActive),
      lastFocus: new Date(data.lastFocus)
    })
  })
}

function updateTab () {
  return getActiveTab()
    .then((data) => {
      if (isBlacklisted(data.hostname)) {
        // was away for a while
        if (
          new Date() - data.lastFocus > resetTime
          // hostname changed
          && lastHostname !== data.hostname
        ) {
          // update tab data
          resetAlarm()
          data = Object.assign(data, {lastActive: new Date()})
        }

        store.set(data.hostname, Object.assign(data, {lastFocus: new Date()}))
      }

      lastHostname = data.hostname
    })
    .catch(noop)
}

function checkTime () {
  getActiveTab()
  .then((data) => {
    var diff = new Date() - data.lastActive

    if (
      isBlacklisted(data.hostname)
      // stayed less or more than the allowed time
      && diff > notifyTime
      && diff < notifyTime * notifyRepeat
    ) {
      browser.notifications.create({
        type: 'basic',
        iconUrl: browser.extension.getURL('images/nudgeti-128.png'),
        title: 'Nudgeti',
        message: `You spent more than ${humanTime(diff)} on ${data.hostname}.`,
      })

      playSound(notifySound)
    }
  })
  .catch(noop)
}

function init () {
  // update stored data on active tab
  updateTab()

  // update stored data when tab changes
  browser.tabs.onHighlighted.addListener(updateTab)
  browser.tabs.onUpdated.addListener(updateTab)

  browser.alarms.onAlarm.addListener(checkTime)
}

init()
