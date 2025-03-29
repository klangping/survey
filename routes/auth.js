const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取当前用户信息 (需要认证)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;