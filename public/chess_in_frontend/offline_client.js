import Session from "../modules/chess_session.js"


// instead of signaling to the socket.io ->server this class recieves the signals and handles them
class OfflineSocket{
    constructor(){
        //creates the actual instance of the chessgame-player
        this.session = new Session({socket: this, isTurn: true})
    }

    emit(signal, data){
        if(signal==="gameOver"){
            gameoverPopup(data)
        }
        else if(signal==="moveMade"){
            //since there is no "other player" we just switch this bool to let both white & black be controlled
            this.session.isTurn=!this.session.isTurn
        }
    }
}

//start game the first time:
var fs = initBoard()


function initBoard(){
    document.getElementById("board").innerHTML=""
    document.getElementById("moveHistoryList").innerHTML="Move History"
    fs =new OfflineSocket()
    return fs
}


function gameoverPopup(data){
    let msgBig = "Game ended in a draw!"
    let msgSmall = "by repetition"
    let msgScore = " 1 - 1 "
    let msgMyPicture = `../img/b_knight.png`
    let msgOpPicture = `../img/w_king.png`

    if(data.winner.includes("true")){
        // this player has Won
        msgBig = "White Won!"
        msgSmall = "by checkmate"
        msgScore = "0 - 1"
    }
    else if (data.winner.includes("false")){
        msgBig = "Black Won!"
        msgSmall = "by checkmate"
        msgScore = "1 - 0"
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
    document.getElementById("gameOverButton").addEventListener("click", initBoard)
}

