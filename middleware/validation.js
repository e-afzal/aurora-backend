const validation = (schema) => async (req, res, next) => {
  const body = req.body;

  try {
    //? Validate the fields from the body as a whole
    await schema.validate(body);
    //? Then move forward with executing code in 'registerUser' controller
    next();
    // return next();
  } catch (error) {
    //! If error found for any 'field' throw error and stop running code right here through 'return'
    return res.status(400).json({ message: error.message });
  }
};

export default validation;
