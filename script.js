var isWhitesTurn = true
var selectedMoves = null            
var allFigures = {}                 
var movesLog = []


init_start()
function init_start() {
    //set up chess board grid
    for (let number=0; number<8; number++){
        for (let letter=0; letter<8; letter++){
            let letter_value=""
            let div = document.createElement("div")
            div.className="cell"
            let boardElement = document.getElementById("board")
            boardElement.appendChild(div)
            if(letter===0){letter_value="A"}
            else if (letter===1){letter_value="B"}
            else if (letter===2){letter_value="C"}
            else if (letter===3){letter_value="D"}
            else if (letter===4){letter_value="E"}
            else if (letter===5){letter_value="F"}
            else if (letter===6){letter_value="G"}
            else if (letter===7){letter_value="H"}
            div.innerHTML="["+String(1+letter)+String(8-number)+"]"+" / "+letter_value+(8-number)
            div.id=String(letter_value)+String(8-number)
            // Color-pattern the Chessboard
            if (letter % 2){
                boardElement.children[letter+(number*8)-number%2].className="cell cellalt"
            }
        }
    }

    // load default positions from array
    // :todo laod from gamemode.json async 
    let start_positions = {
        "A8" : [true, "rook"],
        "B8" : [true, "knight"],
        "C8" : [true, "bishop"],
        "D8" : [true, "queen"],
        "E8" : [true, "king"],
        "F8" : [true, "bishop"],
        "G8" : [true, "knight"],
        "H8" : [true, "rook"],
        "A7" : [true, "pawn"],
        "B7" : [true, "pawn"],
        "C7" : [true, "pawn"],
        "D7" : [true, "pawn"],
        "E7" : [true, "pawn"],
        "F7" : [true, "pawn"],
        "G7" : [true, "pawn"],
        "H7" : [true, "pawn"],
        "A1" : [false, "rook"],
        "B1" : [false, "knight"],
        "C1" : [false, "bishop"],
        "D1" : [false, "queen"],
        "E1" : [false, "king"],
        "F1" : [false, "bishop"],
        "G1" : [false, "knight"],
        "H1" : [false, "rook"],
        "A2" : [false, "pawn"],
        "B2" : [false, "pawn"],
        "C2" : [false, "pawn"],
        "D2" : [false, "pawn"],
        "E2" : [false, "pawn"],
        "F2" : [false, "pawn"],
        "G2" : [false, "pawn"],
        "H2" : [false, "pawn"],
    }   // pos : [isblack, figurename]
    //fill figures in
    for (var position in start_positions){          //start_positions = {"A8" : [true, "rook"]...}
        let img = document.createElement("img")
        let figure_type=start_positions[position][1]

        if (start_positions[position][0]){
            img.src=`img/b_${figure_type}.png`
            img.className="black_figure"
        }
        else {
            img.src=`img/w_${figure_type}.png`
            img.className="white_figure"
        }
        img.id=figure_type
        img.onclick = () => { handleClick(img) }
        document.getElementById(position).appendChild(img)
        allFigures[position]=({
            "img": img,
            "figure_type": figure_type,
            "figure_color": img.className,
        })
    }
}


function handleClick(clickedElement){
    let playercolor = "white_figure"
    let enemycolor = "black_figure"
    if (!isWhitesTurn) {[playercolor, enemycolor] = [enemycolor, playercolor]}

    if (clickedElement.className===enemycolor){
        console.log("handleClick() -> enemy")
        // try to capture
    } else if (clickedElement.className===playercolor){
        //try to select
        removeElementsByClassName("move_marker")        // delete old markers
        selectedMoves = {                               // store selected img and all legal moves
            "moves" : getLegalMoves(clickedElement),
            "img" : clickedElement,
        }
        for (move of selectedMoves["moves"]){           //create move_markers on board
            let img = document.createElement("img")
            img.src = `img/marker.png`
            img.className="move_marker"
            img.onclick = () => { handleClick(img) }
            document.getElementById(move).appendChild(img)
        }

    } else if (clickedElement.className==="move_marker"){
        // try to move
        let img = selectedMoves["img"]
        let targetCell = clickedElement.parentElement
        movesLog.push(img.parentElement.id + ">" + targetCell.id)
        allFigures[targetCell.id] = allFigures[img.parentElement.id]
        targetCell.appendChild(img)
        removeElementsByClassName("move_marker")
        selectedMoves = null
        endTurn()
        // :todo set new position in allFigures
    }
}


function removeElementsByClassName(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}


function getLegalMoves(img){                             // -> ["D3", "D4"]
    let pos = img.parentElement.id
    //change to xy coords->
    let y = Number( pos.substring(1, 2) )
    let x = Number( pos.substring(0, 1).charCodeAt(0)-64 )      //character to int A ->65-64=1 B=2...
    let type = img.id
    let possibleMoves = []
    let legalMoves = []

    if(type==="pawn"){
        if (isWhitesTurn){
            if (y===2){possibleMoves.push(getBoardValue(x, y+2))}
            possibleMoves.push(getBoardValue(x, y+1))
        }else {
            if (y===7){possibleMoves.push(getBoardValue(x, y-2))}
            possibleMoves.push(getBoardValue(x, y-1))
        }
        //check if figure is blocking move
        for (move in possibleMoves) {
            if(allFigures[move]){
                console.log(blocked)
            }
        }
        legalMoves = possibleMoves
    }
    else if(type==="rook") {}
    else if(type==="knight") {}
    else if(type==="bishop") {}
    else if(type==="queen") {}
    else if(type==="king") {}
    if (legalMoves.length>0) {return legalMoves}
    return ["D3", "D4", "C3", "C4", "C5"]
}


function getBoardValue(x, y){                        // 1,1->"A1"  3,1->"C1"
    return String(String.fromCharCode(64+x) + y)
}


function endTurn(){
    isWhitesTurn = !isWhitesTurn
}



// :todo remove useless allFigures and dependencies






//debug stuff

/* console.log(allFigures)
for ((key) in allFigures){
    console.log(key)
} */