import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100
    },

    content: {
      type: String,
      required: true,
      minlength: 10
    },

    image: {
      type: String,
      default: null
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },

    authorName: {
      type: String,
      required: true
    },
    adminReply: {
      type: String,
      default: null
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      default: null
    },
    repliedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["open", "answered", "closed"],
      default: "open"
    }
  },
   { timestamps: true, collection: "questions" }
);
const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
export default Question;
