const { body } = require('express-validator');

const signupValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('name').notEmpty().withMessage('Name is required'),
];

const loginValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  signupValidation,
  loginValidation,
};