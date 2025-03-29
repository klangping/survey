// 修改后的survey.js
const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middlewares/auth');

// 需要认证的路由
router.use(authMiddleware);

// 问卷路由
router.post('/', surveyController.createSurvey);
router.get('/', surveyController.getUserSurveys);
router.get('/:id', surveyController.getSurvey);
router.put('/:id', surveyController.updateSurvey);
router.delete('/:id', surveyController.deleteSurvey);
router.get('/:id/responses', surveyController.getSurveyResponses); // 获取问卷回答
router.get('/stats/survey-status', surveyController.getSurveyStats); // 新增状态统计路由

// 问题路由
router.post('/:surveyId/questions', questionController.addQuestion);
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);
router.post('/questions/sort', questionController.sortQuestions);

module.exports = router;