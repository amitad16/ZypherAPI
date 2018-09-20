const express = require("express");
const router = express.Router();
const _ = require("lodash");

const db = require("../server/db/mongoose");
const { Event } = require("../models/event.models");

// @request POST /event
// @body -
// {
//   "eventName": "String",
//   "eventDate": "YYYY-MM-DD"
// }
router.post("/", (req, res) => {
  // Create ISO date format form date string
  let eventDate = new Date(req.body.eventDate);

  // Check if date is of future
  if (eventDate.getTime() - new Date().getTime() < 0)
    return res
      .status(404)
      .send({ success: false, msg: { err: "Please choose a future date." } });

  req.body.eventDate = eventDate;
  let body = _.pick(req.body, "eventName", "eventDate");

  let event = new Event(body);
  event
    .save()
    .then(event =>
      res.status(201).send({
        success: true,
        msg: {
          event: {
            eventId: event.id,
            eventName: event.eventName,
            eventDate: event.eventDate.toDateString()
          }
        }
      })
    )
    .catch(err => res.status(400).send({ success: false, msg: { err } }));
});

module.exports = router;
