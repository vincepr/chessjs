//imports:
import express from 'express'
import { createServer } from "http"
import { Server } from "socket.io"

import path from "path"                 // hacky way to get __dirname: //:todo check if able to remove this latler when serverin static-page.
const __dirname = path.resolve()        // hacky way to get __dirname: //:todo check if able to remove this latler when serverin static-page.

//setup:
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {})
const PORT = process.env.PORT || 8080
var roomNr = 0

console.log(__dirname)
// load static page
app.use(express.static(__dirname + '/public'))


// socket-connection with client
io.on("connection", (socket) => {
    //console.log(`new user connected`)


    // get list of rooms with players waiting to play:
    socket.on("getRooms", () =>{
        var availableRooms = []
        var rooms = io.sockets.adapter.rooms
        if (rooms) {
            for (let [key,players] of rooms) {
                if (key.includes("room") && players.size<2){                // socket.io creates a default room for every Connection -> use "room" to filter those out.
                    availableRooms.push({roomName: key, players: players})
                }
            }
        }
        socket.emit("sendRooms", availableRooms)
    })

    // create own Room/Session and "host" a game (white player):
    socket.on("createRoom", (data) => {
        socket.join("room-" + ++roomNr)
        socket.emit("createdRoom", {name: data.name, room: "room-"+roomNr})
    })

    // join as player 2 (black) into a room:
    socket.on("joinRoom", (data)=>{
        let room = io.of("/").adapter.rooms.get(data.room)      // same as =io.sockets.adapter.rooms.get(data.room) with socket.io v 1.0 and forward. returns -> >map->set => use .size not .length on it 
        if(room && room.size===1){
            socket.join(data.room)
            let randomBool = Math.random() >= 0.5
            socket.broadcast.to(data.room).emit( "gamestart:player1", {isTurn:  randomBool, room: data.room})      //player waiting in the room
            socket.emit                        ( "gamestart:player2", {isTurn: !randomBool, room: data.room})      //player joining in
        } else {
            socket.emit("err", {message: "Error, Room is full"})
        }
    })

    // broadcast successfull move to other player:
    socket.on("moveMade", (data)=>{
        socket.broadcast.to(data.room).emit("enemyMovePlayed", data)
    })

    // game has ended:
    socket.on("gameOver", function(data){
        socket.leave(data.room)
        socket.emit("gameOverAPP", {winner: data.winner})
    })
})


httpServer.listen(PORT, ()=>{console.log(`server running on ${PORT}`)})



