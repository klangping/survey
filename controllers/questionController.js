const pool = require('../config/db');

module.exports = {
  // 添加问题
  async addQuestion(req, res) {
    const surveyId = req.params.surveyId;
    const { content, type, is_required, options} = req.body;
    
     // 验证问题内容
  if (!content || content.trim().length < 3) {
    return res.status(400).json({ error: '问题内容不能少于3个字符' });
  }

  // 验证问题类型
  const validTypes = ['radio', 'checkbox', 'text', 'textarea', 'rating'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: '无效的问题类型' });
  }

  // 验证选择题选项
  if (['radio', 'checkbox'].includes(type)) {
    if (!options || options.length < 2) {
      return res.status(400).json({ error: '选择题需要至少2个选项' });
    }
    
    for (const opt of options) {
      if (!opt.content || !opt.content.trim()) {
        return res.status(400).json({ error: '选项内容不能为空' });
      }
    }
  }

    try {
      // 获取当前最大排序值
      const [maxOrder] = await pool.query(
        'SELECT MAX(sort_order) as max_order FROM questions WHERE survey_id = ?',
        [surveyId]
      );
      
      const sortOrder = (maxOrder[0].max_order || 0) + 1;
      
      const [result] = await pool.query(
        'INSERT INTO questions (survey_id, content, type, is_required, sort_order) VALUES (?, ?, ?, ?, ?)',
        [surveyId, content, type, is_required, sortOrder]
      );
      
      res.json({
        success: true,
        question: {
          id: result.insertId,
          survey_id: surveyId,
          content,
          type,
          is_required,
          sort_order: sortOrder
        }
      });
    } catch (error) {
      console.error('添加问题失败:', error);
      res.status(500).json({ error: '添加问题失败' });
    }
  },

  // 更新问题
  async updateQuestion(req, res) {
    const questionId = req.params.id;
    const { content, type, is_required } = req.body;
    
    try {
      await pool.query(
        'UPDATE questions SET content = ?, type = ?, is_required = ? WHERE id = ?',
        [content, type, is_required, questionId]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('更新问题失败:', error);
      res.status(500).json({ error: '更新问题失败' });
    }
  },

  // 删除问题
  async deleteQuestion(req, res) {
    const questionId = req.params.id;
    
    try {
      await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);
      res.json({ success: true });
    } catch (error) {
      console.error('删除问题失败:', error);
      res.status(500).json({ error: '删除问题失败' });
    }
  },

  // 排序问题
  async sortQuestions(req, res) {
    const { orderedIds } = req.body;
    
    try {
      // 使用事务保证所有更新操作原子性
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await conn.query(
            'UPDATE questions SET sort_order = ? WHERE id = ?',
            [i + 1, orderedIds[i]]
          );
        }
        
        await conn.commit();
        res.json({ success: true });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('排序问题失败:', error);
      res.status(500).json({ error: '排序问题失败' });
    }
  }
};