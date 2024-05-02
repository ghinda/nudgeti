/* briskine popup
*/

(function () {
  'use strict'

  const hideClass = 'briskine-popup-hide'
  const $popup = document.createElement('div')
  $popup.className = `briskine-popup ${hideClass}`
  const template = `
    <button type="button" title="Close" class="briskine-close js-briskine-close">x</button>

    <p>
      Handling email and chat support for your business?
    </p>

    <a href="https://www.briskine.com/" target="_blank">
      Try out Briskine!
    </a>
  `
  $popup.innerHTML = template

  const $link = document.createElement('link')
  $link.href = '/briskine/briskine.css'
  $link.rel = 'stylesheet'
  $link.onload = () => {
    document.body.appendChild($popup)
  }

  document.head.appendChild($link)

  const storageKey = 'briskine-popup'
  let closedTime = null
  const expiry = 1000 * 60 * 60 * 24

  function timeAgo (dateString) {
    if (!dateString) {
      return true
    }

    const difference = Date.now() - parseInt(dateString, 10)
    return difference > expiry
  }

  function hidePopup () {
    $popup.classList.add(hideClass)
    window.localStorage.setItem(storageKey, String(Date.now()))
  }

  const $closeBtn = $popup.querySelector('.js-briskine-close')
  $closeBtn.addEventListener('click', hidePopup)

  function showPopup () {
    closedTime = window.localStorage.getItem(storageKey)
    if (timeAgo(closedTime)) {
      $popup.classList.remove(hideClass)
    }
  }

  setTimeout(function () {
    showPopup()
  }, 2000)
})()
