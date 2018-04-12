(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Kano = global.Kano || {}, global.Kano.ApiCommunicationLib = factory());
}(this, (function () { 'use strict';

  var kanoApiCommunicationLib = settings => {
    var stackOfXhr = {}; 
    // libraries
    var gun = Gun();
    // functions
    function getter(query,params,sync){
      return new Promise((resolve, reject) => {
        query.split(".").reduce((db,val) => {
          return db.get(val)
        }, gun).once(data => {
          if (sync && data === undefined) { //
            if (query.startsWith("user.")) {
              var user = gun.get("user");
              getDataFromServer("/users/me").then(serverRes => { 
                serverData = JSON.parse(serverRes, (key, value) => {
                  if (Array.isArray(value)) {
                     value = value.reduce((accumulator, currentValue, currentIndex) => {
                     return accumulator["Array_"+currentIndex] = currentValue
                   },{});
                  }
                  return value
                });
                Object.keys(serverData.data).map( key => {
                  user.get(key.replace("_","")).put(serverData.data[key]);
                });
              }).then( _ => {
                query.split(".").reduce((db,val) => {
                  return db.get(val)
                }, gun).once( retry => {
                  data = retry;
                });
              }).then( _ => {
                resolve(data);
              });
            } 
          } else {
            resolve(data);
          }
        });
      })
    }
    function setter(query, valueToSet, params) {
      if (Array.isArray(valueToSet)) {
        valueToSet = valueToSet.reduce((accumulator, currentValue, currentIndex) => {
          return accumulator["Array_" + currentIndex] = currentValue
        },{});
      }
      var oldValue;
      var newValue;
      return getter(query).then(data => {
        oldValue = data;
      }).then( _ => {
        return query.split(".").reduce((db,val) => {
          return db.get(val)
        }, gun).put(valueToSet)
      }).then( _ => {
        return getter(query).then(data => {
          newValue = data;
        })
      }).then( _ => {
        if (oldValue ==! undefined && JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          // add to postList
          console.log("needs sync", newValue);
        } else {
          console.log("In sync", newValue);
        }
      }).then( _ => {
        return newValue
      })
    }
    
    function getDataFromServer(path) {
      return new Promise((resolve, reject) => {
        if (stackOfXhr[path]) {
          stackOfXhr[path].push(resolve);
        } else {
          stackOfXhr[path]=[resolve];
          if (!navigator.onLine) {
            reject("offline");
          }
          getter("user._accessToken").then(accessToken => {
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
   
            xhr.addEventListener("readystatechange", function () {
              if (this.readyState === 4) {
                if (this.responseText) {
  		var responseText = this.responseText;
                  stackOfXhr[path].forEach(function(resolved) {
                    resolved(responseText);
                  });
                  delete(stackOfXhr[path]);
                } else {
                  reject("No Response");
                }
              }
            });
            xhr.open("GET", settings.worldUrl + path);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("accept", "application/json");
            xhr.setRequestHeader("authorization", "Bearer "+accessToken);
            if (settings.log){ console.log("get", path ); }
            xhr.send({});
          });
        }
      })
    }
    function poster(payload, path) {
      return new Promise((resolve, reject) => {
        if (!navigator.onLine) {
          reject("offline");
        }
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            if (this.responseText) {
              resolve(this.responseText);
            } else {
              reject();
            }
          }
        });

        xhr.open("POST", settings.worldUrl + path);

        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader("cache-control", "no-cache");
        
        xhr.send(JSON.stringify( payload ));
      })
    }
    function sha256 (str) {
    // We transform the string into an arraybuffer.
      var buffer = new TextEncoder('utf-8').encode(str);
      return crypto.subtle.digest('SHA-256', buffer).then(function (hash) {
        return hash
      })
    }
    function ab2str (buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf))
    }
    function str2ab (str) {
      var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf
    }
    function arrayToBase64String (ab) {
      var dView = new Uint8Array(ab);   // Get a byte view
      var arr = Array.prototype.slice.call(dView); // Create a normal array
      var arr1 = arr.map(function (item) {
        return String.fromCharCode(item)    // Convert
      });
      return window.btoa(arr1.join(''))  // Form a string
    }
    if (settings && settings.worldUrl) {
      const API = {
        create: args => {
          return API.update(args)
        },
        read: args => {
          if (args.populate) {
            var allThePromises = [];
            var bulid = JSON.parse(JSON.stringify(args.populate),(_, value) => {
              if (typeof value === 'string' && /[_a-z\-\.]*/i.test(value)) {
                if (settings.resolve) {
                  allThePromises.push(getter(value, args.params, args.sync) );
                  return value
                }
                return getter(value, args.params, args.sync)
              } else {
                return value
              }
            });
            if (settings.resolve) {
              return Promise.all(allThePromises).then((values) => {
                var i = values.length - 1;
                return JSON.parse(JSON.stringify(args.populate),(_, value) => {
                  if (typeof value === 'string' && /[_a-z\-\.]*/i.test(value)) {
                    if (settings.resolve) {
                      return values[i--]
                    }
                    return getter(value, args.params, args.sync)
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
            setter(key, args.params[key]);
          });
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
          args.params.username = args.params.username.toLowerCase();
          
          // are you login already?
          return API.read({populate: {username: "user.username", _localToken: "user._localToken", _accessToken: "user._accessToken" }, sync: false}).then(async user => {
            if (!user) {
              console.error("error got user");
            }
            if (await user.username === undefined) {
              if (!args.params.password) {
                throw "need a password e.g. {username: 'marcus7777', password: 'monkey123'}"
              }
              return sha256(JSON.stringify(args.params)).then(localhash => {
                return crypto.subtle.importKey("raw", localhash, {name: "AES-CBC"}, true, ["encrypt", "decrypt"])
              }).then( key => {
                return sha256(args.params.username).then(userSHA => {
                  var data = localStorage.getItem(arrayToBase64String(userSHA));
                  localStorage.removeItem(arrayToBase64String(userSHA));
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
                      localStorage.setItem('gun/', ab2str(decrypted).slice(8));
                    }).catch(err => {
                      console.error(err);
                    });
                  }
                  return key
                }).then( key => {
                  // if encrypted data decrypt it
                  return crypto.subtle.exportKey("jwk",key)
                }).then(keydata => {
                  //returns the exported key data
                  return keydata.k // save the hard bit
                }).then( localToken => {
                  poster(args.params,"/auth/login").then(res => {
                    var token = JSON.parse(res).data.token;
                    return API.update({populate:args.populate, params: {
                      user: {
                        username: args.params.username,
                        _accessToken: token, // to access server
                        _localToken: localToken, // to encrypt with when logged out
                      }
                    }})
                  });
                }).catch( err => {
                  if (err === "offline") {
                    return API.read(args)
                  }
                  console.error(err);
                })
              }).catch(err => {
                console.error("error login in :", err);
              })
            // TODO  if logged in as something else
            } else if (await user.username === args.params.username){
              if (settings.log){ console.log("you are (and were) logged in :)" ); }
            } else if (await user.username !== args.params.username){
  //            API.logout()
              // API.login(args)

            }
            
            return API.read(Object.assign({sync: true}, args))
          })
        },
        logout: args => {
          getter("user").then(async user => {
            var localToken = await user._localToken;
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
                var iv = window.crypto.getRandomValues(new Uint8Array(16));
                window.crypto.subtle.encrypt(
                  {
                    name: "AES-CBC",
                    iv: iv,
                  },key, str2ab("12345678"+localStorage.getItem("gun/")) // add 8 chr 
                ).then(encrypted => {
                  sha256(user.username).then(userSHA => { 
                    localStorage.setItem(arrayToBase64String(userSHA), ab2str(encrypted));
                    localStorage.removeItem('gun/');
                  });
                }).catch(function(err){
                  console.error(err);
                });
              });
            }
          }).catch(err => {
            console.error(err);
          });
        }
      };
      return API
    } else {
      console.error("Need a worldUrl");
    }
  }

  return kanoApiCommunicationLib;

})));
