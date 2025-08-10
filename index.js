const io = require('socket.io')(8000, {
  cors: {
    origin: "http://127.0.0.1:5500",  // or "*"
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', socket => {
  socket.on('new-user-joined', name => {
    users[socket.id] = name;

    // Notify others that this user joined
    socket.broadcast.emit('user-joined', name);

    // 👇 Send all existing users' names to the newly joined user
    const otherUsers = Object.values(users).filter(n => n !== name);
    socket.emit('existing-users', otherUsers);
  });

  socket.on('send', message => {
    socket.broadcast.emit('receive', {
      message: message,
      name: users[socket.id]
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('left', users[socket.id]);
    delete users[socket.id];
  });
});
