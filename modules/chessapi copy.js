// using chess notation R: Rook, N: Knight, B: Bishop, Q:Queen, K:King, P:Pawn (pawn added) 

/** .getMoves("a1")->["a2","a3","a4"]   
 *  .tryMove("Ra1a4")->bool     
 *  .getBoard()->{"a1":{type: "R", isWhite:false}}  */
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
    // visual output of current board state in console. only for debugging/coding
    terminalBoard(){ 
        console.log("------------------")
        for (let number=1; number<9; number++){                      
            let lineString = String(9-number)+"|"
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
        console.log("--AABBCCDDEEFFGGHH".toLowerCase())
        console.log("------------------")
    }

    getBoard(){return this.board}

    /**
    * input move : string | like "Pe7f8x=N+" ChessNotationLike).
    */
    tryMove(move){
        // :todo only move if in getMove(pos), therefore is legal move
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
        this.moveHistory.push(move)                                     //log move made to history
    }

    getMoves(position){
        if (!this.board[position]){
            
            return []                                                   //there is no figure on the position
        }                                                               
        else if (this.board[position].isWhite===!this.isWhiteTurn){
            return []                                                   //can not move enemy's figure on other's turn
        }
        return getLegalMoves(position, this)                            //else: return the legal moves the figure could make
    }
}


/**
* return:["g7", "h6"] gets all legal moves for figure on position pos:"f7". does not check for King beeing in "Check"
*/
function getLegalMoves(pos, game){
    //
    let x = Number( pos.substring(0, 1).charCodeAt(0)-96 )
    let y = Number( pos.substring(1, 2) )
    let possibleMoves = []                                              // moves the chess figure could theoretically make
    let legalMoves = []                                                 // moves the chess figure can actually make
    let straightLineMove = null                                         //moves straight in line till end or enemy found
    let relativeToPositionMove = null                                   //moves that move relative fields +- to the x or y diretion
    
    //setup different movement constraints/types. pawn is hard coded seperatly
    if      (game.board[pos].type==="R") { straightLineMove = [[true,false,false,false],[false,true,false,false],[false,false,true,false],[false,false,false,true]]}
    else if (game.board[pos].type==="Q") { straightLineMove = [[true,false,false,false],[false,true,false,false],[false,false,true,false],[false,false,false,true],[true,true,false,false],[false,true,true,false],[false,false,true,true],[true,false,false,true]]}
    else if (game.board[pos].type==="B") { straightLineMove = [[true,true,false,false],[false,true,true,false],[false,false,true,true],[true,false,false,true]]}
    else if (game.board[pos].type==="N") { relativeToPositionMove = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]}
    else if (game.board[pos].type==="K") { relativeToPositionMove = [[1,0],[1,1],[0,1],[-1,0],[-1,1],[1,-1],[0,-1],[-1,-1]]}


   //calculate valid movement options into legalMoves=[]
    if (game.board[pos].type==="P") {
        // pawn movement got special treatment
        legalMoves=getPawnMoves(game, x, y)
    }
    else if (straightLineMove){
        // handle straight movement if there is any
        for (direction of straightLineMove) {
            possibleMoves=getNextLinearMoves(game, x, y, direction)
            if (!(possibleMoves === null)){
                for (move of possibleMoves){
                    legalMoves.push(move)}                              // append all moves for each movement path/direction
                }
        }
    } else if(relativeToPositionMove) {
        // handle relative movement if there is any
        for (move of relativeToPositionMove){
            let xx = x + move[0]
            let yy = y + move[1]
            if((xx > 0 && xx < 9) && (yy > 0 && yy < 9) ){              // board edges
                possibleMoves.push(getBoardValue(xx, yy))}
        }
        for (move of possibleMoves){
            if(!game.board[move]){                                                                     
                legalMoves.push(move)                                   //space is free->possible movement
            } else if(game.board[move].isWhite===!game.isWhiteTurn) {     
                legalMoves.push(move)                                   //enemy figure on space -> capture possible
            }
        }
    }
    // :todo add castling special movements here if king selected + conditions met
    return legalMoves
}

/**
* returns : ["a2", "a3"] all moves in a line till end or figure is blocking. return null if none
*/
function getNextLinearMoves(game, x, y, direction){             //moves in a line to next board pice till end or figure // direction [top, right, down, left] ex topright:[true, true, false, false]
    let enemycolor = !game.isWhiteTurn
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
            let recursion=getNextLinearMoves(game,x, y, direction, enemycolor)
            if (recursion === null){
                return [getBoardValue(x, y)]}
            recursion.push(getBoardValue(x,y))
            return recursion
        }
    } return null
}

/**
* returns : ["a1", "a2"] all possible moves selected pawn on position x,y can make including captures (& en passant :todo)
*/
function getPawnMoves(game, x, y){
    // set direction up/down +/-1 as forward
    let legalMoves = []
    let ydirection = -1
    if (game.isWhiteTurn) {ydirection=1}
    // check if there is a figure to capture on diagonals in movement direction
    for (xoffset of [1,-1]){
        let pos = getBoardValue(x+xoffset, y+ydirection)
        let figureToCapture = game.board[pos]
        if(figureToCapture && figureToCapture.isWhite===!game.isWhiteTurn){
            legalMoves.push(pos)
        }
    }
    // check if can move normally
    let pos = getBoardValue(x, y+ydirection)                 //check if can move 1 steps
    if (!game.board[pos]){
        legalMoves.push(pos)
        let extraMoveReq = 7                                //check if can move 2 steps
        if (game.isWhiteTurn) {extraMoveReq=2}  
        if (y=== extraMoveReq){             
            pos = getBoardValue( x, y+2*ydirection )
            if (!game.board[pos]){
                legalMoves.push(pos)
            }
        }
    }
    //check for en passant zug
    let previousMove = game.moveHistory[game.moveHistory.length - 1]
    let previousX = previousMove.substring(1,2).charCodeAt(0)-96        //substring that stores a-h position then string->number
    //check if last move went from x7->x5
    if(game.isWhiteTurn && /P\w7\w5/.test(previousMove)){    
        //check if selected pawn is in position to capture it
        if (y===5 && (x===previousX-1) || (x===previousX+1)){
            pos = getBoardValue( previousX, 6 )
            legalMoves.push(pos)
        }
    } else if (!game.isWhiteTurn && /P\w2\w4/.test(previousMove)){
        //check if selected pawn is in position to capture it
        if (y===4 && (x===previousX-1) || (x===previousX+1)){
            pos = getBoardValue( previousX, 5 )
            legalMoves.push(pos)
        }
    }
    return legalMoves
}
/**
* turn x:int y:int choordiantes into chess noation 1,2 -> a2 : string
*/
function getBoardValue(x, y){
    return String(String.fromCharCode(96+x) + y)
}

module.exports = GameState


//// test stuff :todo remove all above this when finished
const game = new GameState


game.tryMove("Pc2c4")
game.tryMove("Pd7d6")
game.tryMove("Pc4c5")
game.tryMove("Qd8h4")
game.tryMove("Pb7b5")
game.terminalBoard()
console.log(game.getMoves("c5"))

let test = []
console.log(test.includes("a4"))
//console.log(game.getMoves("f5"))
//console.log(game.getBoard())
//devMove()

//readline & input for testing api moves quickly :todo remove this later
function devMove(){
    let readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    readline.question('get moves for: ', name => {
        console.log(game.getMoves(name))        
        readline.close();
        devMove()
    })
}



