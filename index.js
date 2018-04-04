if (!window) {
  var window = {}
  var Gun = require('gun'); // in NodeJS
} else {
  var script = document.createElement("script"); // Make a script DOM node
  script.src = "./node_modules/gun/gun.js"
  document.head.appendChild(script)
}
if (!window.Kano) {
  window.Kano = {}
}
window.Kano.APICommunication = settings => {
  // libraries
  const gun = Gun()
  // functions
  const getter = (query,params) => {
    return new Promise((resolve, reject) => {
      query.split(".").reduce((db,val) => {
        return db.get(val)
      }, gun).once(data => {
        if (data === undefined) { 
debugger
          // fetch data
          data = "demo data iFAKE not fetched:" + query
          // Make starterKit.json
          // TODO interface with the API
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
  const setter = (query, valueToSet, params) => {
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
        console.log("In sync", newValue)
      }
    }).then( _ => {
      return newValue
    })
  }
  const onIdle = (itime, doAfter) => {
    return new Promise((resolve, reject) => {
      var trys = 0
      const onIdleTest = _ => {
        const t = performance.now()
        setTimeout( _ => { 
          if (doAfter && trys++ > doAfter) {
            resolve()
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
  const poster = (payload, path) => {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.responseText) {
            resolve(this.responseText)
          } else {
            reject()
          }
        }
      })

      xhr.open("POST", settings.worldUrl + path)

      xhr.setRequestHeader('Accept', 'application/json')
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader("cache-control", "no-cache")
      
      xhr.send(JSON.stringify( payload ))
    })
  }

  if (settings && settings.worldUrl) {
    const API = {
      create: args => {
        return API.update(args)
      },
      read: args => {
        if (args.populate) {
          return new Promise((resolve, reject) => {
            return resolve(JSON.parse(JSON.stringify(args.populate), async (_, value) => {
              if (typeof value === 'string' && /[a-z\-\.]*/i.test(value)) {
                if (settings.resolve) {
                  return await getter(value, args.params)
                } else {
                  return getter(value, args.params)
                }
              } else {
                return value
              }
            }))
          })
        } else {
          return {}
        }
      },
      update: args => {
        Object.keys(args.params).forEach(key => {
          setter(key, args.params[key])
        })
        return API.read(args)
      },
      delete: args => {
        // TODO map value to Null
        return API.update(args)
      },
      getUser: args => {
        //TODO test if update okay
        return API.read({params:{user: args.params}, populate: args.populate})
      },
      login: args => {
        return poster(args.params,"/auth/login").then( res => {
          console.log(res)
          if (JSON.parse(res).data && JSON.parse(res).data.token) {
            return API.update({populate:args.populate, params: JSON.parse(atob(JSON.parse(res).data.token.split(".")[1]))})
          }
        }).catch(err => {
          console.error("error login in :", err)
        })
      },
    }
    return API
  } else {
    console.error("Need a worldUrl")
  }
}
