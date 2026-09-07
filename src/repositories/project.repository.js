const { Op } = require('sequelize');
const { Project, Profile, Technology } = require('../models');

const defaultIncludes = () => [
  { model: Profile, as: 'profile', attributes: ['id', 'name', 'email'] },
  { model: Technology, as: 'technologies', attributes: ['id', 'name'], through: { attributes: [] } },
];

const projectRepository = {
  async create({ technologyIds, ...data }) {
    const project = await Project.create(data);
    if (technologyIds && technologyIds.length) {
      await project.setTechnologies(technologyIds);
    }
    return this.findById(project.id);
  },

  findById(id) {
    return Project.findByPk(id, { include: defaultIncludes() });
  },

  /**
   * Busca paginada de projetos, com filtro opcional por profileId e por tecnologia (nome).
   */
  async findAndCountAll({ profileId, technology, page = 1, limit = 10 } = {}) {
    const where = {};
    if (profileId) where.profileId = profileId;

    const includes = defaultIncludes();
    if (technology) {
      const technologiesInclude = includes.find((include) => include.as === 'technologies');
      technologiesInclude.where = { name: { [Op.iLike]: `%${technology}%` } };
      technologiesInclude.required = true;
    }

    const { rows, count } = await Project.findAndCountAll({
      where,
      include: includes,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return { rows, count };
  },

  incrementUpvotes(id) {
    return Project.increment('upvotes', { by: 1, where: { id } });
  },

  updateAverageRating(id, averageRating) {
    return Project.update({ averageRating }, { where: { id } });
  },
};

module.exports = projectRepository;
