const { Feedback, sequelize } = require('../models');

const feedbackRepository = {
  create(data) {
    return Feedback.create(data);
  },

  findAllByProject(projectId) {
    return Feedback.findAll({ where: { projectId }, order: [['createdAt', 'DESC']] });
  },

  async getAverageRatingByProject(projectId) {
    const result = await Feedback.findOne({
      where: { projectId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']],
      raw: true,
    });
    return result?.average != null ? Number(result.average) : 0;
  },
};

module.exports = feedbackRepository;
