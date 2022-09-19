import { body } from "express-validator";

export const postCreateValidation = [
  body("title", "Enter title of post").isLength({ min: 3 }).isString(),
  body("text", "Enter text of post").isLength({ min: 10 }).isString(),
  body("tags", "Wrong format of tags (enter list)").optional().isString(),
  body("imageUrl", "Invalid url to image").optional().isString(),
];
