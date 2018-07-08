const defaults = {
  minutes: ['2', '5', '10', '20', '30'].map((n) => {
    return { label: `${n} minutes`, value: n }
  }),
  repeat: [
    { label: '1 time', value: '1' },
    { label: '2 times', value: '2' },
    { label: '5 times', value: '5' },
    { label: 'Indefinitely', value: '9999' }
  ],
  sound: [
    { label: '0%', value: '0' },
    { label: '25%', value: '25' },
    { label: '50%', value: '50' },
    { label: '75%', value: '75' },
    { label: '100%', value: '100' },
  ]
}

class SettingsSelect extends HTMLElement {
  constructor() {
    super()
    this.oldValue = 0

    this.options = defaults[this.setting]
  }

  get label() {
    return this.getAttribute('label')
  }

  get setting() {
    return this.getAttribute('setting')
  }

  get value() {
    return settingsStore.get(this.setting)
  }

  change(e) {
    var value = e.target.value
    this.oldValue = value
    settingsStore.set(this.setting, value)
  }

  render() {
    this.innerHTML = `
      <form>
        <label>
          ${this.label}
          <select>
            ${this.options.map((o) => `
              <option value="${o.value}" ${this.value === o.value ? 'selected' : ''}>
                ${o.label}
              </option>
            `).join('')}
          </select>
      </form>
    `
  }

  connectedCallback() {
    this.render()
    settingsStore.change(() => {
      if (this.oldValue !== this.value) {
        this.render()
      }

      this.oldValue = this.value
    })

    this.addEventListener('change', this.change)
  }
}
customElements.define('settings-select', SettingsSelect)
