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
  var gun = Gun()
  // functions
  function getter(query,params,sync){
    return new Promise((resolve, reject) => {
      query.split(".").reduce((db,val) => {
        return db.get(val)
      }, gun).once(data => {
        if (data === undefined) {
          if (query.startsWith("user.")) {
            var user = gun.get("user")
            getDataFromServer("/users/me").then(serverRes => { 
              serverData = JSON.parse(serverRes, (key, value) => {
                if (Array.isArray(value)) {
                  value = value.reduce((accumulator, currentValue, currentIndex) => {
                  accumulator[currentIndex] = currentValue
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
              resolve(data)
            })
          } 
        } else {
          resolve(data)
        }
      })
    })
  }
  function setter(query, valueToSet, params) {
    if (Array.isArray(valueToSet)) {
      valueToSet = valueToSet.reduce((accumulator, currentValue, currentIndex) => {
        accumulator[currentIndex] = currentValue
      },{})
    }
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
        console.log("needs sync", newValue)
      } else {
        console.log("In sync", newValue)
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
      if (!navigator.onLine) {
        reject("offline")
      }
      getter("user._accessToken").then(accessToken => {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true

        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText) {
              resolve(this.responseText)
            } else {
              reject("No Response")
            }
          }
        })
        xhr.open("GET", settings.worldUrl + path)
        xhr.setRequestHeader("content-type", "application/json")
        xhr.setRequestHeader("accept", "application/json")
        xhr.setRequestHeader("authorization", "Bearer "+accessToken)
        xhr.send({})
      })
    })
  }
  function poster(payload, path) {
    return new Promise((resolve, reject) => {
      if (!navigator.onLine) {
        reject("offline")
      }
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
  if (settings && settings.worldUrl) {
    const API = {
      create: args => {
        return API.update(args)
      },
      read: args => {
        if (args.populate) {
          return new Promise((resolve, reject) => {
            return resolve(JSON.parse(JSON.stringify(args.populate), async (_, value) => {
              if (typeof value === 'string' && /[_a-z\-\.]*/i.test(value)) {
                if (settings.resolve) {
                  return await getter(value, args.params, args.sync)
                } else {
                  return getter(value, args.params, args.sync)
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
        if (!args.params) {
          throw "need params e.g. API.login({params: {username: 'marcus7777', password: 'monkey123'}})"
        }
        if (!args.params.username) {
          throw "need a username e.g. {username: 'marcus7777', password: 'monkey123'}"
        }
        
        // are you login already?
        return API.read({populate: {username: "user.username", _localhash: "user._localhash", _accessToken: "user._accessToken" }, sync: false}).then(user => {
          console.log(user)
        })

        args.params.username = args.params.username.toLowerCase()
        return sha256(JSON.stringify(args.params)).then(localhash => {
          crypto.subtle.importKey("raw", localhash, {name: "AES-CBC"}, true, ["encrypt", "decrypt"]).then(function(key){
            sha256(args.params.username).then(userSHA => {
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
                ).then(function(decrypted){
                  localStorage.setItem('gun/','{"'+ ab2str(decrypted).split('{"').slice(1).join('{"'))
                }).catch(function(err){
                  console.error(err)
                })
              }
            })
            // if encrypted data decrypt it
            return crypto.subtle.exportKey("jwk",key).then(function(keydata){
              //returns the exported key data
              return keydata.k // save the hard bit
            })
          }).then( localToken => {
            // else if
            return poster(args.params,"/auth/login").then( res => {
              var token = JSON.parse(res).data.token
              return API.update({populate:args.populate, params: {
                user: {
                  _accessToken: token, // to access server
                  username: args.params.username,
                  _localToken: localToken, // to encrypt with when logged out
                }
              }})
            }).catch( err => {
              if (err === "offline") {
                return API.read(args)
              }
            })
          })
        }).catch(err => {
          console.error("error login in :", err)
        })
      },
      logout: args => {
        getter("user").then(async user => {
          var localToken = await user._localToken
          if (localToken) {
            window.crypto.subtle.importKey(
              "jwk", {  
                kty: "oct",
                k: localToken,
                alg: "A256CBC",
                ext: true,
              },{ 
                name: "AES-CBC",
              },false, ["encrypt", "decrypt"]
            ).then(key => {
              var iv = window.crypto.getRandomValues(new Uint8Array(16))
              window.crypto.subtle.encrypt(
                {
                  name: "AES-CBC",
                  iv: iv,
                },key, str2ab(localStorage.getItem("gun/")) // TODO get all data and clear
              ).then(encrypted => {
                sha256(user.username).then(userSHA => { 
                  localStorage.setItem(arrayToBase64String(userSHA), ab2str(encrypted))
                  localStorage.removeItem('gun/')
                })
              }).catch(function(err){
                console.error(err)
              })
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
