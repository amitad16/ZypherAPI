const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

const { Event } = require("./event.models");

let UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  eventId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event"
    }
  ]
});

let User = mongoose.model("User", UserSchema);

module.exports = { User };
