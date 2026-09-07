const Joi = require('joi');

// Schema reutilizável para validar parâmetros de rota do tipo :id.
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'any.required': 'O parâmetro "id" é obrigatório.',
    'number.base': 'O parâmetro "id" deve ser um número inteiro.',
  }),
});

module.exports = { idParamSchema };
