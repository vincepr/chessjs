// using chess notation R: Rook, N: Knight, B: Bishop, Q:Queen, K:King, P:Pawn (pawn added) 

class GameState {
    constructor(isWhiteTurn=true, startingBoard){
        let  defaultNewgameBoard = {
            "a8" : {type : "R", isWhite : false},
            "b8" : {type : "N", isWhite : false},
            "c8" : {type : "B", isWhite : false},
            "d8" : {type : "Q", isWhite : false},
            "e8" : {type : "K", isWhite : false},
            "f8" : {type : "B", isWhite : false},
            "g8" : {type : "N", isWhite : false},
            "h8" : {type : "R", isWhite : false},
            "a7" : {type : "P", isWhite : false},
            "b7" : {type : "P", isWhite : false},
            "c7" : {type : "P", isWhite : false},
            "d7" : {type : "P", isWhite : false},
            "e7" : {type : "P", isWhite : false},
            "f7" : {type : "P", isWhite : false},
            "g7" : {type : "P", isWhite : false},
            "h7" : {type : "P", isWhite : false},
            "a1" : {type : "R", isWhite : true},
            "b1" : {type : "N", isWhite : true},
            "c1" : {type : "B", isWhite : true},
            "d1" : {type : "Q", isWhite : true},
            "e1" : {type : "K", isWhite : true},
            "f1" : {type : "B", isWhite : true},
            "g1" : {type : "N", isWhite : true},
            "h1" : {type : "R", isWhite : true},
            "a2" : {type : "P", isWhite : true},
            "b2" : {type : "P", isWhite : true},
            "c2" : {type : "P", isWhite : true},
            "d2" : {type : "P", isWhite : true},
            "e2" : {type : "P", isWhite : true},
            "f2" : {type : "P", isWhite : true},
            "g2" : {type : "P", isWhite : true},
            "h2" : {type : "P", isWhite : true}
         }
        this.isWhiteTurn=isWhiteTurn
        this.board=startingBoard || defaultNewgameBoard
        this.moveHistory = []
    }
    // visual output of current board state in console mostly for debugging
    terminalBoard(){ 
        console.log("----------------")
        for (let number=1; number<9; number++){                      
            let lineString = ""
            for (let letter=0; letter<8; letter++){
                let letter_value = String.fromCharCode(97+letter)   //97="a"
                if (this.board[letter_value+String(9-number)]){
                    let col ="b"
                    if (this.board[letter_value+String(9-number)].isWhite) {col ="w"}
                    lineString+=this.board[letter_value+String(9-number)].type+col
                }else{lineString+="[]"}
            }
            console.log(lineString)
        }
        console.log("----------------")
    }

    getBoard(){return this.board}

    /**
    * input move : string | like "Pe7f8x=N+" ChessNotationLike).
    */
    doMove(move){
        if (move === "O-O" || move === "0-0"){
            //castle with h-side rook. black is row 8 white is 1
            let row = 8                         
            if (this.isWhiteTurn) { row=1 }
            delete this.board["e"+String(row)]
            this.board["f"+String(row)] = {type : "R", isWhite: this.isWhiteTurn}
            this.board["g"+String(row)] = {type : "K", isWhite: this.isWhiteTurn}
            delete this.board["h"+String(row)]
        } else if (move ==="O-O-O" || move === "0-0-0") {
            //castle with a-side rook. black is row 8 white is 1
            let row = 8                         
            if (this.isWhiteTurn) { row=1 }
            console.log(row)
            delete this.board["a"+String(row)]
            this.board["c"+String(row)] = {type : "K", isWhite: this.isWhiteTurn}
            this.board["d"+String(row)] = {type : "R", isWhite: this.isWhiteTurn}
            delete this.board["e"+String(row)]
        } else {
            // innput like: "Pe7f8x=N+"  Pawn (P) moves from (e7) to (e8) while capturing (x) and promotes to a Knight (=N) setting enemy king in check (x)
            let moveType = move.substr(0,1)
            let moveFrom = move.substr(1,2)
            let moveTo = move.substr(3,2)
            let moveExtras = move.substr(5,4)
           
            //delete entry from where we moved from
            delete this.board[moveFrom]
            //fill new position
            this.board[moveTo] = {type : moveType, isWhite: this.isWhiteTurn}

            //special case Pawn Promotion to new Figure:
            if(moveExtras.includes("=")){
                let newFigureType = moveExtras.split('=')[1]
                newFigureType= newFigureType.substr(0,1)
                this.board[moveTo] = {type : newFigureType, isWhite: this.isWhiteTurn}
            }
            // :todo missing are enpassant special capture/move
            // :todo move king out of check
        }
        this.moveHistory.push(move)             //log move made to history
    }

