function importObject(name) {
  return uniCloud.importObject(name, {
    customUI: true
  })
}

const cloudApi = {
  user: () => importObject("aicount-user"),
  book: () => importObject("aicount-book"),
  event: () => importObject("aicount-event"),
  ai: () => importObject("aicount-ai"),
  payment: () => importObject("aicount-payment"),
  message: () => importObject("aicount-message"),
  feedback: () => importObject("aicount-feedback"),
  setup: () => importObject("aicount-setup")
}

module.exports = cloudApi
