function Store (name, data = {}) {
  var events = []
  var clone = (obj) => JSON.parse(JSON.stringify(obj))

  this.trigger = () => {
     events.slice().forEach(event => {
       return event()
     })
  }

  this.saveInStorage = () => {
    var saved = {}
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
    var updateFromStorage = () => {
      return browser.storage.sync.get(name).then((res = {}) => {
        var storeData = res[name]
        if (!storeData || JSON.stringify(data) === JSON.stringify(storeData)) {
          return
        }

        data = storeData
        this.trigger()
        return
      })
    }

    // populate on load
    updateFromStorage()

    // two-way communication
    browser.storage.onChanged.addListener(updateFromStorage)
  }
}

