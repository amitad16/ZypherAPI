const mongoose = require("mongoose");
const { Schema } = mongoose;

let EventSchema = new Schema({
  eventName: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  }
});

let Event = mongoose.model("Event", EventSchema);

module.exports = { Event };
