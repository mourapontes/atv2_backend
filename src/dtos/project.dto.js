const Joi = require('joi');
const { toTechnologyDTO } = require('./technology.dto');

// DTO de entrada: dados aceitos para criar um Project.
const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(1).max(150).required().messages({
    'string.empty': 'O campo "title" não pode ser vazio.',
    'any.required': 'O campo "title" é obrigatório.',
  }),
  description: Joi.string().trim().allow('', null).max(2000),
  repositoryUrl: Joi.string().trim().uri().required().messages({
    'string.uri': 'O campo "repositoryUrl" deve ser uma URL válida.',
    'any.required': 'O campo "repositoryUrl" é obrigatório.',
  }),
  profileId: Joi.number().integer().positive().required().messages({
    'any.required': 'O campo "profileId" é obrigatório.',
    'number.base': 'O campo "profileId" deve ser um número.',
  }),
  technologyIds: Joi.array().items(Joi.number().integer().positive()).default([]),
});

// DTO de entrada: parâmetros de query aceitos para listar Projects (filtro + paginação).
const listProjectsQuerySchema = Joi.object({
  profileId: Joi.number().integer().positive().messages({
    'number.base': 'O parâmetro "profileId" deve ser um número.',
  }),
  technology: Joi.string().trim().min(1).max(60).messages({
    'string.empty': 'O parâmetro "technology" não pode ser vazio.',
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'O parâmetro "page" deve ser no mínimo 1.',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.min': 'O parâmetro "limit" deve ser no mínimo 1.',
    'number.max': 'O parâmetro "limit" deve ser no máximo 100.',
  }),
});

// DTO de saída.
function toProjectDTO(project) {
  if (!project) return null;
  const plain = project.toJSON ? project.toJSON() : project;
  return {
    id: plain.id,
    title: plain.title,
    description: plain.description ?? null,
    repositoryUrl: plain.repositoryUrl,
    averageRating: plain.averageRating != null ? Number(plain.averageRating) : 0,
    upvotes: plain.upvotes ?? 0,
    profile: plain.profile
      ? { id: plain.profile.id, name: plain.profile.name, email: plain.profile.email }
      : { id: plain.profileId },
    technologies: Array.isArray(plain.technologies)
      ? plain.technologies.map(toTechnologyDTO)
      : [],
    feedbacks: Array.isArray(plain.feedbacks)
      ? plain.feedbacks.map((f) => ({ id: f.id, comment: f.comment, rating: f.rating }))
      : undefined,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

module.exports = { createProjectSchema, listProjectsQuerySchema, toProjectDTO };
