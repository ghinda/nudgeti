/*
 * basic webextension api polyfill
 *
 */

function promisify(api) {
  return (params) => {
    return new Promise((resolve, reject) => {
      api(params, (res) => resolve(res))
    })
  }
}

if (typeof browser === 'undefined') {
  var browser = chrome
  browser.tabs.query = promisify(chrome.tabs.query)
  browser.storage.sync.get = promisify(chrome.storage.sync.get)
  browser.storage.sync.set = promisify(chrome.storage.sync.set)
}
