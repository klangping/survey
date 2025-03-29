const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'yxhklkl5200.', // 改为你的MySQL密码
  database: 'survey_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('数据库连接成功');
    conn.release();
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

testConnection();

module.exports = pool;