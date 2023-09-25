const mongoose = require('mongoose');
const validator  = require('validator');
const messageSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type:String,
      default: Date.now
    }
  });
  const Message = mongoose.model('Message', messageSchema);

module.exports = Message;