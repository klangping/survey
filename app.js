const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 测试数据库连接
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, data: rows[0].solution });
  } catch (error) {
    res.status(500).json({ error: '数据库连接失败' });
  }
});

// 认证路由
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});


// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 问卷路由
const surveyRoutes = require('./routes/survey');
app.use('/api/surveys', surveyRoutes);