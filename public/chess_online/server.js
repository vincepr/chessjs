//imports:
import express from 'express'
import { createServer } from "http"
import { Server } from "socket.io"
// hacky way to get __dirname: //:todo check if able to remove this latler when serverin static-page.
import path from "path"
const __dirname = path.resolve()

//setup:
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {})
const PORT = process.env.PORT || 8080
var roomNr = 0


// load static page
app.use(express.static(__dirname + '/public/chess_online/public'))


// socket-connection with client
io.on("connection", (socket) => {
    //console.log(`new user connected`)


    // get list of rooms with players waiting to play:
    socket.on("getRooms", () =>{
        var availableRooms = []
        var rooms = io.sockets.adapter.rooms
        if (rooms) {
            for (let [key,value] of rooms) {
                if (key.includes("room")){
                    availableRooms.push({roomName: key, players: value})
                }
            }
        }
        socket.emit("sendRooms", availableRooms)
    })

    // create own Room/Session and "host" a game (white player):
    socket.on("createRoom", (data) => {
        socket.join("room-" + ++roomNr)
        socket.emit("newGame", {name: data.name, room: "room-"+roomNr})
    })

    // join as player 2 (black) into a room:
    socket.on("joinRoom", (data)=>{
        let room = io.of("/").adapter.rooms[data.room]      // or io.sockets.adapter.rooms with socket.io v 1.0 and forward
        if(room && room.length===1){
            socket.join(data.room)
            socket.broadcast.to(data.room).emit("player1", {})
            socket.emit("player2", {name: data.name, room: data.room})
        } else {
            socket.emit("err", {message: "Error, Room is full"})
        }
    })

    // broadcast successfull move to other player:
    socket.on("moveMade", (data)=>{
        socket.broadcast.to(data.room).emit("turnPlayed", {
            tile: data.tile,
            room: data.room
        })
    })

    // game has ended:
    socket.on("gameOver", function(data){
        socket.broadcast.to(data.room).emit("gameEnd", data)
    })
})


httpServer.listen(PORT, ()=>{console.log(`server running on ${PORT}`)})



