draw_board()

// load on /socket.io/socket.io.js exposed socket.io clientside:
const socket = io();
// connect EventListeners:
document.getElementById("buttonNewGame").addEventListener("click", createGameRoom)

for (  let btn of document.getElementsByClassName("buttonJoinGame")  ){
    btn.addEventListener("click", () => {
        joinGameRoom(btn)
    })
}

// get active rooms Signal:
socket.emit('getRooms')
// answer of getRooms Signal:
socket.on('sendRooms', function(data){
    console.log(data.length)
    if (data.length===0){document.getElementById("roomsList").innerHTML="No Player currently in queue, press F5 to refresh or que yourself."}
    else {drawRoomList(data)} 
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
    })
}



// functions to communicate with server using socket.io-signals:
function createGameRoom(clickedElement){
    let name = document.getElementById("inputName").value
    if(!name){
        alert("Please enter your name.")
        return
    }
    console.log("Create a new Game Room with name: "+name)
    socket.emit("createRoom", {name: name})
}

function joinGameRoom(clickedElement){
    let name = document.getElementById("inputName").value
    let room = clickedElement.id
    if(!name || !room){
        alert("Please enter your name. (or room does not exist) ")
        return
    }
    console.log("Join Game with name: "+name+" on room: "+room)
    socket.emit('joinRoom', {name: name, room: room})
}


    
class App{
    constructor(){
        this.state = {
            username: false,
            game: false,         // false | "waiting" | "playing" | "gameover"
            isMyTurn: false,
        }
        $menu=document.getElementById("menu")
        $game=document.getElementById("game")
    }
    changeState(newState){
        if (newState === false){

        }else if (newState === "waiting"){
            $menu.visible=false;
        }else if (newState === "playing"){

        }else if (newState === "gameover"){

        }else {
            console.error("error app-State does not exist: "+newState)
            return
        }
        this.state=newState
    }
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