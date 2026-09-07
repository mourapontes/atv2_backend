const profileRepository = require('../repositories/profile.repository');
const { HttpError } = require('../middlewares/errorHandler');

const profileService = {
  async create(data) {
    const existing = await profileRepository.findByEmail(data.email);
    if (existing) {
      throw new HttpError(409, 'Já existe um perfil cadastrado com este e-mail.');
    }
    return profileRepository.create(data);
  },

  async getById(id) {
    const profile = await profileRepository.findById(id);
    if (!profile) {
      throw new HttpError(404, 'Perfil não encontrado.');
    }
    return profile;
  },
};

module.exports = profileService;
