import client from '../kano-api-client.js'

let ls = {
  _data: {},
  setItem: function (id, val) { return this._data[id] = val },
  getItem: function (id) { return this._data[id] },
  removeItem: function (id) { return delete this._data[id] },
  clear: function () { return this._data = {} }
}

suite('client base', () => {
  test('client throws if no settings', () => {
    try {
      client()
    } catch (e) {
      assert.equal(e.message, "settings are needed eg. client({defaultUrl:'./fakeApi'})")
    }
  })
  test('client throws if settings but no default url', () => {
    try {
      client({})
    } catch (e) {
      assert.equal(e.message, "defaultUrl is needed eg. client({defaultUrl:'./fakeApi'})")
    }
  })
  test("client loads if client({defaultUrl:'./fakeApi'})", () => {
    var API = client({
      defaultUrl: './fakeApi'
    })
    assert.ok(API)
  })
  test('make sure there is no user logged in yet', () => {
    var API = client({
      defaultUrl: './fakeApi'
    })
    assert.equal(API.isLoggedIn, false)
  })
  test('has username been not taken', () => {
    var API = client({
      defaultUrl: './fakeApi',
      getDataFromServer: () => {
        return new Promise((resolve) => {
          resolve({data: 'false'})
        })
      }
    })
    var query = 'users.marcus7778'
    API.check(query).then((exists) => {
      assert.equal(exists, false)
    })
  })
  test('has username been taken', () => {
    var API = client({
      defaultUrl: './fakeApi',
      getDataFromServer: () => {
        return new Promise((resolve) => {
          resolve({data: 'true'})
        })
      }
    })
    var query = 'users.marcus7777'
    API.check(query).then((exists) => {
      assert.equal(exists, true)
    })
  })
  test('forgotUsername for a no email', () => {
    var API = client({
      defaultUrl: './fakeApi'
    })
    try {
      API.forgotUsername({
        params: {
          user: {
          }
        }
      })
    } catch (e) {
      assert.equal(e.message, 'need a params.user.email in the Object')
    }
  })
  test('forgotUsername for a valid email', () => {
    var API = client({
      defaultUrl: './fakeApi',
      poster: function () {
        return new Promise(function (resolve, reject) {
          resolve({
            data: 'true'
          })
        })
      }
    })
    API.forgotUsername({
      params: {
        user: {
          email: 'marcus@hhost.me'
        }
      }
    }).then((ok) => {
      assert.ok(ok)
    })
  })
  test('forgotUsername for a invalid email', () => {
    var API = client({
      defaultUrl: './fakeApi/'
    })
    try {
      API.forgotUsername({
        params: {
          user: {
            email: '1234567890f7ypfy873pf1234567891234567.com'
          }
        }
      })
    } catch (e) {
      assert.equal(e.message, 'invalid email')
    }
  })
  test('forgotPassword for a no username', () => {
    var API = client({
      defaultUrl: './fakeApi'
    })
    try {
      API.forgotPassword({
        params: {
          user: {
          }
        }
      })
    } catch (e) {
      assert.equal(e.message, 'need a params.user.username in the Object')
    }
  })
  test('forgotPassword for a valid username', () => {
    var API = client({
      defaultUrl: './fakeApi',
      poster: function () {
        return new Promise(function (resolve, reject) {
          resolve({
            data: 'true'
          })
        })
      }
    })
    API.forgotPassword({
      params: {
        user: {
          username: 'marcus7777'
        }
      }
    }).then((ok) => {
      assert.ok(ok)
    })
  })
  test('forgotPassword for a invalid username', () => {
    var API = client({
      defaultUrl: './fakeApi/',
      poster: function () {
        return new Promise(function (resolve, reject) {
          reject()
        })
      }
    })
    try {
      API.forgotPassword({
        params: {
          user: {
            username: '...'
          }
        }
      }).then(() => {
        assert.equal(1, 0)
      })
    } catch (e) {
      assert.equal(e.message, 'invalid username')
    }
  })
})
suite('client user', () => {
  var name = 'testing'
  var hashOfName = 'z4DNiu1ILV0VJ9fccvzv+E5jJlkoSER9LcCw6H38mpA='
  var password = 'm0nk3y123'
  var keyFromNameAndPassword = 'U2E8RFhyMWpvho4pDlB3q-9smxdWU_WzVj_Tc1aDC7Y'

  test('can a user be created', () => {
    localStorage.clear()
    var API = client({
      defaultUrl: './fakeApi/',
      poster: function () {
        return new Promise(function (resolve) {
          resolve(JSON.parse(`{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}`)
          )
        })
      }
    })
    return API.create({
      params: {
        user: {
          username: name,
          email: 'marcus@kano.me',
          password
        }
      },
      populate: {
        id: 'user.id'
      }
    }).then(async (user) => {
      assert.equal(await user.id, '5ae9b582a82d9f26ec6ea2ea')
    })
  })
  test('user is logged in', () => {
    localStorage.clear()
    var API = client({
      defaultUrl: './fakeApi/',
      poster: () => {
        return new Promise((resolve) => {
          resolve(JSON.parse(`{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}`))
        })
      },
      getDataFromServer: () => {
        return new Promise((resolve) => {
          resolve(JSON.parse(`{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}`))
        })
      }
    })
    return API.login({
      params: {
        user: {
          username: name,
          password
        }
      }
    }).then(() => {
      assert.equal(API.isLoggedIn, name)
    })
  })
  test('user is logged in and out', () => {
    localStorage.clear()

    var API = client({
      defaultUrl: './fakeApi/',
      poster: () => {
        return new Promise((resolve) => {
          resolve(JSON.parse(`{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}`))
        })
      },
      getDataFromServer: () => {
        return new Promise((resolve) => {
          resolve(JSON.parse(`{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}`))
        })
      }
    })
    return API.login({
      params: {
        user: {
          username: name,
          password
        }
      }
    }).then(() => {
      return API.logout()
    }).then(() => {
      assert.ok(localStorage.getItem(hashOfName), 'not save encryptString')
      return assert.equal(API.isLoggedIn, false)
    })
  })
  test('logout should return promise', () => {
    localStorage.clear()

    var API = client({
      defaultUrl: './fakeApi/'
    })
    API.logout().then(() => {
      return assert.equal(API.isLoggedIn, false)
    })
  })
  test('user is logged in if off-line', () => {
    ls.setItem(hashOfName, 'xyEQklDaPj/JfcGsZ+y3WGSmmBBB30exF/Yr6Br86nkgNvvpG0aKdR3wkCyxcDDOAGhNcbLFTWLKG8ov2PPxKz95tYuLMrDa1NE9Fn9AJHVMiYHlgkWzKe+vRaUMO2YGtAZyB/y7U1lX+un8JQfauX/Az7myXeeLq6C4+YzHzTRBuE5Q3bxh1uG9mmHEwqN/cYDA87MpqiTprhMCuUpod8Ven3jpgoVnHuCLkOaUDycgJXwLnasa4PVKoCBiGICLQ/nc78uNmJuL1NgHL2pE64I42ha2+cUDKYf6Zbpzop9H4+P2HTl0v+OZYJMumYaP+iN9NWVRV+yyP7ub4fpHFJb7jyp42kN1eT4lNiq74DcUHks2kBCZunKqeJDmE+xPciql9C53AQVr5+5q/YBxgqw0oOoWeXI5pZ2nXwpn+Fuo4+mzXN414PqTD3omlIJzojCmsIC8u24ZdQxuaT3kq0NL2KxsWM3XQ+GGP4Ol4bUTiUwwIhbmLvyhtylutjiBY/2GDpbX5bCPlEU2WGijsBmRaQIBe2y4nliUNyvT8dT85PBNNBWGU/2eICLxXcxwdAycSoJ/1kqPsdnw4+i95WFhI9iARCosnBzMZQ8tkilrBVD82wN1pAO7rcxwwBmm69vEUm3Tdbm0lXwTx45NKU2dPFr0EUvWV4Mo/0CAyg6qqLKqj1dm9CdvIVK4N+OBao2EoajUepQhOUADM+zX92lJr01/0r+945nupwOlaul2mrPDbjlnEzx4zCFjbFajZIAv0sE9Nh+uIriGo2IegtJa2pIiTzTVEaV+Wd0WZdxReKkfpIYcat1D2kWnQZirkAwI3h+XuVndUbwTo5NQheQIl9hayVXPyaoomIe4jlH8+3VanW8U6DVU90P64AZT')
    ls.setItem(hashOfName + 'iv', '136,179,253,164,23,155,253,237,52,133,22,146,93,125,19,237')

    var API = client({
      defaultUrl: './fakeApi/',
      poster: () => {
        throw new Error('offline')
      },
      getDataFromServer: () => {
        throw new Error('offline')
      },
      localStorage: ls
    })
    return API.login({
      params: {
        user: {
          username: name,
          password
        }
      }
    }).then(() => {
      assert.ok(ls.getItem('user'), 'not load decrypted user')
      return assert.equal(API.isLoggedIn, name)
    })
  })
})
