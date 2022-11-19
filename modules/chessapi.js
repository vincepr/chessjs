/**
 * load class ChessGame and interact only with it by using:
 * .getMoves("a1")->["a2","a3","a4"]   
 * .tryMove("Ra1a4")->returns move if made or false if not possible. returns "... gameover:draw"   "... gameover:winnerIsWhite:true"  
 * .getBoard()->{"a1":{type: "R", isWhite:false}} 
 * 
 * using chess-notation like R: Rook, N: Knight, B: Bishop, Q:Queen, K:King, P:Pawn (pawn added) 
 * 
 */


/** .getMoves("a1") -> ["a2","a3","a4"]   
 *  .tryMove("Ra1a4") -> bool     
 *  .getBoard() -> {"a1":{type: "R", isWhite:false}}  
 *  .getMoveHistory() -> ["start", "Pb2b3", "gameover:draw"] */
export default class ChessGame {
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
        this.moveHistory = ["start"]
    }


    // visual output of current board state in console. only for debugging/coding
    terminalBoard(){ 
        console.log("------------------")
        console.log("--AABBCCDDEEFFGGHH".toLowerCase())
        for (let number=1; number<9; number++){                      
            let lineString = String(9-number)+"-"
            for (let letter=0; letter<8; letter++){
                let letter_value = String.fromCharCode(97+letter)   //97="a"
                if (this.board[letter_value+String(9-number)]){
                    let col ="b"
                    if (this.board[letter_value+String(9-number)].isWhite) {col ="w"}
                    lineString+=this.board[letter_value+String(9-number)].type+col
                }else{lineString+="[]"}
            }
            lineString+="-"+String(9-number)
            console.log(lineString)
        }
        console.log("--AABBCCDDEEFFGGHH".toLowerCase())
        console.log("------------------")
    }


    getMoveHistory(){return this.moveHistory}


    getBoard(){return this.board}


    /** move : string | like "Pe7f8x=N+" ChessNotationLike). */
    tryMove(move){
        let moveFrom = move.substring(1,3)
        let moveTo = move.substring(3,5)
        if (this.moveHistory.slice(-1)[0].includes("gameover")){        
            // game has already ended
            return false
        }
        else if(this.getMoves(moveFrom).includes(moveTo)){              // move is legal move
            //work on clone-object till we know king is not in check after move
            let clone = structuredClone(this)                           // clone in case we "rollback" at the end if king is in check afer move
            makeMove(clone, move)
            clone.moveHistory.push(move)                                // log move made to history
            clone.isWhiteTurn=!clone.isWhiteTurn
            if (isKingInCheck(clone)) {
                // own king is in check -> cant do move
                // console.log(":dev log | king in self-check move not made: "+move)
                return false
            }               
            // make move permament 
            this.isWhiteTurn = clone.isWhiteTurn
            this.moveHistory = clone.moveHistory
            this.board = clone.board
            // console.log(":dev log  ||: made move: "+move)

            // check for draw by repetition
            if (checkDrawByRepetiton(clone.moveHistory)){
                this.moveHistory.push("gameover:draw") 
                move+="gameover:draw"
                // console.log(":dev log ||"+move)
                return move
            }

            // did we put enemy king in check?
            clone.isWhiteTurn = !clone.isWhiteTurn
            if (isKingInCheck(clone)){
                move+="+"
                clone.isWhiteTurn = !clone.isWhiteTurn
                if (isNoPossibleMovesLeft(clone)){
                    this.moveHistory.push("gameover:winnerIsWhite:"+!this.isWhiteTurn) 
                    move+="gameover:winnerIsWhite"+!this.isWhiteTurn
                }
                // console.log(":dev log ||: enemy King put in check "+move)
            }
            return(move)    // return the move we just made
        } else {
            // move is not a possible move the figure can make
            // console.log(":dev log  ||: impossible move tried: "+ move)
            return false
        }
    }


    getMoves(position){
        if (this.moveHistory.slice(-1)[0].includes("gameover")){       // game has already ended
            return []
        }
        else if (!this.board[position]){
            // console.log(":dev log  ||: no figure on field: "+position)
            return []                                                   //there is no figure on the position
        }                                                               
        else if (this.board[position].isWhite===!this.isWhiteTurn){
            // console.log(":dev log  ||: can't move enemys figure: "+position)
            return []                                                   //can not move enemy's figure on other's turn
        }
        return getLegalMoves(this,position)                            //else: return the legal moves the figure could make
    }
}



