const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  video: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  additionalInfo: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
