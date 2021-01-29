
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
const cors = require('cors');

app.use(cors());

server.listen(8080, function () {
  console.log('server...');
})

app.get('/', (req, res) => {
  console.log('get /');
  res.send({ success: true });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', msg => {
    console.log('get chate message ', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
