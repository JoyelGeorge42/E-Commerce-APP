const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat');
router.get('/chat-msg',chatController.getAllChat);
module.exports = router;