import net = require('net');//import socket module
import ip = require('ip');

// define address interface
interface Address { port: number; family: string; address: string; };

// create socket server
let server:net.Server = net.createServer();

// array of connections
let connections: net.Socket[] = [];

// when the server is connected
server.on('connection', function(socket:net.Socket){

    // broadcast to all other people
    function broadcast(name:String, message:String){
        connections.forEach(function(thing:net.Socket) {
            // Only send to other people
            if (thing !== socket) {
                thing.write('[' + name + '] ' + message + '\n');
            }
        });
    }

    console.log('connected :' + socket.remoteAddress);
    connections.push(socket);

    socket.write("What is your name?");
    let name: String = '';

    // when data is sent to the socket
    socket.on('data', function(data){
        let message:String = data.toString();
        if(message.length === 0){
            socket.write('(type something and hit return)\n');
            return;
        }

        // Sets name
        if (!name) {
            //truncate name to 10 chars
            name = data.toString().substr(0, 10);

            socket.write('Hello ' + name + '!\n');
            socket.write('Welcome to the chat room, ' + name + '!\n');
            socket.write('There are ' + connections.length + ' people here.\n');
            socket.write("Type messages, or type 'exit' at any time to leave.\n");
        }

        // close or post message
        else {
            // close the connection
            if ('exit' === message) {
                socket.end();
            }
            else {
                // broadcast the message to other clients
                broadcast(name, message);
            }
        }
    });
});

//when the server starts listening...
server.on('listening', function() {
    //output to the console the port number on which we are listening
    var addr:Address = server.address();
    console.log(addr.address);
    console.log('server listening on port %d', addr.port);
});

//start the server
server.listen({
  host: ip.address(),
  port: 3000
});