class App{
    constructor(){
        this.state = {
            username: false,
            game: false,         // false | "waiting" | "playing" | "gameover"
            isMyTurn: false,
        }
        this.$menu=document.getElementById("menu")
        this.$waiting=document.getElementById("waitingRoom")
        this.$game=document.getElementById("game")
        document.getElementById("buttonNewGame").addEventListener("click", createGameRoom)
    }
    changeState(newState) {
        this.$menu.style.display="none"
        this.$waiting.style.display="none"
        this.$game.style.display="none"
        if (newState === false){
            this.$menu.style.display="initial"
        }else if (newState === "waiting"){
            this.$waiting.style.display="initial"
        }else if (newState === "playing"){
            this.$game.style.display="initial"
        }else if (newState === "gameover"){
            this.$game.style.display="initial"
            // :todo add win popup or remove this state if not needed
        }else {
            console.error("error app-State does not exist: "+newState)
            return false
        }
        this.state=newState
        return true
    }  
}


const socket = io();
const APP = new App

// get active rooms Signal:
socket.emit("getRooms")

draw_board()


// requests all rooms with 1 player -> possible to join in
socket.on("sendRooms", (data) =>{
    if (data.length===0){
        document.getElementById("roomsList").innerHTML="No Player currently in queue, press F5 to refresh or que yourself."
    } else {drawRoomList(data)} 
})
// draw List of games to join
function drawRoomList(arrObj){
    let $list = document.getElementById("roomsList")
    $list.innerHTML=""
    arrObj.forEach((item)=>{
        let li = document.createElement("li")
        li.innerText = item.roomName
        let btn = document.createElement("button")
        btn.innerText="Join"
        btn.id=item.roomName
        $list.appendChild(li).appendChild(btn)
        btn.addEventListener("click", () => {
            joinGameRoom(btn)
        })
    })
}


/*      socket-signarls incoming from server  */ 

socket.on("createdRoom", (data) =>{
    //data = {name: data.name, room: "room-"+roomNr}
    APP.changeState("waiting")
})

socket.on("sendRooms", (data) =>{
    if (data.length===0){
        document.getElementById("roomsList").innerHTML="No Player currently in queue, press F5 to refresh or que yourself."
    } else {drawRoomList(data)} 
})

socket.on("joinedRoom", (data)=>{
    // data = {name: data.name, room: data.room}
})


/*      onClick functions  */                   

function createGameRoom(){
    let name = document.getElementById("inputName").value
    if(!name){
        alert("Please enter your name.")
        return
    }
    socket.emit("createRoom", {name: name})
}

function joinGameRoom(clickedElement){
    let name = document.getElementById("inputName").value
    let room = clickedElement.id
    if(!name || !room){
        alert("Please enter your name. (or room does not exist) ")
        return
    }
    socket.emit("joinRoom", {name: name, room: room})
}


    














//chess logic:
/**set up the grid */
function draw_board() {
    for (let number=0; number<8; number++){                      
        for (let letter=0; letter<8; letter++){
            let letter_value=""
            let div = document.createElement("div")
            div.className="cell"
            let boardElement = document.getElementById("board")
            boardElement.appendChild(div)
            letter_value=String.fromCharCode(65+letter)         //0=A, 1=B, 2=C...
            div.innerHTML=letter_value+(8-number)
            div.id=String(letter_value.toLowerCase())+String(8-number)
            if (letter % 2){                                    
                boardElement.children[letter+(number*8)-number%2].className="cell cellalt"
            }
        }
    }
}