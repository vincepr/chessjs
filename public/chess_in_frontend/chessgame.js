import ChessGame from "../../modules/chessapi.js"

var game
var selectedMoves
draw_board()
document.getElementById("gameOverButton").onclick = () => { startNewGame()}
startNewGame()

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

/** start a new game */
function startNewGame(){
    document.getElementById("gameoverMessage").innerHTML=""
    game = new ChessGame    // :todo make this server side 
    redraw_figures()
}


function redraw_figures(){
    let board = game.getBoard()
    removeElementsByClassName("figure")
    removeElementsByClassName("move_marker")
    removeElementsByClassName("pawn_promote_marker")
    drawMoveHistory(game.getMoveHistory())
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
        img.onclick = () => { clickedFigure(img) }
        document.getElementById(pos).appendChild(img)
    }
}

function isPawnPromotionIsSelected(moveTo){
    if (!selectedMoves){return false}
    return (selectedMoves["figureType"]==="P") && ( moveTo.includes("8") && selectedMoves["isWhite"] || moveTo.includes("1") && !selectedMoves["isWhite"])
}


function clickedFigure(clickedElement){
    let moveFrom = String(clickedElement.parentElement.id)
    let moveTo = game.getMoves(moveFrom)
    let playercolor = "black_figure"
    let enemycolor = "white_figure"
    if (game.isWhiteTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}
    // remove old Markers
    removeElementsByClassName("move_marker")
    removeElementsByClassName("pawn_promote_marker")
    selectedMoves = {
        "moveTo" : moveTo,
        "moveFrom": moveFrom,
        "isWhite": game.getBoard()[moveFrom].isWhite,
        "figureType": game.getBoard()[moveFrom].type,
    }
    for (let moveTo of selectedMoves["moveTo"]){
        // special case Pawn promotion (is type pawn, is on border-edge and or right color):
        if(isPawnPromotionIsSelected(moveTo) ){
            // movement where pawn promotes
            let img = document.createElement("img")
            img.src = `../img/marker.png`
            img.className="move_marker"
            img.onclick = () => { clickedPawnPromote(img) }
            document.getElementById(moveTo).appendChild(img)  
        }
        // normal movement:
        else{
            let img = document.createElement("img")
            img.src = `../img/marker.png`
            img.className="move_marker"
            img.onclick = () => { clickedMovement(img) }
            document.getElementById(moveTo).appendChild(img)
        }
    }
}


function clickedMovement(clickedElement){
    let playercolor = "black_figure"
    let enemycolor = "white_figure"
    if (game.isWhiteTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}
    let moveTo = String(clickedElement.parentElement.id)
    let move = selectedMoves["figureType"] + selectedMoves["moveFrom"] +  moveTo

    //special case pawn promotion:
    if(isPawnPromotionIsSelected(moveTo)){
        move = move+"="+clickedElement.id
    }
    // try to make move
    let answer= game.tryMove(move)
    if (answer){
        // special case game is over(after move):
        if (answer.includes("gameover")){
            document.getElementById("gameoverMessage").innerHTML=String(answer)
        }
        // move was successful redraw board:
        redraw_figures()
    } else { console.log("error: illegal/wrong move tried")}

}

/** create selectors to choose what figure to promote the pawn to */
function clickedPawnPromote(clickedElement){
    console.log("clicked pawnpromote")
    let moveTo = String(clickedElement.parentElement.id)
    let moveFrom = selectedMoves["moveFrom"]
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
        if (selectedMoves["isWhite"]){
            img.src=`../img/w_${figure_name}.png`
            figure_col="white_figure"
        }
        img.id=figure_type
        img.className="pawn_promote_marker"
        img.style="-50px;"
        img.onclick = () => { clickedMovement(img) }
        document.getElementById(moveTo).appendChild(img)
    }
    
    

}


function removeElementsByClassName(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}


function drawMoveHistory(arrObj){
    let list = document.getElementById("moveHistoryList");
    list.innerHTML=""
    arrObj.forEach((item)=>{
        let li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    })
}