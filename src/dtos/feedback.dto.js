const Joi = require('joi');

// DTO de entrada: dados aceitos para criar um Feedback (nota + comentário).
const createFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'O campo "rating" é obrigatório.',
    'number.base': 'O campo "rating" deve ser um número.',
    'number.min': 'O campo "rating" deve ser no mínimo 1.',
    'number.max': 'O campo "rating" deve ser no máximo 5.',
  }),
  comment: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'O campo "comment" não pode ser vazio.',
    'any.required': 'O campo "comment" é obrigatório.',
  }),
});

// DTO de saída.
function toFeedbackDTO(feedback) {
  if (!feedback) return null;
  const plain = feedback.toJSON ? feedback.toJSON() : feedback;
  return {
    id: plain.id,
    rating: plain.rating,
    comment: plain.comment,
    projectId: plain.projectId,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

module.exports = { createFeedbackSchema, toFeedbackDTO };
