import CommentModel from "../models/Comment.js";
import PostModel from "../models/Post.js";

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      author: req.userId,
      post: req.params.id,
      text: req.body.commentText,
    });
    await doc.save();

    res.json({
      message: {
        success: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not write comment",
    });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const comments = await CommentModel.find({
      post: id,
    })
      .populate("author")
      .sort({ createdAt: -1 });

    if (!comments?.length) {
      return res.status(404).json({
        message: "Post don't exist",
      });
    }
    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get comments",
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await CommentModel.find()
      .populate("author")
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    if (!comments) {
      return res.status(404).json({
        message: "Comments don't exist",
      });
    }
    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get comments",
    });
  }
};