/** make Move on chessboard. does not check if possible/right/king-checked */
function makeMove(game, move) {
    if (move === "O-O" || move === "0-0"){
        //castle with h-side rook. black is row 8 white is 1
        let row = 8                         
        if (game.isWhiteTurn) { row=1 }
        delete game.board["e"+String(row)]
        game.board["f"+String(row)] = {type : "R", isWhite: game.isWhiteTurn}
        game.board["g"+String(row)] = {type : "K", isWhite: game.isWhiteTurn}
        delete game.board["h"+String(row)]
    } else if (move ==="O-O-O" || move === "0-0-0") {
        //castle with a-side rook. black is row 8 white is 1
        let row = 8                         
        if (game.isWhiteTurn) { row=1 }
        delete game.board["a"+String(row)]
        game.board["c"+String(row)] = {type : "K", isWhite: game.isWhiteTurn}
        game.board["d"+String(row)] = {type : "R", isWhite: game.isWhiteTurn}
        delete game.board["e"+String(row)]
    } else {
        //case "normal" movement with choordinates
        // innput like: "Pe7f8x=N+"  Pawn (P) moves from (e7) to (e8) while capturing (x) and promotes to a Knight (=N) setting enemy king in check (x)
        let moveFrom = move.slice(1,3)
        let moveType = game.board[moveFrom].type
        let moveTo = move.slice(3,5)
        let moveExtras = move.slice(5)
    
        //delete entry from where we moved from
        delete game.board[moveFrom]
        //fill new position
        game.board[moveTo] = {type : moveType, isWhite: game.isWhiteTurn}

        //special case Pawn Promotion to new Figure:
        if(moveExtras.includes("=")){
            //:todo extra checks here to see if figure is pawn and on right side of the border to avoid inputing wrong promotions/ cheats -> implement return false and breaking out of parent with false aswell
            let newFigureType = moveExtras.split('=')[1]
            newFigureType= newFigureType.slice(0,1)
            game.board[moveTo] = {type : newFigureType, isWhite: game.isWhiteTurn}
        }

        //check if en-passant move was made -> remove enemy pawn if yes
        let enpassMoveTo =isEnPassantPossible(game, moveFrom)
        if(enpassMoveTo && moveTo===enpassMoveTo){
            let previousMove = game.moveHistory[game.moveHistory.length - 1]
            previousMove = previousMove.slice(3,5)      // only get moveTo position Pa7a5->a5
            delete game.board[previousMove]
        }
    }
}



/**return:bool if the next player to make a turn is in checkmate because he has no moves left.*/
function isNoPossibleMovesLeft(game){
    // structuredClone() used earlier does not clone class only the Object-> cant call .tryMove() 
    //-> so a full new class instance is needed. To tryMoves() on without changing the original game
    let clone = new ChessGame
    clone.isWhiteTurn = game.isWhiteTurn
    clone.board = game.board
    clone.moveHistory = game.moveHistory
    for(let [x,y] in clone.board){
        if (clone.board[x+y].isWhite === clone.isWhiteTurn){
            let possibleMoves= clone.getMoves(x+y)
            if (possibleMoves.length > 0){
                for (let xy of possibleMoves){
                    // contruct move to try:
                    let move = String(clone.board[x+y].type)+String(x+y)+String(xy)
                    if (clone.tryMove(move)){
                        return false                        // found a move to get out of check
                    }
                }
            }
    }}
    
    return true
}



/**return true if king is in check. isOwnTurn:bool to decide if we are checking for the next turn
 * or if we are checking for this turn.
*/
function isKingInCheck(game){
    let kingToCheck = null
    // find the king (of opposite color):
    for (let [x,y] in game.board){
        let figure = game.board[x+y]
        if (figure.isWhite===!game.isWhiteTurn && figure.type==="K"){
            kingToCheck = x+y                                           
        }
    }
    // check if king could be captured 
    for (let [x,y] in game.board){
        let figure = game.board[x+y]
        if (figure.isWhite===game.isWhiteTurn && getLegalMoves(game, x+y).includes(kingToCheck)){
            return true                                                 // king is of enemy color to figure && king could be attacked
        }
    }
    return false                                                        // king is not in check
}



/** return:["g7", "h6"] gets all legal moves for figure on position pos:"f7". does not check for King beeing in "Check" */
function getLegalMoves(game, pos){
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

    //todo: king moves castling

   //calculate valid movement options into legalMoves=[]
    if (game.board[pos].type==="P") {
        // pawn movement got special treatment
        legalMoves=getPawnMoves(game, x, y)
    }
    else if (straightLineMove){
        // handle straight movement if there is any
        for (let direction of straightLineMove) {
            possibleMoves=getNextLinearMoves(game, x, y, direction)
            if (!(possibleMoves === null)){
                for (let move of possibleMoves){
                    legalMoves.push(move)}                              // append all moves for each movement path/direction
                }
        }
    } else if(relativeToPositionMove) {
        // handle relative movement if there is any
        for (let move of relativeToPositionMove){
            let xx = x + move[0]
            let yy = y + move[1]
            if((xx > 0 && xx < 9) && (yy > 0 && yy < 9) ){              // board edges
                possibleMoves.push(getBoardValue(xx, yy))}
        }
        for (let move of possibleMoves){
            if(!game.board[move]){                                                                     
                legalMoves.push(move)                                   //space is free->possible movement
            } else if(game.board[move].isWhite===!game.isWhiteTurn) {     
                legalMoves.push(move)                                   //enemy figure on space -> capture possible
            }
        }
    }
    // :todo add castling special movements here if king selected + conditions met
    // :todo indicate if Pawn can promote to queen, rook, knight, bishop
    return legalMoves
}



/** returns : ["a2", "a3"] all moves in a line till end or figure is blocking. return null if none */
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



