
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

server.listen(8999, function () {
  console.log('server...');
})


let socket;

const users = [
  'main user',
];
const rooms = [
  'room 1',
  'room 2',
  'room 3',
];
const roomMessageList = [
  {
    room: 'room 1',
    roomMessages: [
      {
        userName: 'main user',
        message: 'Hello World',
      }
    ],
  },
  {
    room: 'room 2',
    roomMessages: [
      {
        userName: 'main user',
        message: 'Hello World 2',
      }
    ],
  },
  {
    room: 'room 3',
    roomMessages: [
      {
        userName: 'main user',
        message: 'Hello World 3',
      }
    ],
  }
]


app.get('/', (req, res) => {
  console.log('get /');
  res.send({ success: true });
});

app.get('/room', (req, res) => {
  res.send({
    success: true,
    result: rooms,
  });
});

app.get('/room/:id', (req, res) => {
  const { id: roomId } = req.params;
  const foundRoom = roomMessageList.find(item => {
    if (item.room === roomId) {
      return true;
    }
  });

  res.send({
    success: true,
    result: foundRoom,
  })
});

app.post('/room', (req, res) => {
  console.log(req.body);
  const { roomId } = req.body;

  rooms.push(roomId);
  roomMessageList.push({
    room: roomId,
    roomMessages: []
  });

  socket.emit('room created', roomId);

  res.send({
    success: true,
  })
});

socket = io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', param => {
    const { userName, message } = param;
    io.emit('chat message', param);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
// for (const room of rooms) {
//   console.log('create namespace ', room);
//   const namespace = io.of(`/${room}`);
//   namespace.on('chat', (param) => {
//     console.log('namespace');
//     namespace.emit(param);
//   });
// }

const namespace = io.of('/roro');
namespace.on('chat', (param) => {
  console.log('namespace');
  namespace.emit(param);
});