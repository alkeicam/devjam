const dotenv = require('dotenv');
// Set up Global configuration access
dotenv.config();
const WebSocket = require('ws');

const server = new WebSocket.Server({
  port: process.env.WS_PORT || 5002,
  path: "/ws"
});

server.on("connection",(socket,message)=>{
    socket.on('error', console.error);

    socket.on('message', (msg)=>{
        
        
        const data = _socketDecodeObjectMsg(msg);

        console.log(data.a);
        // console.log(msg.isBinary);

        ;
        
        
        _socketSendObject(socket, {m:"malina"})
    });

})

function _socketSendObject(socket, object){
    const msg = JSON.stringify(object);
    socket.send(msg);
}

function _socketDecodeObjectMsg(msg){
    const data = JSON.parse(msg.toString('utf-8'));
    return data;
}