
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


   
    if (game.board[pos].type==="P") {
    // pawn movement got special treatment
    }
    else if (straightLineMove){
    // all straight moves if there are any
        for (direction of straightLineMove) {
            legalMoves=getNextLinearMoves(game, x, y, direction)
            if (!(possibleMoves === null)){
                for (move of possibleMoves){legalMoves.push(move)}
                }
        }
    } else if(relativeToPositionMove) {
    // all relative moves if there are any
        for (move of relativeToPositionMove){
            let xx = x + move[0]
            let yy = y + move[1]
            if((xx > 0 && xx < 9) && (yy > 0 && yy < 9) ){              // board edges
                possibleMoves.push(getBoardValue(xx, yy))}
        }
        for (move of possibleMoves){
            if(!game.board[move]){                                                                      
                legalMoves.push(move)
            }
            if(game.board[move]  &&  game.board[move].type) {       
                legalMoves.push(move)
            }
        }
    }


    return legalMoves
}


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
function getBoardValue(x, y){                                   // 1,1->"A1"  3,1->"C1"
    return String(String.fromCharCode(96+x) + y)
}
*/































const session = new GameState
var selectedMoves = []
init_board()
redraw_figures()

function init_board() {
    for (let number=0; number<8; number++){                      //set up chess board grid
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

function redraw_figures(){
    let board=session.board          // stored in settings.json {"A1": [isBlack, "rook"]}
    console.log(board)
    for (var pos in board){                      //fill in figures
        let img = document.createElement("img")
        let figure_type=board[pos].type
        let figure_col= "black_figure"
        if (figure_type==="B"){figure_type="bishop"}
        if (figure_type==="P"){figure_type="pawn"}
        if (figure_type==="R"){figure_type="rook"}
        if (figure_type==="Q"){figure_type="queen"}
        if (figure_type==="N"){figure_type="knight"}
        if (figure_type==="K"){figure_type="king"}

        img.src=`img/b_${figure_type}.png`
        if (board[pos].isWhite){
            img.src=`img/w_${figure_type}.png`
            figure_col="white_figure"
        }
        img.id=figure_type
        img.className="figure"
        img.onclick = () => { handleClick(img) }
        document.getElementById(pos).appendChild(img)
    }
}

function handleClick(clickedElement){
    let playercolor = "black_figure"
    let enemycolor = "white_figure"
    if (session.isWhiteTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}
    
    if (clickedElement.className==="move_marker"){
        if(allFigures[clickedElement.parentElement.id]){
            //move while capturing
            let img = selectedMoves["img"]
            let targetCell = clickedElement.parentElement
            movesLog.push(img.parentElement.id + ">" + targetCell.id+" captured: "+allFigures[targetCell.id]["figure_type"])
            targetCell.removeChild(allFigures[targetCell.id]["img"])
            allFigures[targetCell.id] = allFigures[img.parentElement.id]
            delete allFigures[img.parentElement.id]
            targetCell.appendChild(img)
        } else{
            // move without capture
            let img = selectedMoves["img"]
            let targetCell = clickedElement.parentElement
            movesLog.push(img.parentElement.id + ">" + targetCell.id)
            allFigures[targetCell.id] = allFigures[img.parentElement.id]
            delete allFigures[img.parentElement.id]
            targetCell.appendChild(img)
        }
        removeElementsByClassName("move_marker")
        selectedMoves = null
        endTurn()
    } else {
        removeElementsByClassName("move_marker")                
        selectedMoves = {                                       // store selected img and all legal moves  :todo check if this is even beneficial/necessary
            "moves" : session.getMoves(String(clickedElement.parentElement.id)),
            "img" : clickedElement,
        }
        for (move of selectedMoves["moves"]){                   //create move_markers on board
            let img = document.createElement("img")
            img.src = `img/marker.png`
            img.className="move_marker"
            img.onclick = () => { handleClick(img) }
            document.getElementById(move).appendChild(img)
        }

    }
}

function removeElementsByClassName(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}