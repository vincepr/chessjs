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
            letter_value=String.fromCharCode(65+letter)         //0=A, 1=B, 2=C...
            div.innerHTML=letter_value+(8-number)
            div.id=String(letter_value)+String(8-number)
            if (letter % 2){                                    // Color-pattern the Chessboard
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

    if (clickedElement.className===playercolor){
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
        // :todo set new position in allFigures
    }
}


function removeElementsByClassName(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}


function getLegalMoves(img){                             
    let pos = img.parentElement.id
    //change to xy coords->
    let y = Number( pos.substring(1, 2) )
    let x = Number( pos.substring(0, 1).charCodeAt(0)-64 )      //character to int A ->65-64=1 B=2...
    let type = img.id
    let enemycolor= "white_figure"
    if (isWhitesTurn){enemycolor="black_figure"}
    let possibleMoves = []
    let legalMoves = []

    if(type==="pawn"){
        if (isWhitesTurn){
            if (y===2){possibleMoves.push(getBoardValue(x, y+2))}   //firstmove
            possibleMoves.push(getBoardValue(x, y+1)                //normal move
            )
        }else {
            if (y===7){possibleMoves.push(getBoardValue(x, y-2))}
            possibleMoves.push(getBoardValue(x, y-1))
        }
        for (i of possibleMoves){
            if(allFigures[i]){
                if (i===0){possibleMoves=[]}
                else{possibleMoves.pop()}
            }
        }
        // :todo pawn cant capture (do last seems special compared to others)
        legalMoves = possibleMoves
    }
    else if(type==="rook") {
        let alldirections = [[true,false,false,false],[false,true,false,false],[false,false,true,false],[false,false,false,true]]
        for (direction of alldirections) {
            possibleMoves=getNextLinearMoves(x, y, direction, enemycolor)
            if (!(possibleMoves === null)){
                for (move of possibleMoves){legalMoves.push(move)}
                }
            
        }
    }
    else if(type==="knight") {
        let allmoves = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]
        for (i in allmoves){
            let xx = x + allmoves[i][0] 
            let yy = y + allmoves[i][1]
            if((xx > 0 && xx < 9) && (yy > 0 && yy < 9) ){
                possibleMoves.push(getBoardValue(xx, yy))}
        }
        for (i in possibleMoves){
            if(!allFigures[possibleMoves[i]]){                                                                      //isFree -> move
                legalMoves.push(possibleMoves[i])
            }
            if(allFigures[possibleMoves[i]]  &&  allFigures[possibleMoves[i]]["figure_color"]===enemycolor) {       //enemyFigure -> capture
                legalMoves.push(possibleMoves[i])
            }
        }
    }
    else if(type==="bishop") {
        let alldirections = [[true,true,false,false],[false,true,true,false],[false,false,true,true],[true,false,false,true]]
        for (direction of alldirections) {
            possibleMoves=getNextLinearMoves(x, y, direction, enemycolor)
            if (!(possibleMoves === null)){
                for (move of possibleMoves){legalMoves.push(move)}
                }
            
        }
    }
    else if(type==="queen") {
        let alldirections = [[true,false,false,false],[false,true,false,false],[false,false,true,false],[false,false,false,true],[true,true,false,false],[false,true,true,false],[false,false,true,true],[true,false,false,true]]
        for (direction of alldirections) {
            possibleMoves=getNextLinearMoves(x, y, direction, enemycolor)
            if (!(possibleMoves === null)){
                for (move of possibleMoves){legalMoves.push(move)}
                }
            
        }
    }
    else if(type==="king") {}
    if (legalMoves.length>0) {return legalMoves}
    return []       //:todo delete this default line at the end!
}

function inRange(i){
    if(i > 0 && i < 9){return true}
    return false
}

function getNextLinearMoves(x, y, direction, enemycolor){       //moves in a line to next board pice till end or figure // direction [top, right, down, left] ex topright:[true, true, false, false]
    let xx=x
    let yy=y
    if (direction[0]){yy+=1}
    if (direction[1]){xx+=1}
    if (direction[2]){yy-=1}
    if (direction[3]){xx-=1}
    if (inRange(xx) && inRange(yy)){
        if (allFigures[getBoardValue(xx,yy)]){
                //figure is blocking
            if (allFigures[getBoardValue(xx,yy)]["figure_color"]===enemycolor){
                return [getBoardValue(xx,yy)] 
            }
            else{
                return null 
            }
        }else{  //no Figure there so do recursion
            let recursion=getNextLinearMoves(xx, yy, direction, enemycolor)
            if (recursion === null){
                return [getBoardValue(xx, yy)]}
            recursion.push(getBoardValue(xx,yy))
            return recursion
        }
    } return null

}

function getBoardValue(x, y){                        // 1,1->"A1"  3,1->"C1"
    return String(String.fromCharCode(64+x) + y)
}

function endTurn(){
    isWhitesTurn = !isWhitesTurn
}