/** returns : ["a1", "a2"] all possible moves selected pawn on position x,y can make including captures */
function getPawnMoves(game, x, y){
    // set direction up/down +/-1 as forward
    let legalMoves = []
    let ydirection = -1
    if (game.isWhiteTurn) {ydirection=1}
    // check if there is a figure to capture on diagonals in movement direction
    for (let xoffset of [1,-1]){
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

    //check for en passant move possible, return false if not, returns move otherwise
    pos = isEnPassantPossible(game,getBoardValue(x,y))                     
    if(pos){
        legalMoves.push(pos)
    }

    
    //:todo pawn promotes "Pa7a8=X" to R,Q,B,N special case not shown as "different" moves. Has to be handled in client so far.
    return legalMoves
}

/**check for en passant move possible, return false if not, returns move otherwise */
function isEnPassantPossible(game, pos){
    let x = Number( pos.substring(0, 1).charCodeAt(0)-96 )
    let y = Number( pos.substring(1, 2) )

    //check for en passant move
    let previousMove = game.moveHistory[game.moveHistory.length - 1]
    let previousX = previousMove.substring(1,2).charCodeAt(0)-96        //substring that stores a-h position then string->number
    //check if last move went from x7->x5
    if(game.isWhiteTurn && /P\w7\w5/.test(previousMove)){    
        //check if selected pawn is in position to capture it
        if (y===5 && ( (x===previousX-1) || (x===previousX+1) )  ){
            return getBoardValue( previousX, 6 )
            
        }
    } else if (!game.isWhiteTurn && /P\w2\w4/.test(previousMove)){
        //check if selected pawn is in position to capture it
        if ( y===4 && ( (x===previousX-1) || (x===previousX+1) )  ){
            return getBoardValue( previousX, 5 )
            
        }
    }
    return false
}



/** checks if last positions repeated 3 times returns:bool */
function checkDrawByRepetiton(moveHistory){
    let last9Moves = moveHistory.slice(-9)                      // last 9 moves
    let lastMoveP1= last9Moves.slice(-1)[0]                     // last move made by player
    let lastMoveP2= last9Moves.slice(-2)[0]                     // last move made by other player
    let repetitionsMadeP1 = last9Moves.filter(item => item == lastMoveP1).length
    let repetitionsMadeP2 = last9Moves.filter(item => item == lastMoveP2).length
    if (repetitionsMadeP1 === 3 && repetitionsMadeP2==2){       // position repeated 3 times
        return true
    }
    return false

}


/** turn x:int y:int choordiantes into chess noation 1,2 -> a2 : string */
function getBoardValue(x, y){
    return String(String.fromCharCode(96+x) + y)
}







//// test examples 

/*
// example moves for 3 fold repetition      //
let game = new ChessGame
game.tryMove("Pe2e4")
game.tryMove("Pf7f6")
game.tryMove("Qd1h5")
game.tryMove("Ke8f7")       // cant make move since it would be still in check
game.tryMove("Pg7g5")       // cant make move since it would be still in check
game.tryMove("Pg7g6")
game.tryMove("Qh5h4")
game.tryMove("Ke8f7")
game.tryMove("Qh4h5")
game.tryMove("Kf7e8")
game.tryMove("Qh5h4")
game.tryMove("Ke8f7")
game.tryMove("Qh4h5")
game.tryMove("Kf7e8")
game.tryMove("Qh5h4")
game.tryMove("Ke8f7")       // draw by repetiton -> game is over cant make this move
game.terminalBoard()
console.log(game.moveHistory)
game = null
*/



/*
//example moves for checkmate in 4 turns    //
let game = new ChessGame
game.tryMove("Pf2f3")
game.tryMove("Pe7e5")
game.tryMove("Pg2g4")
game.tryMove("Qd8h4")
game.tryMove("Pg4g5")      // cant move should be in checkmate
game.tryMove("Pg4g5")
game.terminalBoard()
console.log(game.moveHistory)
game= null

*/


/*
// example of getting checked a few times but no mate!      //
let game = new ChessGame
game.tryMove("Pe2e4")
game.tryMove("Pf7f5")
game.tryMove("Qd1h5")       //in Check
game.tryMove("Pg7g5")       // wrong move -> cant move if in check
game.tryMove("Pg7g6")       //forced 1 move left
game.tryMove("Qh5g6")       //in Check
game.terminalBoard()
console.log(game.moveHistory)
game = null

*/






// example of en passant moves:     //
let game = new ChessGame
game.tryMove("Pd2d4")
game.tryMove("Pa7a6")
game.tryMove("Pd4d5")       //in position to capture using en passant
game.tryMove("Pc7c5")       //could be captured this turn
console.log(game.getMoves("d5"))            // returns capture move c6->Pd5c6    
game.tryMove("Pa2a3")       
game.tryMove("Pe7e5")       // could be captured this turn but other one should not
console.log(game.getMoves("d5"))
game.tryMove("Pd5c6")      //turn to late so cant en passant left ->move fails
game.tryMove("Pd5e6")      //turn should capture en passant
game.terminalBoard()
console.log(game.moveHistory)
game = null
