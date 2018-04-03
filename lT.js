var API = window.Kano.APICommunication({worldUrl:"oeu",resolve:true})
API.update({params:{user:{username:"Marcus"}}})
API.read({populate:{Name:"user.username"}}).then(console.log)
