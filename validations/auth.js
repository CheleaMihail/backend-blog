import { body } from "express-validator";

export const registerValidation = [
  body("email", "Invalid email format").isEmail(),
  body("password", "Password must contain at least 5 symbol").isLength({
    min: 5,
  }),
  body("fullName", "Enter the name").isLength({ min: 3 }),
  body("avatarUrl", "Invalid url").optional().isString(),
];

export const loginValidation = [
  body("email", "Invalid email format").isEmail(),
  body("password", "Password must contain at least 5 symbol").isLength({
    min: 5,
  }),
];
