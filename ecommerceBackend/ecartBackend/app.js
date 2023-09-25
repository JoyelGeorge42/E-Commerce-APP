//previous code 
// const express = require('express');


//  const app = express()
//  app.use('/uploads', express.static('uploads'));
// module.exports =  app;

//new code
const express = require('express');
const socketIO = require('socket.io');
const Message = require('./model/user-chat'); 
const http = require('http');
const app = express();
const server = http.createServer(app);
app.use('/uploads', express.static('uploads'));
const io = socketIO(server,{
    cors: {
      origin: '*'
    }
  });
io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
    socket.on('key',(val)=>{
      socket.broadcast.emit('key',val+' is typing....');
    })
    socket.on('message',async (msg)=>{
      //emmiting message object to every 
      msg.date = new Date()
      io.emit('message',msg);
      //
        // Storing the message in the database
        try {
          const newMessage = new Message({
            name: msg.name, // You might need to adjust this based on your message structure
            role: msg.role, // Assuming the role is 'user' for socket messages
            message: msg.message, // Assuming the message text is available in msg.text
            date: msg.date, // Use the date from the message object
          });

          await newMessage.save();
          console.log('Socket message saved:', newMessage);
        } catch (error) {
          console.error('Error saving socket message:', error);
        }
        //////
    })
  })
//  const app = express()
module.exports =  {app,server};