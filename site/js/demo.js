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


function checkPermission () {
  if (Notification.permission === 'granted') {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    Notification.requestPermission((permission) => {
      if (permission === 'granted') {
        return resolve()
      }
      reject()
    })
  })
}

var startTime = new Date()

function showNotification () {
  checkPermission()
  .then(() => {
    var diff = new Date() - startTime

    new Notification('Nudgeti', {
      icon: '/images/nudgeti-48.png',
      body: `You spent more than ${humanTime(diff)} on www.nudgeti.com.`,
    })
  })
  .catch((err) => {
    alert('You need to allow nudgeti.com to send notifications, for the demo to work.')
  })
}

document.querySelector('.js-demo').addEventListener('click', showNotification)
