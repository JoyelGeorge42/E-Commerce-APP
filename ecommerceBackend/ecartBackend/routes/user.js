const express = require('express')
const router = express.Router();
const usercontroller = require('../controller/user');
const Authentication = require('../utils/auth');
const {autherizedRole} = require('../utils/authRole');

router.post('/register', usercontroller.registerUser);
router.post('/login', usercontroller.loginUser);
router.post('/password/forgot', usercontroller.forgotPassword);
router.put('/password/update',Authentication, usercontroller.updatePassword);
router.put('/password/reset/:token', usercontroller.resetPassword);
router.get('/me',Authentication, usercontroller.getUserDetails);
router.put('/me/update',Authentication, usercontroller.updateProfile);
router.get('/user/:id',Authentication,autherizedRole('admin'), usercontroller.getUser);
router.get('/users/download',Authentication,autherizedRole('admin'),usercontroller.download);
router.put('/user/:id',Authentication,autherizedRole('admin'), usercontroller.updateUserRole);
router.delete('/user/:id',Authentication,autherizedRole('admin'), usercontroller.deleteUser);
router.get('/users',Authentication,autherizedRole('admin'),usercontroller.getUsers);
router.get('/logout', usercontroller.logoutUser);
module.exports = router;

