const projectService = require('../services/project.service');
const { toProjectDTO } = require('../dtos/project.dto');
const { toFeedbackDTO } = require('../dtos/feedback.dto');

async function create(req, res, next) {
  try {
    const project = await projectService.create(req.body);
    return res.status(201).json(toProjectDTO(project));
  } catch (err) {
    return next(err);
  }
}

async function findAll(req, res, next) {
  try {
    const { profileId, technology, page, limit } = req.query;
    const { data, pagination } = await projectService.list({ profileId, technology, page, limit });

    return res.status(200).json({ data: data.map(toProjectDTO), pagination });
  } catch (err) {
    return next(err);
  }
}

async function createFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback, averageRating } = await projectService.addFeedback(id, req.body);

    return res.status(201).json({
      feedback: toFeedbackDTO(feedback),
      projectAverageRating: averageRating,
    });
  } catch (err) {
    return next(err);
  }
}

async function upvote(req, res, next) {
  try {
    const { id } = req.params;
    const project = await projectService.upvote(id);

    return res.status(200).json(toProjectDTO(project));
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, findAll, createFeedback, upvote };
