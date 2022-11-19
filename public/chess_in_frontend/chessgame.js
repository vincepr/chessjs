import ChessGame from "../../modules/chessapi.js"

var game = new ChessGame
var selectedMoves

draw_board()
redraw_figures(game.getBoard())


function draw_board() {
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


function redraw_figures(board){
    removeElementsByClassName("figure")
    removeElementsByClassName("move_marker")
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
        img.onclick = () => { handleClick(img) }
        document.getElementById(pos).appendChild(img)
    }
}


function handleClick(clickedElement){
    let playercolor = "black_figure"
    let enemycolor = "white_figure"
    if (game.isWhiteTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}

    if (clickedElement.className==="move_marker"){
        let moveTo = String(clickedElement.parentElement.id)
        let move = selectedMoves["figureType"] + selectedMoves["moveFrom"] +  moveTo
        if (game.tryMove(move)){
            redraw_figures(game.getBoard())
        }
    } else{
        // draw possible moves
        removeElementsByClassName("move_marker")
        let moveFrom = String(clickedElement.parentElement.id)
        let moveTo = game.getMoves(moveFrom)
        selectedMoves = {                                       // store selected img and all legal moves  :todo check if this is even beneficial/necessary
            "moveTo" : moveTo,
            "moveFrom": moveFrom,
            "figureType": game.getBoard()[moveFrom].type,
            "img" : clickedElement,
        }
        for (let move of selectedMoves["moveTo"]){
            let img = document.createElement("img")
            img.src = `../img/marker.png`
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


function drawMoveHistory(arrObj){
    let list = document.getElementById("moveHistoryList");
    list.innerHTML=""
    arrObj.forEach((item)=>{
        let li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    })
}

// :todo pawn promotion
// :todo after game is won/drawn ->message!
// :todo css formating + restart button