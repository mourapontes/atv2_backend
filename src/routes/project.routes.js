const { Router } = require('express');
const projectController = require('../controllers/project.controller');
const validate = require('../middlewares/validate');
const { createProjectSchema, listProjectsQuerySchema } = require('../dtos/project.dto');
const { createFeedbackSchema } = require('../dtos/feedback.dto');
const { idParamSchema } = require('../dtos/common.dto');

const router = Router();

router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', validate.query(listProjectsQuerySchema), projectController.findAll);

router.post(
  '/:id/feedbacks',
  validate.params(idParamSchema),
  validate(createFeedbackSchema),
  projectController.createFeedback
);

router.put('/:id/upvote', validate.params(idParamSchema), projectController.upvote);

module.exports = router;
