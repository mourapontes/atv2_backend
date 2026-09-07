const projectRepository = require('../repositories/project.repository');
const profileRepository = require('../repositories/profile.repository');
const technologyRepository = require('../repositories/technology.repository');
const feedbackRepository = require('../repositories/feedback.repository');
const { HttpError } = require('../middlewares/errorHandler');

const projectService = {
  async create({ technologyIds, ...data }) {
    const profile = await profileRepository.findById(data.profileId);
    if (!profile) {
      throw new HttpError(400, `Profile com id ${data.profileId} não encontrado.`);
    }

    if (technologyIds && technologyIds.length) {
      const foundTechnologies = await technologyRepository.findByIds(technologyIds);
      if (foundTechnologies.length !== technologyIds.length) {
        throw new HttpError(400, 'Uma ou mais tecnologias informadas não existem.');
      }
    }

    return projectRepository.create({ technologyIds, ...data });
  },

  async getById(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new HttpError(404, `Projeto com id ${id} não encontrado.`);
    }
    return project;
  },

  async list({ profileId, technology, page = 1, limit = 10 }) {
    const { rows, count } = await projectRepository.findAndCountAll({ profileId, technology, page, limit });
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: count === 0 ? 0 : Math.ceil(count / limit),
      },
    };
  },

  /**
   * Regra de negócio: cada feedback registrado recalcula a nota média (1 a 5) do projeto.
   */
  async addFeedback(projectId, { rating, comment }) {
    await this.getById(projectId);

    const feedback = await feedbackRepository.create({ projectId, rating, comment });
    const average = await feedbackRepository.getAverageRatingByProject(projectId);
    const roundedAverage = Math.round(average * 100) / 100;

    await projectRepository.updateAverageRating(projectId, roundedAverage);

    return { feedback, averageRating: roundedAverage };
  },

  /**
   * Regra de negócio: upvote apenas incrementa o contador de curtidas do projeto.
   */
  async upvote(projectId) {
    await this.getById(projectId);
    await projectRepository.incrementUpvotes(projectId);
    return projectRepository.findById(projectId);
  },
};

module.exports = projectService;
