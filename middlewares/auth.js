const jwt = require('jsonwebtoken');
const jwtSecret = 'survey-system-secret-key';

module.exports = (req, res, next) => {
  // 1. 从请求头获取token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: '未提供认证令牌' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: '未提供认证令牌' 
    });
  }

  try {
    // 2. 验证token
    const decoded = jwt.verify(token, jwtSecret);
    
    // 3. 将用户ID添加到请求对象
    req.userId = decoded.id;
    
    // 4. 继续处理请求
    next();
  } catch (error) {
    console.error('JWT验证错误:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: '令牌已过期' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: '无效令牌' 
      });
    }
    
    res.status(401).json({ 
      error: '认证失败' 
    });
  }
};