const profileService = require('../services/profile.service');
const { toProfileDTO } = require('../dtos/profile.dto');

async function create(req, res, next) {
  try {
    const profile = await profileService.create(req.body);
    return res.status(201).json(toProfileDTO(profile));
  } catch (err) {
    return next(err);
  }
}

async function findById(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await profileService.getById(id);

    return res.status(200).json(toProfileDTO(profile));
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, findById };
