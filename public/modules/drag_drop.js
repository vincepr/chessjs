/** adds Drag and Drop Event-Listeners */

let session = null
var dragImg = null
export default class DragDrop{
    constructor(se){
        session = se
    } 

    //create the Listeners for drag and drop Events
    DndDroppers(img){
        img.addEventListener('dragstart', handleDragStart, false)
        img.addEventListener('dragend', handleDragEnd, false);
    }
    DndMovement(img){
        img.addEventListener("dragover", (event)=>{event.preventDefault()}, false)      // need .preventDefault() here to overwrite browser defaults and make item "drop-able"
        img.addEventListener("drop", handleDropMove, false)
    }
    DndPawnPromote(img){
        img.addEventListener("dragover", (event)=>{event.preventDefault()}, false)      // need .preventDefault() here to overwrite browser defaults and make item "drop-able"
        img.addEventListener("drop", handleDropPromote, false)
    }
}


//handle beeing the item that gets something droped into it:

function handleDropMove(e) {
    e.preventDefault()
    let moveMarker = e.target
    session.clickedMovement(moveMarker)
}

function handleDropPromote(e) {
    e.preventDefault()
    let moveMarker = e.target
    session.clickedPawnPromote(moveMarker)
}


// beeing the dragged element itself

function handleDragStart(e){
    let clickedElement = e.target
    session.clickedFigure(clickedElement)

    // center a Image on the mouse to avoid default drag-behaviour:
    dragImg = document.createElement("img");
    dragImg.src=clickedElement.src
    dragImg.className="figure"
    //drawImg needs to be "visible" se we just move it out of frame:
    dragImg.style.position = "absolute"
    dragImg.style.top = "-1000px"           
    document.body.appendChild(dragImg)
    e.dataTransfer.setDragImage(dragImg, dragImg.width/2, dragImg.height/2)
}

function handleDragEnd(){
    //clean up the Img used for the drag-effect.
    if (dragImg){dragImg.remove()}
}




/******************************************************
 * 
 *      example to support 
 *      drag and drop mobile
 *      without polyfilling it found here:
 * 
 *      https://github.com/deepakkadarivel/DnDWithTouch/blob/master/main.js
 * 
 * *****************************************************
 */