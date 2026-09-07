const technologyService = require('../services/technology.service');
const { toTechnologyDTO } = require('../dtos/technology.dto');

async function create(req, res, next) {
  try {
    const technology = await technologyService.create(req.body);
    return res.status(201).json(toTechnologyDTO(technology));
  } catch (err) {
    return next(err);
  }
}

async function findAll(req, res, next) {
  try {
    const technologies = await technologyService.findAll();
    return res.status(200).json(technologies.map(toTechnologyDTO));
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, findAll };
