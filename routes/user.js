const express = require("express");
const router = express.Router();
const _ = require("lodash");
const uuid = require("uuid/v1");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const db = require("../server/db/mongoose");
const { User } = require("../models/user.models");
const { Event } = require("../models/event.models");
const { responseHandler } = require("./helper/helper");

// @request GET /user
router.get("/", (req, res) => {
  User.find({}, { _id: 0, __v: 0 }).then(users => {
    if (!users)
      // return res.status(401).send({
      //   success: false,
      //   msg: {
      //     info: `No users are registered`
      //   }
      // });
      return responseHandler(res, 401, false, {
        info: `No users are registered`
      });

    // return res.status(200).send({
    //   success: false,
    //   msg: { users }
    // });
    return responseHandler(res, 200, false, { users });
  });
});

// @request POST /user
// @body -
// {
//   "email": ""
// }
router.post("/", (req, res) => {
  // If user email already exist
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user)
        return responseHandler(res, 409, false, {
          info: `User with email ${req.body.email} already exist`
        });

      // Create userId
      req.body.userId = uuid();
      let body = _.pick(req.body, "userId", "email");

      // Create new User object
      let newUser = new User(body);
      newUser.save().then(user => {
        return responseHandler(res, 201, true, {
          user: {
            userId: user.userId,
            email: user.email
          }
        });
      });
    })
    .catch(err => responseHandler(res, 400, false, { err }));
});

// @request PUT /user/add
// @body -
// {
//   "eventId": "ObjId",
//   "userId": "uuid"
// }
router.put("/add", (req, res) => {
  let { eventId } = req.body;
  let { userId } = req.body;

  // User should exist
  User.findOne({ userId })
    .then(user => {
      if (!user)
        return responseHandler(res, 401, false, {
          err: `No user with userId: ${userId} found`
        });

      // Check if User already in the guest list of the event
      if (user.eventId.indexOf(eventId) !== -1) {
        return responseHandler(res, 401, false, {
          info: `You are already in the guest list of this event`
        });
      }

      Event.findById(eventId).then(event => {
        // Check if event exist
        if (!event)
          return responseHandler(res, 401, false, {
            err: `No event with eventId: ${eventId} found`
          });

        let body = _.pick(req.body, "eventId", "userId");

        // Update user
        User.findOneAndUpdate(
          { userId: body.userId },
          { $push: { eventId: body.eventId } },
          { new: true }
        ).then(user => {
          nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
              }
            });

            let message = {
              from: "zypher@gmail.com",
              to: user.email,
              subject: "Registered to Event",
              text: `You are successfully registered to event`,
              html: `<b>You are successfully registered to event</b>`
            };

            transporter.sendMail(message, (err, info) => {
              if (err)
                return responseHandler(res, 400, false, {
                  err: `Email sent error`
                });

              // TEST EMAIL DETAILS
              console.log("Message sent: %s", info.messageId);
              console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
              return responseHandler(res, 201, true, {
                user: {
                  userId: user.userId,
                  email: user.email,
                  events: user.eventId
                }
              });
            });
          });
        });
      });
    })
    .catch(err => responseHandler(res, 400, false, { err }));
});

module.exports = router;
