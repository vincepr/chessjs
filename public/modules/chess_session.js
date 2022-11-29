import Chessgame from "./chess_logic.js"

/**
 * loads a instance of the Chessgame module and handles drawing the board, figures and onClick Events concerning the chess-board.
 * 
 */

export default class Session {
    constructor(data){              //{socket:this.socket, isTurn: this.isTurn}
        this.socket=data.socket
        this.isTurn=data.isTurn
        this.room=data.room
        this.game
        this.selectedMoves

        this.draw_board()
        this.startNewgame()
    }


    startNewgame(){
        this.game = new Chessgame
        this. redraw_figures()
    }


    redraw_figures(){
        let board = this.game.getBoard()
        removeHighlightedCells("lastmove")
        removeHighlightedCells("selectedmove")
        removeElementsByClassName("figure")
        removeElementsByClassName("move_marker")
        removeElementsByClassName("pawn_promote_marker")
        drawMoveHistory(this.game.getMoveHistory())
        drawPreviousMove(this.game.getMoveHistory())
        for (var pos in board){
            let img = document.createElement("img")
            let figure_type=board[pos].type
            let figure_col= "black_figure"
            if (figure_type==="B"){figure_type="bishop"}
            if (figure_type==="P"){figure_type="pawn"}
            if (figure_type==="R"){figure_type="rook"}
            if (figure_type==="Q"){figure_type="queen"}
            if (figure_type==="N"){figure_type="knight"}
            if (figure_type==="K"){figure_type="king"}
    
            img.src=`../img/b_${figure_type}.png`
            if (board[pos].isWhite){
                img.src=`../img/w_${figure_type}.png`
                figure_col="white_figure"
            }
            img.id=figure_type
            img.className="figure"
            img.onclick = () => { this.clickedFigure(img) }
            document.getElementById(pos).appendChild(img)
        }
    }


    clickedFigure(clickedElement){
        let board = this.game.getBoard()
        let moveFrom = String(clickedElement.parentElement.id)
        let moveTo = this.game.getMoves(moveFrom)
        let playercolor = "black_figure"
        let enemycolor = "white_figure"
        if (this.game.isWhiteTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}
        // remove old Markers
        removeElementsByClassName("move_marker")
        removeElementsByClassName("pawn_promote_marker")
        this.selectedMoves = {
            "moveTo" : moveTo,
            "moveFrom": moveFrom,
            "isWhite": this.game.getBoard()[moveFrom].isWhite,
            "figureType": this.game.getBoard()[moveFrom].type,
        }
        //add move hilights:
        removeHighlightedCells("selectedmove")
        document.querySelector(`#${this.selectedMoves.moveFrom}`).className+=" selectedmove"

        for (let moveTo of this.selectedMoves["moveTo"]){
            // special case Pawn promotion (is type pawn, is on border-edge and or right color):
            if(this.isPawnPromotionIsSelected(moveTo) ){
                // movement where pawn promotes
                let img = document.createElement("img")
                img.src = `../img/marker_special.png`
                img.className="move_marker"
                img.onclick = () => { this.clickedPawnPromote(img) }
                document.getElementById(moveTo).appendChild(img)  
            }
            // normal movement:
            else{
                let img = document.createElement("img")
                img.src = `../img/marker.png`
                if(board[moveTo]){img.src=`../img/marker_special.png`}      //can capture->special circle-marker
                img.className="move_marker"
                img.onclick = () => { this.clickedMovement(img) }
                document.getElementById(moveTo).appendChild(img)
            }
        }
    }
    
    
    clickedMovement(clickedElement){
        let playercolor = "black_figure"
        let enemycolor = "white_figure"
        if (this.game.isWhiteTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}
        let moveTo = String(clickedElement.parentElement.id)
        let move = this.selectedMoves["figureType"] + this.selectedMoves["moveFrom"] +  moveTo
    
        //special case pawn promotion:
        if(this.isPawnPromotionIsSelected(moveTo)){
            move = move+"="+clickedElement.id
        }
        // try to make move
        if (!this.isTurn){return}
        let answer= this.game.tryMove(move)
        if (answer){
            // special case this.game is over(after move):
            if (answer.includes("gameover")){
                this.gameisOver(answer)
            }
            // move was successful redraw board:
            this.socket.emit("moveMade",{move:move, room:this.room})
            this.redraw_figures()
            this.isTurn=!this.isTurn
        } else { console.log("error: illegal/wrong move tried")}
    
    }
    
    
    /** create selectors to choose what figure to promote the pawn to */
    clickedPawnPromote(clickedElement){
        let moveTo = String(clickedElement.parentElement.id)
        let moveFrom = this.selectedMoves["moveFrom"]
        removeElementsByClassName("move_marker")
        removeElementsByClassName("pawn_promote_marker")
        for (let figure_type of ["Q", "N", "B",  "R"]){
            let figure_name
            if (figure_type==="Q"){figure_name="queen"}
            if (figure_type==="B"){figure_name="bishop"}
            if (figure_type==="R"){figure_name="rook"}
            if (figure_type==="N"){figure_name="knight"}
            // create figure/option to promote to
            let img = document.createElement("img")
            img.src=`../img/b_${figure_name}.png`
            let figure_col= "black_figure"
            if (this.selectedMoves["isWhite"]){
                img.src=`../img/w_${figure_name}.png`
                figure_col="white_figure"
            }
            img.id=figure_type
            img.className="pawn_promote_marker"
            img.style="-50px;"
            img.onclick = () => { this.clickedMovement(img) }
            document.getElementById(moveTo).appendChild(img)
        }
    }


