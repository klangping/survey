const pool = require('../config/db');

module.exports = {
  // 创建问卷
  async createSurvey(req, res) {
    const { title, description } = req.body;
    const creatorId = req.userId; // 从认证中间件获取
    
     // 验证标题
  if (!title || title.trim().length < 2) {
    return res.status(400).json({ error: '问卷标题不能少于2个字符' });
  }
  if (title.length > 100) {
    return res.status(400).json({ error: '问卷标题不能超过100个字符' });
  }

  // 验证描述长度
  if (description && description.length > 500) {
    return res.status(400).json({ error: '问卷描述不能超过500个字符' });
  }


    try {
      const [result] = await pool.query(
        'INSERT INTO surveys (title, description, creator_id) VALUES (?, ?, ?)',
        [title, description, creatorId]
      );
      
      res.json({
        success: true,
        survey: {
          id: result.insertId,
          title,
          description,
          creator_id: creatorId
        }
      });
    } catch (error) {
      console.error('创建问卷失败:', error);
      res.status(500).json({ error: '创建问卷失败' });
    }
  },

  // 获取用户问卷列表
  async getUserSurveys(req, res) {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    try {
      // 获取总数
      const [totalResult] = await pool.query(
        'SELECT COUNT(*) as total FROM surveys WHERE creator_id = ?',
        [userId]
      );
      const total = totalResult[0].total;
      
      // 获取分页数据
      const [surveys] = await pool.query(
        `SELECT * FROM surveys 
         WHERE creator_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, pageSize, (page - 1) * pageSize]
      );
      
      res.json({ 
        success: true,
        data: {
          list: surveys,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      console.error('获取问卷列表失败:', error);
      res.status(500).json({ 
        success: false,
        error: '获取问卷列表失败' 
      });
    }
  },

  // 获取单个问卷详情
  async getSurvey(req, res) {
    const surveyId = req.params.id;
    const userId = req.userId;
    
    try {
      // 验证问卷属于当前用户
      const [surveys] = await pool.query(
        'SELECT * FROM surveys WHERE id = ? AND creator_id = ?',
        [surveyId, userId]
      );
      
      if (surveys.length === 0) {
        return res.status(404).json({ error: '问卷不存在或无权访问' });
      }
      
      // 获取关联问题
      const [questions] = await pool.query(
        'SELECT * FROM questions WHERE survey_id = ? ORDER BY sort_order',
        [surveyId]
      );
      
      res.json({
        survey: surveys[0],
        questions
      });
    } catch (error) {
      console.error('获取问卷详情失败:', error);
      res.status(500).json({ error: '获取问卷详情失败' });
    }
  },

  // 更新问卷
  async updateSurvey(req, res) {
    const surveyId = req.params.id;
    const { title, description, status= 'draft' } = req.body;
    
    try {
      await pool.query(
        'UPDATE surveys SET title = ?, description = ?, status = ? WHERE id = ?',
        [title, description, status, surveyId]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('更新问卷失败:', error);
      res.status(500).json({ error: '更新问卷失败' });
    }
  },

  // 新增获取问卷状态分布的方法
    async getSurveyStats(req, res) {
        try {
            const [stats] = await pool.query(
                `SELECT status, COUNT(*) as count 
       FROM surveys 
       WHERE creator_id = ? 
       GROUP BY status`,
                [req.userId]
            );
            res.json({ stats });
        } catch (error) {
            console.error('获取统计失败:', error);
            res.status(500).json({ error: '获取统计失败' });
        }
    },
  // 删除问卷
  async deleteSurvey(req, res) {
    const surveyId = req.params.id;
    
    try {
      // 先删除关联问题
      await pool.query('DELETE FROM questions WHERE survey_id = ?', [surveyId]);
      // 再删除问卷
      await pool.query('DELETE FROM surveys WHERE id = ?', [surveyId]);
      
      res.json({ success: true });
    } catch (error) {
      console.error('删除问卷失败:', error);
      res.status(500).json({ error: '删除问卷失败' });
    }
  }
};