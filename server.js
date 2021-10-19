const express = require('express');
const socket = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();

const tasks = [];

app.use(cors());

app.use(express.static(path.join(__dirname, "/client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build/index.html"));
});

app.use((req, res) => {
    res.status(404).send({message: '404 not found...'});
});

const server = app.listen(process.env.PORT || 4000, () => {
  console.log('Server is running on port: 4000');
});

const io = socket(server);

io.on('connection', (socket) => { 
  io.to(socket.id).emit('updateData', tasks); 

  socket.on('addTask', (id,name) => { 
    tasks.push({id, name}); 
    socket.broadcast.emit('addTask', id, name);
  });

  socket.on('removeTask', (index) => { 
    tasks.splice(index,1);
    socket.broadcast.emit('removeTask', index);
  });

  socket.on('editTask', (id,name) => { 
    let index = tasks.findIndex(task => task.id === id);
    if(index != -1) {
      tasks[index] = {id, name}; 
      socket.broadcast.emit('editTask', id, name);
    }
  });

});