import '../gun/gun.js';

export default function (settings) {
    if (!settings) throw new Error('settings are needed eg. client({defaultUrl:\'./mockApi\'})');
    let ls = localStorage;
    if (settings.localStorage) {
        ls = settings.localStorage;
    }
    if (!settings.defaultUrl) throw new Error('defaultUrl is needed eg. client({defaultUrl:\'./mockApi\'})');
    const stackOfXhr = {};
    // libraries
    const gun = Gun();
    // functions
    function ifArray(data) {
        if (typeof data === 'object' && Object.keys(data).length && '0123456789'.startsWith(Object.keys(data).join('').slice(0, -1))) {
            return Object.keys(data).reduce((a, v) => {
                if (v !== '_' && v === +v) {
                    a.push(v);
                }
                return a;
            }, []).map(value => data[value]);
        }
        return data;
    }
    function getDataFromServer(path) {
        return new Promise((resolve, reject) => {
            if (stackOfXhr[path]) {
                stackOfXhr[path].push(resolve);
            } else {
                stackOfXhr[path] = [resolve];
                if (!navigator.onLine) {
                    reject(new Error('offline'));
                }
                getter('user._accessToken').then((accessToken) => {
                    const theFetch = {
                        headers: {
                            'content-type': 'application/json',
                            Accept: 'application/json',
                        },
                        method: 'GET',
                        mode: 'cors',
                        redirect: 'follow',
                        referrer: 'Api-client',
                    };
                    if (accessToken) {
                        theFetch.headers.authorization = `Bearer ${accessToken}`;
                    }
                    fetch(`${settings.defaultUrl}${path}`, theFetch).then(response => response.json()).then((dataFromServer) => {
                        if (dataFromServer !== undefined && dataFromServer !== null) {
                            stackOfXhr[path].forEach((resolved) => {
                                resolved(dataFromServer);
                            });
                            delete (stackOfXhr[path]);
                        } else {
                            reject(new Error('No Response'));
                        }
                    });
                    if (settings.log) { console.log('get', path); }
                });
            }
        });
    }
    if (settings.getDataFromServer) {
        getDataFromServer = settings.getDataFromServer;
    }
    function getter(query, params, sync) {
        if (!query || query === 'undefined') {
            throw new Error('no query');
        }
        return new Promise((resolve, reject) => {
            const loggedInUser = JSON.parse(ls.getItem('user') || 'null');
            let queryRun = query;
            if (loggedInUser) {
                if (query === 'user._accessToken') {
                    resolve(loggedInUser._accessToken);
                    return;
                } else if (query === 'user.username') {
                    resolve(loggedInUser.username);
                    return;
                } else if (query === 'user._localToken') {
                    resolve(loggedInUser._localToken);
                    return;
                } else if (query.startsWith('user.') || query === 'user') {
                    queryRun = query.replace('user', loggedInUser.mapTo);
                }
            } else if (query.startsWith('user.')) {
                resolve(undefined);
                return;
            }
            queryRun.split('.*')[0].split('.').reduce(
                (db, val) => // TODO use "gun load"  if ".*"
                    db.get(val)
                , gun,
            ).once((data) => {
                if (sync && data === undefined) {
                    let gunData = data;
                    if (query.startsWith('users.')) {
                        const username = query.split('.')[1];
                        const user = gun.get('users').get(query.split('.')[1]);
                        if (params === 'check' && query.split('.').length === 2) {
                            getDataFromServer(`accounts/checkUsernameExists/${username}`).then((serverRes) => {
                                const theData = JSON.parse(serverRes.data);
                                resolve(theData);
                                if (theData) {
                                    user.set({});
                                }
                            });
                        } else {
                            getDataFromServer(`/users/?username=${query.split('.')[1]}`).then((serverRes) => {
                                const serverData = JSON.parse(serverRes, (key, value) => {
                                    let theValue = value;
                                    if (Array.isArray(value)) {
                                        theValue = value.reduce((acc, curValue, curIndex) => {
                                            acc[curIndex] = curValue;
                                            return acc;
                                        }, {});
                                    }
                                    return theValue;
                                });
                                Object.keys(serverData.data).forEach((key) => {
                                    user.get(key.replace('_', '')).put(serverData.data[key]);
                                });
                            }).then(() => query.split('.').reduce((db, val) => db.get(val), gun).once((retry) => {
                                gunData = retry;
                            })).then(() => {
                                resolve(ifArray(gunData));
                            })
                                .catch((e) => {
                                    reject(e);
                                });
                        }
                    }
                } else {
                    resolve(ifArray(data));
                }
            });
        });
    }
    function arraysToObject(valueToSet) {
        return JSON.parse(JSON.stringify(valueToSet, (_, value) => {
            if (Array.isArray(value)) {
                return value.reduce((accumulator, currentValue, currentIndex) => {
                    const theAccumulator = accumulator;
                    theAccumulator[currentIndex] = currentValue;
                    return theAccumulator;
                }, {});
            }
            return value;
        }));
    }
    function setter(query, valueToSet) {
        const loggedInUser = JSON.parse(ls.getItem('user') || 'null');
        let theQuery = query;
        if (loggedInUser) {
            if (query.startsWith('user.') || query === 'user') {
                theQuery = query.replace('user', loggedInUser.mapTo);
            }
        }

        let oldValue;
        let newValue;
        return getter(theQuery).then((data) => {
            oldValue = data;
        }).then(() => {
            theQuery.split('.').reduce((db, val) => db.get(val), gun).put(arraysToObject(valueToSet));
        }).then(() => getter(theQuery))
            .then((data) => {
                newValue = data;
            })
            .then(() => {
                if (oldValue !== undefined || JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                    if (settings.log) { console.log('needs sync', newValue); }
                    // TODO add to postList
                }
            })
            .then(() => newValue);
    }
    function onIdle(itime, doAfter) {
        return new Promise((resolve) => {
            let trys = 0;
            const onIdleTest = () => {
                const t = performance.now();
                setTimeout(() => {
                    trys += 1;
                    if (doAfter && trys > doAfter) {
                        resolve();
                    }
                    if (Math.round(performance.now() - t) === Math.round(itime)) {
                        resolve();
                    } else {
                        onIdleTest();
                    }
                }, itime);
            };
            onIdleTest();
        });
    }
    function renewToken() {
        const user = JSON.parse(ls.getItem('user'));
        if (user && user.renew < Date.now() && user._accessToken) {
            onIdle(1000, 10).then(() => getDataFromServer('accounts/auth/refresh').then((res) => {
                if (settings.log) { console.log(res); }
                // duration
                // user
                if (res.data && res.data.token) {
                    const token = res.data.token;
                    const duration = res.data.duration;
                    const renew = Date.now() + ((duration / 2) * 1000);
                    const lUser = ls.getItem('user') || {};
                    ls.setItem(
                        'user',
                        JSON.stringify(Object.assign(lUser, {
                            _accessToken: token,
                            renew,
                        })),
                    );
                } else {
                    throw new Error('no new token');
                }
            }));
        }
    }
    function poster(data, path, accessToken) {
        if (!navigator.onLine) {
            throw new Error('offline');
        }
        const url = settings.defaultUrl + path;
        const theFetch = {
            body: JSON.stringify(data), // must match 'Content-Type' header
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json',
            },
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
        };
        if (accessToken) {
            theFetch.headers.authorization = `Bearer ${accessToken}`;
        }
        return fetch(url, theFetch).then((response) => {
            if (response.statusText === 'Conflict' || response.status > 300) {
                throw new Error(response.statusText);
            } else if (response.bodyUsed === false) {
                try {
                    return response.json().then((theData) => {
                        if (accessToken) {
                            renewToken();
                        }
                        return theData;
                    }).catch(e => true);
                } catch (e) {
                    return true;
                }
            }
        });
    }
    if (settings.poster) {
        poster = settings.poster;
    }
    function sha256(str) {
        // We transform the string into an arraybuffer.
        const buffer = new TextEncoder('utf-8').encode(str);
        return crypto.subtle.digest('SHA-256', buffer).then(hash => hash);
    }
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
    function str2ab(str) {
        const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        const bufView = new Uint16Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i += 1) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    function arrayToBase64(ab) {
        const dView = new Uint8Array(ab); // Get a byte view
        const arr = Array.prototype.slice.call(dView); // Create a normal array
        const arr1 = arr.map(item =>
            String.fromCharCode(item), // Convert
        );
        return window.btoa(arr1.join('')); // Form a string
    }
    function base64ToArrayBuffer(s) {
        const asciiString = window.atob(s);
        return new Uint8Array([...asciiString].map(char => char.charCodeAt(0)));
    }
    function keyFromLocalToken(localToken) {
        return window.crypto.subtle.importKey('jwk', {
            kty: 'oct', k: localToken, alg: 'A256CBC', ext: true,
        }, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
    }
    function encryptString(localToken, data, ivAsString) {
        return keyFromLocalToken(localToken).then((key) => {
            const iv = new Uint8Array(ivAsString.split(','));
            return window.crypto.subtle.encrypt({
                name: 'AES-CBC',
                iv,
            }, key, str2ab(`12345678${data}`)); // add 8 chr due to droppinginitial vector
        }).then(encrypted => arrayToBase64(encrypted));
    }
    // function decryptString(localToken, data, ivAsString) {
    // return keyFromLocalToken(localToken).then((key) => {
    // const iv = new Uint8Array(ivAsString.split(','));
    //
    // return window.crypto.subtle.decrypt(
    // {
    // name: 'AES-CBC',
    // iv
    // },
    // key, // from generateKey or importKey above
    // base64ToArrayBuffer(data)
    // );
    // }).then((decrypted) => {
    // return ab2str(decrypted).slice(8);
    // });
    // }
    function makeLocalToken(username, password) {
        if (!username || !password) {
            throw new Error('need Both username & password');
        }
        return sha256(username + password).then(localhash => crypto.subtle.importKey('raw', localhash, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt'])).then(key => sha256(username).then((userSHA) => {
            const userHash = arrayToBase64(userSHA);
            const data = ls.getItem(userHash);
            const iv = ls.getItem(`${userHash}iv`);
            if (data) {
                ls.removeItem(userHash);
                ls.removeItem(`${userHash}iv`);
                window.crypto.subtle.decrypt(
                    {
                        name: 'AES-CBC',
                        iv: new Uint8Array(iv.split(',')),
                    },
                    key, // from generateKey or importKey above
                    base64ToArrayBuffer(data), // ArrayBuffer of the data
                ).then(decrypted =>
                // TODO put ES-CBC
                // as no initial Factor I need to chop off the first 8 characters
                    ls.setItem('user', ab2str(decrypted).slice(8))).then(() => {
                }).catch((err) => {
                    console.error(err);
                });
            }
            return key;
        }).then(theKey =>
        // if encrypted data decrypt it
            crypto.subtle.exportKey('jwk', theKey)).then(keydata =>
        // returns the exported key data
            keydata.k, // save the hard bit
        ));
    }
    const API = {
        isLoggedIn: () => {
            if (ls.getItem('user')) {
                return JSON.parse(ls.getItem('user')).username;
            }
            return false;
        },
        check: query => getter(query, 'check', true).then(data => !!data),
        forgotUsername: (args) => {
            if (args && args.params && args.params.user && args.params.user.email) {
                const email = args.params.user.email;
                if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi.test(email)) {
                    return poster(args.params.user, 'accounts/forgotUsername').then((ok) => {
                        if (ok === true) {
                            return API.read(args);
                        }
                        throw new Error('invalid email');
                    });
                }
                throw new Error('invalid email');
            } else {
                throw new Error('need a params.user.email in the Object');
            }
        },
        forgotPassword: (args) => {
            if (args && args.params && args.params.user && args.params.user.username) {
                const username = args.params.user.username;
                if (/^[0-9a-z]*$/gi.test(username)) {
                    return poster(args.params.user, 'accounts/forgotPassword').then((ok) => {
                        if (ok === true) {
                            return API.read(args);
                        }
                        throw new Error('invalid username');
                    });
                }
                throw new Error('invalid username');
            } else {
                throw new Error('need a params.user.username in the Object');
            }
        },
        create: args => API.logout().then(() => {
            if (args.params.user) {
                const argUser = args.params.user;
                return sha256(argUser.username).then((hash) => {
                    const userHash = arrayToBase64(hash);
                    if (ls.getItem(userHash)) {
                        throw new Error('User already exists');
                    } else if (argUser.username && argUser.password && argUser.email) {
                        if (!argUser.erole) { argUser.erole = 'notset'; }
                        //  if (!args.params.user.epurpose) {args.params.user.epurpose = "notset"}
                        return poster(argUser, 'accounts').then((res) => {
                            if (settings.log) { console.log(res); }
                            // duration
                            // user
                            if (res.data && res.data.token) {
                                const token = res.data.token;
                                const duration = res.data.duration;
                                const renew = Date.now() + ((duration / 2) * 1000);
                                const user = Object.assign({
                                    username: args.params.user.username,
                                }, res.data.user);

                                if (user.username) {
                                    return makeLocalToken(
                                        user.username,
                                        args.params.user.password,
                                    ).then((localToken) => {
                                        ls.setItem(
                                            'user',
                                            JSON.stringify(Object.assign(ls.user || {}, {
                                                renew,
                                                userHash,
                                                _accessToken: token,
                                                _localToken: localToken,
                                                mapTo: `users.${user.username}`,
                                                username: user.username,
                                            })),
                                        );
                                        return user;
                                    });
                                }
                            }
                            throw new Error('No token from serve');
                        }).then(user => API.update(Object.assign(args, {
                            params: {
                                user,
                            },
                        })));
                    }
                    throw new Error('Need an user.username && user.password & user.email');
                }).catch((err) => {
                    throw err;
                });
            }
        }),
        read: args => new Promise((resolve) => {
            resolve(API._read(Object.assign({ sync: true }, args)));
        }),
        _read: (args) => {
            if (args.populate) {
                const allThePromises = [];
                const allThePromisesKeys = [];
                const bulid = JSON.parse(JSON.stringify(args.populate), (_, value) => {
                    if (typeof value === 'string' && /^[_a-z0-9\-.]*$/i.test(value)) {
                        if (settings.resolve) {
                            allThePromisesKeys.push(value);
                            allThePromises.push(getter(value, args.params, args.sync));
                            return value;
                        }
                        return getter(value, args.params, args.sync);
                    }
                    return value;
                });
                if (settings.resolve) {
                    return Promise.all(allThePromises).then(values => JSON.parse(JSON.stringify(args.populate), (_, value) => {
                        if (typeof value === 'string' && /^[_a-z0-9\-.]*$/i.test(value)) {
                            return values[allThePromisesKeys.indexOf(value)];
                        }
                        return value;
                    }));
                }
                return bulid;
            }
            return {};
        },
        login: (args) => {
            if (!args.params) {
                throw new Error("need params e.g. API.login({params: {user: {username: 'marcus7777', password: 'monkey123'}}})");
            }
            if (!args.params.user) {
                throw new Error("need a username e.g. {username: 'marcus7777', password: 'monkey123'}");
            }
            // are you login already?
            return API.read({
                populate: {
                    username: 'user.username',
                    _localToken: 'user._localToken',
                    _accessToken: 'user._accessToken',
                },
                sync: false,
            }).then(async (user) => {
                if (!user) {
                    if (settings.log) { console.error('error got user'); }
                } else if (settings.log) { console.log('user', user); }
                if (await user.username === undefined) { // so you are not logged in
                    if (!args.params.user.password) {
                        throw new Error("need a password e.g. username: 'marcus7777', password: 'monkey123'");
                    }
                    return makeLocalToken(args.params.user.username.toLowerCase(), args.params.user.password).then((localToken) => {
                        if (!ls.getItem('user')) {
                            return poster(args.params.user, 'accounts/auth').then((res) => {
                                const token = res.data.token;
                                const duration = res.data.duration;
                                const renew = Date.now() + ((duration / 2) * 1000);

                                ls.setItem('user', JSON.stringify({
                                    mapTo: `users.${args.params.user.username}`,
                                    username: args.params.user.username,
                                    _localToken: localToken, // to encrypt with when logged out
                                    _accessToken: token, // to access server
                                    renew,
                                }));
                            }).then(() => API.read({ populate: args.populate }));
                        }
                        return API.read({ populate: args.populate });
                    }).catch((err) => {
                        throw err;
                    });
                    // TODO  if logged in as something else
                } else if (await user.username === args.params.username) {
                    if (settings.log) { console.log('you are (and were) logged in :)'); }
                } else if (await user.username !== args.params.username) {
                    return API.logout().then(() => API.login(args));
                }
                return API.read(Object.assign({ sync: true }, args));
            });
        },
        update: (args) => {
            Object.keys(args.params).forEach((key) => {
                setter(key, args.params[key]);
            });
            return API.read(Object.assign({ sync: true }, args));
        },
        logout: () => {
            const loggedIn = API.isLoggedIn();
            if (loggedIn) {
                return getter('user._localToken').then((localToken) => {
                    const iv = window.crypto.getRandomValues(new Uint8Array(16)).toString();
                    return encryptString(localToken, ls.getItem('user'), iv).then(encrypted => sha256(loggedIn).then((userSHA) => {
                        ls.setItem(`${arrayToBase64(userSHA)}iv`, iv);
                        ls.setItem(arrayToBase64(userSHA), encrypted);
                        ls.removeItem('user');
                    })).catch((e) => {
                        throw e;
                    });
                }).catch((e) => {
                    throw e;
                });
            } // not logged in
            return new Promise((resolve) => {
                resolve(false);
            });
        },
    };
    return API;
}
