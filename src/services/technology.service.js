const technologyRepository = require('../repositories/technology.repository');
const { HttpError } = require('../middlewares/errorHandler');

const technologyService = {
  async create(data) {
    const existing = await technologyRepository.findByName(data.name);
    if (existing) {
      throw new HttpError(409, 'Já existe uma tecnologia cadastrada com este nome.');
    }
    return technologyRepository.create(data);
  },

  findAll() {
    return technologyRepository.findAll();
  },
};

module.exports = technologyService;
