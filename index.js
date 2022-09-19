import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";

import { registerValidation, loginValidation } from "./validations/auth.js";
import { postCreateValidation } from "./validations/post.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";
import {
  UserController,
  PostController,
  CommentController,
} from "./controllers/index.js";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

///Authorization route
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.get("/auth/me", checkAuth, UserController.getMe);

//Upload route
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({ url: `/uploads/${req.file.originalname}` });
});
app.post("/uploadAvatar", upload.single("image"), (req, res) => {
  res.json({ url: `/uploads/${req.file.originalname}` });
});

///Posts route
app.get("/posts", PostController.getNewPosts);
app.get("/popular", PostController.getPopularPosts);
app.get("/tags", PostController.getPopularTags);
app.get("/tags/:name", PostController.getPostsByTag);
app.get("/posts/:id", PostController.getOne);
app.get("/posts/comments/:id", CommentController.getCommentsOfPost);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);
app.delete("/posts/:id", checkAuth, PostController.remove);

//Comments route
app.post("/posts/:id", checkAuth, CommentController.create);
app.get("/comments", CommentController.getAllComments);

app.listen(process.env.PORT || 5000, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server Ok");
});
