const express=require('express');
const http=require('http');
const socketio=require('socket.io');
const path=require('path');
const crypto=require('crypto');

const app=express();

app.use('/',express.static(path.join(__dirname,'public')));

const server=http.createServer(app);
const io=socketio(server);

const sessionIds=[];

io.on('connection',(socket => {

   socket.on('draw',(data)=>{

       // Send to all clients except sender
       socket.broadcast.emit('draw', (data));

   });

   socket.on('createSession',()=>{

       // Create a new session

       // 1. Create a new sessionId
        const newId=crypto.randomBytes(2).toString("hex");

       // 2. Add it to list of sessionIds
       sessionIds.push(newId);

       // 3. Join the socket which initiated this req to this room
       socket.join(newId);

       // 4. Emit a new event for front-end
       socket.emit('sessionCreated',{

           sessionId:newId

       });


   });

   // Same as 'draw' just emit to only room members
   socket.on('drawInSession',(data)=>{

       socket.broadcast.to(data.sessionId).emit('drawInSession',data);


   });

    // Joining a room
    socket.on('joinSession',(data)=>{

        let sessionId=data.sessionId;

        // Check if it's a valid sessionId in sessionIds array
        if(sessionIds.includes(sessionId)){

            // Join the room
            socket.join(sessionId);

            socket.emit('joinSession',(data));

        }


    })

}));

server.listen(process.env.PORT || 4444,()=>{
    console.log('Server started on http://localhost:4444');
});