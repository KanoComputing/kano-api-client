'use strict';
import '../gun/gun.js'
const client = settings => {
  var initialStateLoggedInUser = localStorage.getItem("user")
  var initialStateUser = false
  if (initialStateLoggedInUser) {
    initialStateUser = initialStateLoggedInUser.username    
  }
  var stackOfXhr = {}
  // libraries
  var gun = Gun()
  // functions
  function ifArray(data) {
    if (typeof data === "object" && Object.keys(data).length && "012345678910".startsWith(Object.keys(data).join("").slice(0,-1))) { 
      return Object.keys(data).reduce((a,v) => {
        if (v !== "_" && v == +v ) {
          a.push(v)
        }
        return a
      },[]).map(value => {
        return data[value]
      })
    } else {
      return data
    }
  }
  function getter(query,params,sync){
    return new Promise((resolve, reject) => {
      var loggedInUser = JSON.parse(localStorage.getItem("user"))
      var queryRun = query 
      if (loggedInUser) {
        if ("user._accessToken" == query) { 
          resolve(loggedInUser._accessToken)
          return
        } else if (query === "user.username") {
          resolve(loggedInUser.username)
          return 
        } else if (query === "user._localToken") {
          resolve(loggedInUser._localToken)
          return
        } else if (query.startsWith("user.") || query == "user") {
          queryRun = query.replace("user", loggedInUser.mapTo)
        } 
      } else if (query.startsWith("user.")) {
        resolve(undefined)
        return
      }
      queryRun.split(".*")[0].split(".").reduce((db,val) => { // TODO use "gun load"  if ".*"
        return db.get(val)
      }, gun).once(data => {
        if (sync && data === undefined) { //
          if (query.startsWith("users.")) {
            var user = gun.get("users").get(loggedInUser.userHash)
            getDataFromServer("/users/me").then(serverRes => { 
              var serverData = JSON.parse(serverRes, (key, value) => {
                if (Array.isArray(value)) {
                  value = value.reduce((accumulator, currentValue, currentIndex) => {
                    accumulator[currentIndex] = currentValue
                    return accumulator
                  },{})
                }
                return value
              })
              Object.keys(serverData.data).map( key => {
                user.get(key.replace("_","")).put(serverData.data[key])
              })
            }).then( _ => {
              query.split(".").reduce((db,val) => {
                return db.get(val)
              }, gun).once( retry => {
                data = retry
              })
            }).then( _ => {
              resolve(ifArray(data))
            })
          } 
        } else {
          resolve(ifArray(data))
        }
      })
    })
  }
  function arraysToObject(valueToSet) {
    return JSON.parse(JSON.stringify(valueToSet, (_, value) => {
      if (Array.isArray(value)) {
        return value.reduce((accumulator, currentValue, currentIndex) => {
          return accumulator[currentIndex] = currentValue
        },{})
      }
      return value
    }))
  }
  function setter(query, valueToSet, params) {
    var loggedInUser = JSON.parse(localStorage.getItem("user"))
    if (loggedInUser) {
      if (query.startsWith("user.") || query == "user") {
        query = query.replace("user", loggedInUser.mapTo)
      }
    }

    valueToSet = arraysToObject(valueToSet)
    
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
      if (oldValue ==! undefined && JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        // add to postList
        if (settings.log){ console.log("needs sync", newValue) }
      } else {
        if (settings.log){ console.log("In sync", newValue) }
      }
    }).then( _ => {
      return newValue
    })
  }
  function onIdle(itime, doAfter) {
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
  
  function getDataFromServer(path) {
    return new Promise((resolve, reject) => {
      if (stackOfXhr[path]) {
        stackOfXhr[path].push(resolve)
      } else {
        stackOfXhr[path]=[resolve]
        if (!navigator.onLine) {
          reject("offline")
        }
        getter("user._accessToken").then(accessToken => {
          var xhr = new XMLHttpRequest()
          if (accessToken) {
            xhr.withCredentials = true
          }
          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4 && this.status < 300) {
              if (this.responseText) {
                var responseText = this.responseText
                stackOfXhr[path].forEach(function(resolved) {
                  resolved(responseText)
                })
                delete(stackOfXhr[path])
              } else {
                reject("No Response")
              }
            }
          })
          xhr.open("GET", settings.worldUrl + path)
          xhr.setRequestHeader("content-type", "application/json")
          xhr.setRequestHeader("accept", "application/json")
          if (accessToken) {
            xhr.setRequestHeader("authorization", "Bearer "+accessToken)
          }
          if (settings.log){ console.log("get", path ) }
          xhr.send({})
        })
      }
    })
  }
  function renewToken() {
    var user = JSON.parse(localStorage.getItem("user"))
    if (user && user.renew < Date.now() && user._accessToken) {
      getDataFromServer("/accounts/auth/refresh").then(res => {

        if (settings.log){ console.log(res) }
        // duration 
        // user
        if (JSON.parse(res).data && JSON.parse(res).data.token) {
          var token = JSON.parse(res).data.token
          var duration = JSON.parse(res).data.duration
          var renew = Date.now() + (duration / 2 * 1000)

          localStorage.setItem('user', JSON.stringify({
            mapTo: "users." + user.username,
            username: user.username,
            _localToken: user.localToken, // to encrypt with when logged out
            _accessToken: token, // to access server 
            userHash: userHash,
            renew: renew,
          }))
        }
      })
    }
  }
  function poster(payload, path, accessToken) {
    return new Promise((resolve, reject) => {
      if (!navigator.onLine) {
        reject("offline")
      }
      var xhr = new XMLHttpRequest()

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.responseText && this.status < 300) {
            onIdle(1000, 10).then(renewToken)
            resolve(this.responseText)
          } else {
            reject(this.statusText, this.status)
          }
        }
      })

      xhr.open("POST", settings.worldUrl + path)

      xhr.setRequestHeader('Accept', 'application/json')
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader("cache-control", "no-cache")
      if (accessToken) {
        xhr.setRequestHeader("authorization", "Bearer "+accessToken)
      }
      xhr.send(JSON.stringify( payload ))
    })
  }
  function sha256 (str) {
  // We transform the string into an arraybuffer.
    var buffer = new TextEncoder('utf-8').encode(str)
    return crypto.subtle.digest('SHA-256', buffer).then(function (hash) {
      return hash
    })
  }
  function ab2str (buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf))
  }
  function str2ab (str) {
    var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
    var bufView = new Uint16Array(buf)
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  }
  function arrayToBase64String (ab) {
    var dView = new Uint8Array(ab)   // Get a byte view
    var arr = Array.prototype.slice.call(dView) // Create a normal array
    var arr1 = arr.map(function (item) {
      return String.fromCharCode(item)    // Convert
    })
    return window.btoa(arr1.join(''))  // Form a string
  }
  function base64ToArrayBuffer (s) {
    var asciiString = window.atob(s)
    return new Uint8Array([...asciiString].map(char => char.charCodeAt(0)))
  }
  function keyFromLocalToken(localToken) {
    return window.crypto.subtle.importKey( "jwk", { kty: "oct", k: localToken, alg: "A256CBC", ext: true, },{ name: "AES-CBC", },false, ["encrypt", "decrypt"])
  }
  function encryptString (localToken, data) {
    return keyFromLocalToken(localToken).then(key => {
      var iv = window.crypto.getRandomValues(new Uint8Array(16))
      return window.crypto.subtle.encrypt(
        {
          name: "AES-CBC",
          iv: iv,
        },key, str2ab("12345678"+data) // add 8 chr due to droppinginitial vector 
      )
    }).then(encrypted => {
      return ab2str(encrypted)
    })
  }
  function decryptString (localToken, data) {
    return keyFromLocalToken(localToken).then(key => {
      return window.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv: window.crypto.getRandomValues(new Uint8Array(16)) // iv, //The initialization vector you used to encrypt
        },
        key, //from generateKey or importKey above
        str2ab(data),
      )
    }).then(decrypted => {
      return ab2str(decrypted).slice(8)
    })
  }
  function makeLocalToken(username, password) {
    return sha256(username + password).then(localhash => {
      return crypto.subtle.importKey("raw", localhash, {name: "AES-CBC"}, true, ["encrypt", "decrypt"])
    }).then( key => {
      return sha256(username).then(userSHA => {
        var data = localStorage.getItem(arrayToBase64String(userSHA))
        localStorage.removeItem(arrayToBase64String(userSHA))
        if (data) {
          window.crypto.subtle.decrypt(
            {
              name: "AES-CBC",
              iv: window.crypto.getRandomValues(new Uint8Array(16)) // iv, //The initialization vector you used to encrypt
            },
            key, //from generateKey or importKey above
            str2ab(data) //ArrayBuffer of the data
          ).then(decrypted => {
            //TODO put ES-CBC
            //as no initial Factor I need to chop off the first 8 characters
            localStorage.setItem('user', ab2str(decrypted).slice(8))
          }).catch(err => {
            console.error(err)
          })
        }
        return key
      }).then( key => {
        // if encrypted data decrypt it
        return crypto.subtle.exportKey("jwk",key)
      }).then(keydata => {
        //returns the exported key data
        return keydata.k // save the hard bit
      }) 
    })
  }
  if (settings && settings.worldUrl) {
    const API = {
      isLoggedIn: initialStateUser,
      create: args => {
        var loggedInUser = localStorage.getItem("user")
        if (args.params.user && !loggedInUser) {
          if (args.params.user.username && args.params.user.password && args.params.user.email) {
            if (!args.params.user.erole) {args.params.user.erole = "notset"}
          //  if (!args.params.user.epurpose) {args.params.user.epurpose = "notset"}
            return poster(args.params.user,"/accounts").then(res => {
              if (settings.log){ console.log(res) }
              // duration 
              // user
              if (JSON.parse(res).data && JSON.parse(res).data.token) {
                var token = JSON.parse(res).data.token
                var duration = JSON.parse(res).data.duration
                var renew = Date.now() + (duration / 2 * 1000)
                var user = JSON.parse(res).data.user

                API.isLoggedIn = args.params.user.username

                return makeLocalToken(args.params.user.username, args.params.user.password).then( localToken => { 
                  return sha256(args.params.user.username).then( userHash => {
                    userHash = arrayToBase64String(userHash)
                    return localStorage.setItem('user', JSON.stringify({
                      mapTo: "users." + args.params.user.username,
                      username: args.params.user.username,
                      _localToken: localToken, // to encrypt with when logged out
                      _accessToken: token, // to access server 
                      userHash: userHash,
                      renew: renew,
                    }))
                  })
                }).then(_ => {
                  args.params = { 
                    user: user 
                  } 
                  return API.update(args)
                })
              } else {
                throw res
              }
            }).catch(err => {
              console.error("error create user", err)
            })
          }
        }
      },
      read: args => {
        if (args.populate) {
          var allThePromises = []
          var allThePromisesKeys = []
          var bulid = JSON.parse(JSON.stringify(args.populate),(_, value) => {
            if (typeof value === 'string' && /[_a-z\-\.]*/i.test(value)) {
              if (settings.resolve) {
                allThePromisesKeys.push(value)
                allThePromises.push(getter(value, args.params, args.sync) )
                return value
              }
              return getter(value, args.params, args.sync)
            } else {
              return value
            }
          })
          if (settings.resolve) {
            return Promise.all(allThePromises).then((values) => {
              var i = values.length - 1
              return JSON.parse(JSON.stringify(args.populate),(_, value) => {
                if (typeof value === 'string' && /[_a-z\-\.]*/i.test(value)) {
                  return values[allThePromisesKeys.indexOf(value)]
                } else {
                  return value
                }
              })
            })
          } else {
            return bulid
          }
        } else {
          return {}
        }
      },
      update: args => {
        Object.keys(args.params).forEach(key => {
          setter(key, args.params[key])
        })
        return API.read(Object.assign({sync: true}, args))
      },
      delete: args => {
        // TODO map value to Null
        return API.update(JSON.parse(JSON.stringify(args.params), _ => {
          return null
        }))
      },
      getUser: args => {
        //TODO test if update okay
        return API.read({params:{user: args.params}, populate: args.populate})
      },
      login: args => {
        if (!args.params) {
          throw "need params e.g. API.login({params: {username: 'marcus7777', password: 'monkey123'}})"
        }
        if (!args.params.username) {
          throw "need a username e.g. {username: 'marcus7777', password: 'monkey123'}"
        }
        args.params.username = args.params.username.toLowerCase()
        
        // are you login already?
        return API.read({populate: {username: "user.username", _localToken: "user._localToken", _accessToken: "user._accessToken" }, sync: false}).then(async user => {
          if (!user) {
            if (settings.log){ console.error("error got user") }
          }
          if (await user.username === undefined) {
            if (!args.params.password) {
              throw "need a password e.g. {username: 'marcus7777', password: 'monkey123'}"
            }
            return makeLocalToken(await user.username, await user.password).then( localToken => {
              return poster(args.params,"/accounts/auth").then(res => {
                var token = JSON.parse(res).data.token
                var duration = JSON.parse(res).data.duration
                var renew = Date.now() + (duration / 2 * 1000)
                
                API.isLoggedIn = args.params.username

                sha256(args.params.username).then( userHash => {
                  userHash = arrayToBase64String(userHash)
                  localStorage.setItem('user',JSON.stringify({
                    mapTo: "users." + args.params.username, 
                    username: args.params.username, 
                    _localToken: localToken, // to encrypt with when logged out
                    _accessToken: token, // to access server 
                    userHash: userHash,
                    renew: renew,
                  }))
                })
                return API.read({populate:args.populate})
              })
            }).catch( err => {
              if (err === "offline") {
                return API.read(args)
              }
              throw err
              console.error(err)
            })
          // TODO  if logged in as something else
          } else if (await user.username === args.params.username){
            if (settings.log){ console.log("you are (and were) logged in :)" ) }
          } else if (await user.username !== args.params.username){
            API.logout()
            API.login(args)
          }
          return API.read(Object.assign({sync: true}, args))
        })
      },
      logout: args => {
        getter("user._localToken").then(localToken => {
          if (localToken) {
            encryptString(localToken,localStorage.getItem("user")).then(encrypted => {
              sha256(user.username).then(userSHA => { 
                localStorage.setItem(arrayToBase64String(userSHA), ab2str(encrypted))
                localStorage.removeItem('user')
              })
              API.isLoggedIn = false
            }).catch(function(err){
              console.error(err)
            })
          }
        }).catch(err => {
          console.error(err)
        })
      }
    }
    return API
  } else {
    console.error("Need a worldUrl")
  }
}
export default client
