require("./config/config.js");

const express = require("express");
const bodyParser = require("body-parser");

const userRoute = require("../routes/user");
const eventRoute = require("../routes/event");

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use("/user", userRoute);
app.use("/event", eventRoute);

app.listen(port, () => console.log(`Listening to port ${port}`));
