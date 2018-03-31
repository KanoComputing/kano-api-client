if (!window.Kano) {
  !window.Kano = {}
}
window.Kano.APICommunication = settings => {
  // functions
  const onIdle = (itime, failAfter) => {
    return new Promise((resolve, reject) => {
      var trys = 0
      var onIdleTest = _ => {
        var t = performance.now()
        setTimeout( _ => { 
          if (failAfter && trys++ > failAfter) {
            reject()
          }
          if (Math.round(performance.now() - t) === Math.round(itime)) {
            resolve()
          } else {
            onIdleTest()
          }
        }, itime)
      }
      onIdleTest()
    })
  }
  const gun = Gun()

  const getter = query => {
    return new Promise((resolve, reject) => {
      query.split(".").reduce((db,val) => {
        return db.get(val)
      }, gun).val(data => {
        if (data === undefined) { 
debugger
          // fetch data
          data = "demo data not fetched : " + query
          // save all data returned
          query.split(".").reduce((db,val) => {
            return db.get(val)
          }, gun).put(data)
        }
        // if (time to update) {  
        
        // }
        resolve(data)
      })
    })
  }
  const setter = (query, valueToSet) => {
    var oldValue
    var newValue
    return getter(query).then(data => {
      oldValue = data
    }).then( _ => {
      return query.split(".").reduce((db,val) => {
        return db.get(val)
      }, gun).put(valueToSet)
    }).then( _ => {
      return getter(query).then(data => {
        newValue = data
      })
    }).then( _ => {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        // add to postList
        console.log("push to server", newValue)
      } else {
        console.log("Do not push", newValue)
      }
    }).then( _ => {
      return newValue
    })
  }
  if (settings && settings.worldUrl) {
    return {
      create: args => {
        return this.update(args)
      },
      read:    _ => {},
      update:  _ => {},
      delete: args => {
        // TODO map value to Null
        return this.update(args)
      },
      getUser: args => (
        return this.read(args)
      },
    }
  } else {
    console.error("Need a worldUrl")
  }
}
