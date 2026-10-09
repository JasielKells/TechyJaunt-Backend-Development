/**
 * Generic Joi validation middleware factory.
 * @param {Joi.Schema} schema - Joi schema to validate req.body against
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return res.status(400).json({ success: false, errors });
  }

  req.body = value; // sanitized body
  next();
};

module.exports = validate;