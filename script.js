const boardElement = document.getElementById("board")
var isWhitesTurn = true
var selectedFigure = null
var allFigures = {}

init_start()
function init_start() {

    // load default positions from array
    // :todo laod from gamemode.json async load of json
    let start_positions = {
        "1,8" : [true, "rook"],
        "2,8" : [true, "knight"],
        "3,8" : [true, "bishop"],
        "4,8" : [true, "queen"],
        "5,8" : [true, "king"],
        "6,8" : [true, "bishop"],
        "7,8" : [true, "knight"],
        "8,8" : [true, "rook"],
        "1,7" : [true, "pawn"],
        "2,7" : [true, "pawn"],
        "3,7" : [true, "pawn"],
        "4,7" : [true, "pawn"],
        "5,7" : [true, "pawn"],
        "6,7" : [true, "pawn"],
        "7,7" : [true, "pawn"],
        "8,7" : [true, "pawn"],
        "1,1" : [false, "rook"],
        "2,1" : [false, "knight"],
        "3,1" : [false, "bishop"],
        "4,1" : [false, "queen"],
        "5,1" : [false, "king"],
        "6,1" : [false, "bishop"],
        "7,1" : [false, "knight"],
        "8,1" : [false, "rook"],
        "1,2" : [false, "pawn"],
        "2,2" : [false, "pawn"],
        "3,2" : [false, "pawn"],
        "4,2" : [false, "pawn"],
        "5,2" : [false, "pawn"],
        "6,2" : [false, "pawn"],
        "7,2" : [false, "pawn"],
        "8,2" : [false, "pawn"],
    }   // pos : [black, picename]

    allFigures=start_positions

    //set grid background-colors and set up chess as array like grid with id [y,x]
    for (let number=0; number<8; number++){
        for (let letter=0; letter<8; letter++){
            //let letter_value=""
            //let div = document.createElement("div")
            //div.className="cell"

            if(letter===0){letter_value="A"}
            else if (letter===1){letter_value="B"}
            else if (letter===2){letter_value="C"}
            else if (letter===3){letter_value="D"}
            else if (letter===4){letter_value="E"}
            else if (letter===5){letter_value="F"}
            else if (letter===6){letter_value="G"}
            else if (letter===7){letter_value="H"}
            boardElement.children[letter+number*8].innerHTML="["+String(1+letter)+","+String(8-number)+"]"+" / "+letter_value+(8-number)
            boardElement.children[letter+number*8].id=String(1+letter)+','+String(8-number)
            // Color-pattern Chessboard
            if (letter % 2){
                boardElement.children[letter+(number*8)-number%2].className="cell cellalt"
            }
        }
    }

    //fill figures in
    for (var key in start_positions){
        let img = document.createElement("img")
        let figure_type=start_positions[key][1]

        if (start_positions[key][0]){
            img.src=`img/b_${figure_type}.png`
            img.className="black_figure"
        }
        else {
            img.src=`img/w_${figure_type}.png`
            img.className="white_figure"
        }
        img.id="figure_type"
        img.onclick = () => { handleClick(img) }
        document.getElementById(key).appendChild(img)
    }

    //document.getElementById(test[position]).style.background="red"
}

function handleClick(clickedElement){
    let playercolor = "white_figure"
    let enemycolor = "black_figure"
    if (!isWhitesTurn) {
        [playercolor, enemycolor] = [enemycolor, playercolor]
    }

    if(clickedElement.className===enemycolor){
        console.log("handleClick() -> enemy")
        // try to capture
    } else if (clickedElement.className===playercolor){
        console.log("handleClick() -> mine ->select")
        // try to select
        selectedFigure = getLegalMoves(clickedElement)
        for (move of selectedFigure["moves"]){
            let img = document.createElement("img")
            img.src=`img/marker.png`
            img.className="move_marker"
            img.onclick = () => { handleClick(img) }
            document.getElementById(move).appendChild(img)
        }

    } else {
        // try to move
    }
}

function getLegalMoves(id){
    let parent = id.parentElement.id
    let xy = [Number(parent.substring(0,1)), Number(parent.substring(2,3))]
    console.log(xy)
    return {"id":id , "moves": [ String(xy[0])] +","+String(2+xy[1])}
}