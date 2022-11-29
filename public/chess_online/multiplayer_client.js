import Session from "../modules/chess_session.js"

/**
 * Handles most of the Websocket connections to server, and the States of the Website: | before choosing  | waitingRoom for 2nd player | playing a game |
 * 
 */

class App{
    constructor(socket){
        let session             // placeholder for the game-session once 2 players are found
        this.socket = socket
        this.state = "main"      // "main" | "waiting" | "playing"
        this.isTurn
        this.joinedRoom
        // dom-elements:
        this.$menu=document.getElementById("menu")
        this.$waiting=document.getElementById("waitingRoom")
        this.$game=document.getElementById("game")
        document.getElementById("buttonNewGame").addEventListener("click", createGameRoom)
        //request room-list from server:
        this.socket.emit("getRooms")
    }
    changeState(newState) {
        this.$menu.style.display="none"
        this.$waiting.style.display="none"
        this.$game.style.display="none"

        if (newState === "lobby"){
            this.socket.emit("getRooms")
            this.$menu.style.display="block"
        }else if (newState === "waiting"){
            this.$waiting.style.display="block"
        }else if (newState === "game"){
            this.session = new Session({socket:this.socket, isTurn: this.isTurn, room:this.joinedRoom})                      // creates the actual "chess-game"
            this.$game.style.display="initial"
        }else {
            console.error("error app-State does not exist: "+newState)
            return false
        }
        this.state=newState
        return true
    }

    backToLobby(){
        //clear game-board and session
        document.getElementById("board").innerHTML=""
        document.getElementById("moveHistoryList").innerHTML=""
        this.session= null
        APP.changeState("lobby")
    }
}


const socket = io();
const APP = new App(socket)



/*      socket-signals incoming from server  */ 

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

socket.on("createdRoom", (data) =>{
    //data = {name: data.name, room: "room-"+roomNr}
    APP.changeState("waiting")
})

socket.on("sendRooms", (data) =>{
    if (data.length===0){
        document.getElementById("roomsList").innerHTML="No Player currently in queue, press F5 to refresh or que yourself."
    } else {drawRoomList(data)} 
})

socket.on("gamestart:player1", (data)=>{        // data = {name: data.name, room: data.room}
    APP.isTurn=data.isTurn
    APP.joinedRoom=data.room
    APP.changeState("game")
    
})

socket.on("gamestart:player2", (data)=>{        // data = {name: data.name, room: data.room}
    APP.isTurn=data.isTurn
    APP.joinedRoom=data.room
    APP.changeState("game")   
    
})

socket.on("enemyMovePlayed", (data)=>{
    APP.session.otherMultiPlayerMadeMove(data.move)
})

socket.on("gameOverAPP", (data)=>{
    let msgBig = "Game ended in a draw!"
    let msgSmall = "by repetition"
    let msgScore = " 1 - 1 "
    let msgMyPicture = `../img/b_king.png`
    let msgOpPicture = `../img/w_pawn.png`
    if(APP.isTurn){
        msgMyPicture = `../img/w_king.png`
        msgOpPicture = `../img/b_pawn.png`
    }
    if(data.winner.includes("true")===APP.isTurn){
        // this player has Won
        msgBig = "You Won!"
        msgSmall = "by checkmate"
        msgScore = "1 - 0"
    }
    else{
        msgBig = "You Lost!"
        msgSmall = "by checkmate"
        msgScore = "0 - 1"
    }

    let winningMessage = `
        <div class="popup" id="popup">
            <h2>${msgBig}</h2>
            <p>${msgSmall}</p>
            <div >
                <img src="${msgMyPicture}">
                <p>${msgScore}</p>
                <img src="${msgOpPicture}">
            </div>
            <p>Back to the Lobby to play another game.</p>
            <button id="gameOverButton">Go to Lobby</button>
        </div>`
    document.getElementById("board").innerHTML = document.getElementById("board").innerHTML+winningMessage
    document.getElementById("gameOverButton").addEventListener("click", APP.backToLobby)
})



/*      onClick functions -> emit socket.io-signals to server  */                   

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