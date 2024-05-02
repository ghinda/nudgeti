/* globals self, browser */
self.Store = function (name, data = {}, persistent = true) {
  const events = []
  const clone = (obj) => JSON.parse(JSON.stringify(obj))

  this.trigger = () => {
    events.slice().forEach(event => {
      return event()
    })
  }

  this.saveInStorage = () => {
    const saved = {}
    saved[name] = data
    browser.storage.sync.set(saved)
  }

  this.change = (func) => {
    events.push(func)
  }

  this.get = (key) => {
    if (!data[key]) {
      return undefined
    }

    return clone(data[key])
  }

  this.set = (key, value) => {
    data[key] = clone(value)
    this.trigger()

    if (name) {
      this.saveInStorage()
    }

    return this.get(key)
  }

  if (name) {
    const storageType = persistent ? 'sync' : 'session'
    const updateFromStorage = () => {
      return browser.storage[storageType].get(name).then((res = {}) => {
        const storeData = res[name]
        if (!storeData || JSON.stringify(data) === JSON.stringify(storeData)) {
          return
        }

        data = storeData
        this.trigger()
      })
    }

    // populate on load
    updateFromStorage()

    // two-way communication
    browser.storage.onChanged.addListener(updateFromStorage)
  }
}
