window.Kano.APICommunication = settings => {
  if (settings && settings.worldUrl) {
    return {
      create:  _ => {},
      read:    _ => {},
      update:  _ => {},
      delete:  _ => {},
      getUser: return args => (
        return this.read(args)
      },
    }
  } else {
    console.error("Need a worldUrl")
  }
}
