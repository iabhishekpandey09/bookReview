const mongoose = require("mongoose");

const shelfSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["default", "custom"],
      default: "custom",
    },

    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

shelfSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Shelf", shelfSchema);