    getMoves(position){
        if (!this.board[position]){return null} //return null if there is no chess figure on the position
        return getLegalMoves(position, this)
    }
}

function getLegalMoves(pos, game){
    let x = Number( pos.substring(0, 1).charCodeAt(0)-96 )
    let y = Number( pos.substring(1, 2) )
    let possibleMoves = []                      // moves the chess figure could theoretically make
    let legalMoves = []                         // moves the chess figure can actually make

    let straightLineMove = null                 //moves straight in line till end or enemy found
    let relativeToPositionMove = null           //moves that move relative fields +- to the x or y diretion
    if      (game.board[pos].type==="R") { straightLineMove = [[true,false,false,false],[false,true,false,false],[false,false,true,false],[false,false,false,true]]}
    else if (game.board[pos].type==="Q") { straightLineMove = [[true,false,false,false],[false,true,false,false],[false,false,true,false],[false,false,false,true],[true,true,false,false],[false,true,true,false],[false,false,true,true],[true,false,false,true]]}
    else if (game.board[pos].type==="B") { straightLineMove = [[true,true,false,false],[false,true,true,false],[false,false,true,true],[true,false,false,true]]}
    else if (game.board[pos].type==="N") { relativeToPositionMove = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]}
    else if (game.board[pos].type==="K") { relativeToPositionMove = [[1,0],[1,1],[0,1],[-1,0],[-1,1],[1,-1],[0,-1],[-1,-1]]}
    else if (game.board[pos].type==="P") {
        //full logic here? or do proper?
    }


    if (straightLineMove){
        for (direction of straightLineMove) {
            possibleMoves=getNextLinearMoves(game, x, y, direction)
            if (!(possibleMoves === null)){
                for (move of possibleMoves){legalMoves.push(move)}
                }
        }
    }
    return legalMoves
}

function getNextLinearMoves(game, x, y, direction){       //moves in a line to next board pice till end or figure // direction [top, right, down, left] ex topright:[true, true, false, false]
    let enemycolor= game.isWhiteTurn
    if (direction[0]){y+=1}
    if (direction[1]){x+=1}
    if (direction[2]){y-=1}
    if (direction[3]){x-=1}
    if ((x > 0 && x < 9) && (y > 0 && y < 9)){
        if (game.board[getBoardValue(x,y)]){                    //figure is blocking
            if (game.board[getBoardValue(x,y)].isWhite===enemycolor){
                return [getBoardValue(x,y)] 
            }
            else{
                return null 
            }
        }else{                                                  //no Figure there so do recursion
            let recursion=getNextLinearMoves(x, y, direction, enemycolor)
            if (recursion === null){
                return [getBoardValue(x, y)]}
            recursion.push(getBoardValue(x,y))
            return recursion
        }
    } return null
}

function getBoardValue(x, y){                                   // 1,1->"A1"  3,1->"C1"
    return String(String.fromCharCode(97+x) + y)
}




//// test stuff :todo remove all above this when finished
const game = new GameState



game.doMove("Pc2c4")
game.doMove("Pd2d3")
game.doMove("Bc1e3")
game.doMove("Pa2a8x=Q+")
game.terminalBoard()
console.log(game.board.e3)
console.log(game.getMoves("e3"))

//console.log(game.getBoard())

/*
//readline & input for testing api moves quickly :todo remove this later
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Who are you?', name => {
    console.log(`Hey there ${name}!`);
    readline.close();
  });

  */