import mongoose from "mongoose";
import CommentModel from "../models/Comment.js";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(","),
      user: req.userId,
    });
    const post = await doc.save();

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not create post",
    });
  }
};

export const getPopularTags = async (req, res) => {
  try {
    const popularTags = await PostModel.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json(popularTags.map((tag) => tag._id));
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get top hashtags",
    });
  }
};

export const getNewPosts = async (req, res) => {
  try {
    const posts = await PostModel.aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentsCount",
        },
      },
      { $addFields: { commentsCount: { $size: "$commentsCount" } } },
    ]).sort({ createdAt: -1 });
    await PostModel.populate(posts, { path: "user" });
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get posts",
    });
  }
};

export const getPostsByTag = async (req, res) => {
  try {
    const tagName = req.params.name;
    const posts = await PostModel.find({ tags: tagName })
      .populate("user")
      .exec();

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get posts",
    });
  }
};

export const getPopularPosts = async (req, res) => {
  try {
    const posts = await PostModel.aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentsCount",
        },
      },
      { $addFields: { commentsCount: { $size: "$commentsCount" } } },
    ]).sort({ viewsCount: -1 });
    await PostModel.populate(posts, { path: "user" });

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get popular posts",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } }
    );

    const post = await PostModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentsCount",
        },
      },
      { $addFields: { commentsCount: { $size: "$commentsCount" } } },
      { $limit: 1 },
    ]);

    await PostModel.populate(post, { path: "user" });

    res.json(post[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get posts",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Can not remove post",
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: "Post don't exist",
          });
        }
        res.json({
          success: true,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not get posts",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(","),
        user: req.userId,
      }
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can not update post",
    });
  }
};
