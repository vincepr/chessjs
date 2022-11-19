console.log("export file is running")


export default class User{
    constructor(name, age) {
        this.name=name
        this.age=age
    }

    printName(){
        console.log(`User's name is ${this.name}`)
    }
}



function printAge(user){
    console.log(`User is ${user.age}`)
}