'use strict';

const express = require('express');
const socketIO = require('socket.io');
const Parser = require('teltonika-parser-ex');
const binutils = require('binutils64');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  
  socket.on('data', function (data) {
    console.log('on data()')
    const buffer = data;
    let parser = new Parser(buffer);
    if (parser.isImei) {
        // const imei = data.toString();
        socket.write(Buffer.alloc(1, 1));
        console.log('Imei data received..')
    } else {
        console.log('AVL data received..')
        let avl = parser.getAvl();
        console.log(avl['records'][0]['gps']);
  
        let writer = new binutils.BinaryWriter();
        writer.WriteInt32(avl.number_of_data);
        let response = writer.ByteBuffer;
        socket.write(response);
    }
  });

  socket.on('error', function(error) {
    console.log("Error cocket IMEI. Bąd socket IMEI" + ":" + io.imei + " - " + error);
  });

  socket.on('close', function(error) {
  console.log("Connection closed. IMEI" + ":" + io.imei + " - " + error);
});
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
 

/* var gpstracker = require("gpstracker");
var server = gpstracker.create().listen(8000, function () {
  console.log('listening your gps trackers on port', 8000);
});

server.trackers.on("connected", function (tracker) {

  console.log("tracker connected with imei:", tracker.imei);

  tracker.on("help me", function () {
    console.log(tracker.imei + " pressed the help button!!".red);
  });

  tracker.on("position", function (position) {
    console.log("tracker {" + tracker.imei + "}: lat",
      position.lat, "lng", position.lng);
  });

  tracker.trackEvery(10).seconds();
}); */