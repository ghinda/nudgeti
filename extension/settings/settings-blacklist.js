class BlacklistItem extends HTMLElement {
  get id() {
    return this.getAttribute('id')
  }

  get blacklist() {
    return settingsStore.get('blacklist')
  }

  get hostname() {
    return this.blacklist.find((b) => b.id === this.id).hostname
  }

  get index() {
    return this.blacklist.findIndex((b) => b.id === this.id)
  }

  change(e) {
    var hostname = e.target.value
    if (!!~this.index) {
      var blacklist = this.blacklist
      blacklist[this.index].hostname = hostname
      settingsStore.set('blacklist', blacklist)
    }
  }

  remove() {
    if (!!~this.index) {
      var blacklist = this.blacklist
      blacklist.splice(this.index, 1)
      settingsStore.set('blacklist', blacklist)
    }
  }

  connectedCallback() {
    this.innerHTML = `
      <input type="text" value="${this.hostname}">
      <button type="button" class="js-remove-site btn">
        Remove
      </button>
    `

    this.addEventListener('input', this.change)
    this.querySelector('.js-remove-site').addEventListener('click', () => this.remove())
  }
}
customElements.define('blacklist-item', BlacklistItem)

class SettingsBlacklist extends HTMLElement {
  constructor() {
    super()
    this.oldBlacklist = []
  }

  get blacklist() {
    return settingsStore.get('blacklist')
  }

  add() {
    var blacklist = this.blacklist
    blacklist.push({id: String(Date.now()), hostname: ''})
    settingsStore.set('blacklist', blacklist)
  }

  mount() {
    this.querySelector('.js-add-site').addEventListener('click', () => this.add())
  }

  render () {
    this.innerHTML = `
      ${this.blacklist.map(item => `<blacklist-item id="${item.id}"></blacklist-item>`).join('')}

      <div class="blacklist-actions">
        <p class="info">
          Site must match hostname.
          <br>
          (eg. for <strong>https://www.facebook.com/eff</strong> use <code>www.facebook.com</code>).
        </p>

        <button type="button" class="js-add-site btn btn-primary">
          Add New Site
        </button>
      </div>
    `

    this.mount()
  }

  connectedCallback() {
    this.render()

    settingsStore.change(() => {
      if (this.blacklist.length !== this.oldBlacklist.length) {
        this.render()
      }

      this.oldBlacklist = this.blacklist
    })
  }
}
customElements.define('settings-blacklist', SettingsBlacklist)

