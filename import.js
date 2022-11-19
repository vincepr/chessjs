console.log("import file is running")
import User from "./user.js"


const user = new User("Bob",11)
console.log(user)
console.log(user.name)
user.printName()
