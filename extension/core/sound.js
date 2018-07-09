function playSound(volume) {
  if (volume === 0) {
    return
  }

  var sound = new Audio(browser.extension.getURL('sounds/sound.wav'))
  sound.volume = volume
  sound.play()
}
