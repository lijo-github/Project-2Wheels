const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    status: { type: Boolean, default: true },
    wallet: {
        type: Number,
        default: 0,
      },
      addresses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
        },
      ],
  },
  {timestamps:true}

);

const user = mongoose.model("users", userSchema);

module.exports = user;
