const express = require('express'); // Express 모듈을 불러옵니다.
const socketio = require('socket.io'); // Socket.IO 모듈을 불러옵니다.
const http = require('http'); // HTTP 모듈을 불러옵니다.
const cors = require('cors'); // CORS 모듈을 불러옵니다.

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users'); // 사용자 관리 함수를 불러옵니다.

const router = require('./router'); // 라우터를 불러옵니다.

const app = express(); // Express 앱을 생성합니다.
const server = http.createServer(app); // HTTP 서버를 생성합니다.

// CORS 설정
app.use(cors()); // 모든 출처에 대해 CORS를 허용합니다.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 출처에 대해 허용합니다.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 허용하는 HTTP 메서드를 설정합니다.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 허용하는 헤더를 설정합니다.
  next(); // 다음 미들웨어로 넘어갑니다.
});

// Socket.IO 초기화 시 CORS 설정
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000', // React 앱이 실행되는 주소
    methods: ['GET', 'POST'], // 허용하는 HTTP 메서드
    allowedHeaders: ['Content-Type'], // 허용하는 헤더
    credentials: true // 자격 증명을 허용합니다.
  }
});

app.use(router); // 라우터를 사용합니다.

io.on('connect', (socket) => { // 클라이언트가 소켓에 연결되었을 때 실행됩니다.
  socket.on('join', ({ name, room }, callback) => { // 'join' 이벤트를 수신합니다.
    const { error, user } = addUser({ id: socket.id, name, room }); // 사용자를 추가합니다.

    if (error) return callback(error); // 오류가 있으면 콜백으로 오류를 전달합니다.

    socket.join(user.room); // 사용자를 해당 방에 참여시킵니다.

    socket.emit('message', { user: '시스템', text: `${user.name}, welcome to room ${user.room}.` }); // 시스템이 환영 메시지를 보냅니다.
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` }); // 다른 사용자들에게 참여 메시지를 보냅니다.

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) }); // 방 정보와 사용자 목록을 업데이트합니다.

    callback(); // 콜백을 실행합니다.
  });

  socket.on('sendMessage', (message, callback) => { // 'sendMessage' 이벤트를 수신합니다.
    const user = getUser(socket.id); // 사용자를 가져옵니다.

    if (user) {
      io.to(user.room).emit('message', { user: user.name, text: message }); // 메시지를 해당 방에 전송합니다.
    }

    callback(); // 콜백을 실행합니다.
  });

  socket.on('disconnect', () => { // 소켓 연결이 끊어졌을 때 실행됩니다.
    const user = removeUser(socket.id); // 사용자를 제거합니다.

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` }); // 다른 사용자들에게 퇴장 메시지를 보냅니다.
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) }); // 방 정보와 사용자 목록을 업데이트합니다.
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`)); // 서버를 실행합니다.
