/* globals self */
/* globals chrome */
/*
 * basic webextension api polyfill
 *
 */

function promisify (api, method) {
  return (params) => {
    return new Promise((resolve, reject) => {
      api[method](params, (res) => {
        if (chrome && chrome.runtime && chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }

        resolve(res)
      })
    })
  }
}

if (typeof self.browser === 'undefined') {
  self.browser = {
    storage: {
      sync: {
        get: promisify(chrome.storage.sync, 'get'),
        set: promisify(chrome.storage.sync, 'set')
      },
      session: {
        get: promisify(chrome.storage.sync, 'get'),
        set: promisify(chrome.storage.sync, 'set')
      },
      onChanged: chrome.storage.onChanged
    },
    tabs: {
      query: promisify(chrome.tabs, 'query'),
      onHighlighted: chrome.tabs.onHighlighted,
      onUpdated: chrome.tabs.onUpdated
    },
    alarms: chrome.alarms,
    notifications: chrome.notifications,
    runtime: chrome.runtime
  }
}
