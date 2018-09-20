const express = require("express");
const router = express.Router();
const _ = require("lodash");

const db = require("../server/db/mongoose");
const { Event } = require("../models/event.models");
const { responseHandler } = require("./helper/helper");

// @request GET /event
router.get("/", (req, res) => {
  Event.find({}, { __v: 0 })
    .then(events => {
      if (!events)
        // return res.status(401).send({
        //   success: false,
        //   msg: {
        //     info: `No events are registered`
        //   }
        // });
        return responseHandler(res, 401, false, {
          info: `No events are registered`
        });

      // return res.status(200).send({
      //   success: true,
      //   msg: { events }
      // });
      return responseHandler(res, 200, true, { events });
    })
    .catch(err => responseHandler(res, 400, false, { err }));
});

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
    // return res
    //   .status(406)
    //   .send({ success: false, msg: { err: "Please choose a future date." } });
    return responseHandler(res, 406, false, {
      err: "Please choose a future date."
    });

  req.body.eventDate = eventDate;
  let body = _.pick(req.body, "eventName", "eventDate");

  let event = new Event(body);
  event
    .save()
    .then(event =>
      // res.status(201).send({
      //   success: true,
      //   msg: {
      //     event: {
      //       eventId: event.id,
      //       eventName: event.eventName,
      //       eventDate: event.eventDate.toDateString()
      //     }
      //   }
      // })
      responseHandler(res, 201, true, {
        event: {
          eventId: event.id,
          eventName: event.eventName,
          eventDate: event.eventDate.toDateString()
        }
      })
    )
    .catch(err => responseHandler(res, 400, false, { err }));
});

module.exports = router;
