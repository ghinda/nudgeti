var settingsStore = new Store('settings', {
  minutes: '2',
  blacklist: [
    {id: '1', hostname: 'www.facebook.com'},
    {id: '2', hostname: 'www.messenger.com'},
    {id: '3', hostname: 'www.twitter.com'},
    {id: '4', hostname: 'www.reddit.com'},
    {id: '5', hostname: 'www.youtube.com'},
    {id: '6', hostname: 'www.instagram.com'},
    {id: '7', hostname: 'www.tumblr.com'},
    {id: '8', hostname: 'www.pinterest.com'},
    {id: '9', hostname: 'news.ycombinator.com'},
  ]
})
