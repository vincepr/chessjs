/** adds Drag and Drop Event-Listeners */
// just some fast jank to test it out

let session = null
export default class DragDrop{
    constructor(se){
        session = se
    } 

    //create the Listeners for drag and drop Events
    DndDroppers(img){
        img.addEventListener('dragstart', handleDragStart, false)
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

    // center Img over drag-Event
    let dragImg = new Image()       
    dragImg.src=clickedElement.src

    e.dataTransfer.setDragImage(dragImg, dragImg.width/2, dragImg.height/2)

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