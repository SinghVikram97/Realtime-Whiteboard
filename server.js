const express=require('express');
const http=require('http');
const socketio=require('socket.io');
const path=require('path');

const app=express();

app.use('/',express.static(path.join(__dirname,'public')));

const server=http.createServer(app);
const io=socketio(server);

server.listen(4444,()=>{
    console.log('Server started on http://localhost:4444');
});