    isPawnPromotionIsSelected(moveTo){
        if (!this.selectedMoves){return false}
        return (this.selectedMoves["figureType"]==="P") && ( moveTo.includes("8") && this.selectedMoves["isWhite"] || moveTo.includes("1") && !this.selectedMoves["isWhite"])
    }


    otherMultiPlayerMadeMove(move){
        let answer= this.game.tryMove(move)
        if (answer){
            // special case this.game is over(after move):
            if (answer.includes("gameover")){
                this.gameisOver(answer)
            }
            // move was successful redraw board:
            this.isTurn=!this.isTurn
            this.redraw_figures()
        } else { console.log("error: illegal/wrong move tried")}
    }

    draw_board() {
        if (this.isTurn){
            //player is white
            for (let number=0; number<8; number++){                      
                for (let letter=0; letter<8; letter++){
                    let div = createCell(number, letter)
                    // color board:
                    if(number%2){
                        if(!(letter%2)){div.className="cell cellalt"}
                    }else{
                        if( (letter%2)){div.className="cell cellalt"}
                    }
                }
            }
        }else {
            //player is black
            for (let number=7; number>=0; number--){                      
                for (let letter=7; letter>=0; letter--){
                    let div = createCell(number, letter)
                    // color boardsocket
                    if(number%2){
                        if(!(letter%2)){div.className="cell cellalt"}
                    }else{
                        if( (letter%2)){div.className="cell cellalt"}
                    }
                }
            }
        }
    }
    gameisOver(answer){
        this.socket.emit("gameOver",{room: this.room, winner: answer})
    }
}


// Helper functions:

function removeHighlightedCells(cssClass){
    let cells = document.querySelectorAll(`.${cssClass}`)
    cells.forEach((cell)=>{
        let className = cell.className.replace(` ${cssClass}`, "")
        cell.className =className
    })
}


function removeElementsByClassName(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}


function drawMoveHistory(arrObj){
    let list = document.getElementById("moveHistoryList");
    if(arrObj.length>1){list.innerHTML=""}
    arrObj.forEach((item)=>{
        if (!(item==="start")){
            let li = document.createElement("li");
            li.innerText = item;
            list.appendChild(li);
        }
    })
}


function createCell(number, letter){
    let letter_value=""
    let div = document.createElement("div")
    div.className="cell"
    let boardElement = document.getElementById("board")
    boardElement.appendChild(div)
    letter_value=String.fromCharCode(65+letter)         //0=A, 1=B, 2=C...
    div.innerHTML=letter_value+(8-number)
    div.id=String(letter_value.toLowerCase())+String(8-number)
    return div
}


function drawPreviousMove(moveHistory){
    let pm = moveHistory[moveHistory.length-1]
    if (!(pm.includes("gameover") || pm.includes("start"))){
        let moveFrom = pm.slice(1,3)
        let moveTo = pm.slice(3,5)
        // add highlightedCells
        document.querySelector(`#${moveFrom}`).className+=" lastmove"
        document.querySelector(`#${moveTo}`).className+=" lastmove"    
    }
}