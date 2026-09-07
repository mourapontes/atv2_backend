/**
 * Middleware factory: valida uma parte da requisição (body, query ou params) contra um schema Joi.
 * Em caso de erro, responde 400 com a lista de mensagens de validação.
 */
function validateSource(schema, source) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: 'Erro de validação.',
        errors: error.details.map((d) => d.message),
      });
    }

    req[source] = value;
    next();
  };
}

function validate(schema) {
  return validateSource(schema, 'body');
}

validate.query = (schema) => validateSource(schema, 'query');
validate.params = (schema) => validateSource(schema, 'params');

module.exports = validate;
