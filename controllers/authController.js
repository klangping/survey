const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// 生产环境应该使用环境变量，这里简化处理
const jwtSecret = 'survey-system-secret-key';
const jwtExpiresIn = '1d';

module.exports = {
  /**
   * 用户注册
   */
  async register(req, res) {
    const { username, password } = req.body;
    
    // 1. 验证输入
    if (!username || !password) {
      return res.status(400).json({ 
        error: '用户名和密码不能为空' 
      });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        error: '用户名长度必须在3-20个字符之间' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: '密码长度不能少于6个字符' 
      });
    }

    try {
      // 2. 检查用户名是否已存在
      const [users] = await pool.query(
        'SELECT id FROM users WHERE username = ?', 
        [username]
      );
      
      if (users.length > 0) {
        return res.status(400).json({ 
          error: '用户名已存在' 
        });
      }
      
      // 3. 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 4. 创建用户
      const [result] = await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      // 5. 生成JWT令牌
      const token = jwt.sign(
        { id: result.insertId }, 
        jwtSecret, 
        { expiresIn: jwtExpiresIn }
      );
      
      // 6. 返回响应
      res.json({ 
        success: true,
        token,
        user: { 
          id: result.insertId, 
          username 
        }
      });
      
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ 
        error: '注册失败，请稍后再试' 
      });
    }
  },

  /**
   * 用户登录
   */
  async login(req, res) {
    const { username, password } = req.body;
    
    // 1. 验证输入
    if (!username || !password) {
      return res.status(400).json({ 
        error: '用户名和密码不能为空' 
      });
    }

    try {
      // 2. 查找用户
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ?', 
        [username]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ 
          error: '用户名或密码错误' 
        });
      }
      
      const user = users[0];
      
      // 3. 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          error: '用户名或密码错误' 
        });
      }
      
      // 4. 生成JWT令牌
      const token = jwt.sign(
        { id: user.id }, 
        jwtSecret, 
        { expiresIn: jwtExpiresIn }
      );
      
      // 5. 返回响应
      res.json({ 
        success: true,
        token,
        user: { 
          id: user.id, 
          username: user.username 
        }
      });
      
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ 
        error: '登录失败，请稍后再试' 
      });
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req, res) {
    try {
      // 1. 从数据库获取用户信息
      const [users] = await pool.query(
        'SELECT id, username FROM users WHERE id = ?', 
        [req.userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ 
          error: '用户不存在' 
        });
      }
      
      // 2. 返回用户信息
      res.json(users[0]);
      
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({ 
        error: '获取用户信息失败' 
      });
    }
  }
};