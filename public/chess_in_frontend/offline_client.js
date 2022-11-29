import Session from "../modules/chess_session.js"


// instead of signaling to the socket.io ->server this class recieves the signals and handles them
class OfflineSocket{
    constructor(){
        //creates the actual instance of the chessgame-player
        this.session = new Session({socket: this, isTurn: true})
    }

    emit(signal, data){
        if(signal==="gameover"){
            console.log("game is over")
        }
        else if(signal==="moveMade"){
            //since there is no "other player" we just switch this bool to let both white & black be controlled
            this.session.isTurn=!this.session.isTurn
        }
    }
}

const fs = new OfflineSocket()

