export function validateBody(zodSchema) {
  return (req, res, next) => {
    const result = zodSchema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error en la validación de los datos enviados.',
          details: formattedErrors
        }
      });
    }

    req.body = result.data;
    next();
  };
}
