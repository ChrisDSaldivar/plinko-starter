"use strict";
require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.static("public", {extensions: ["html"]}));

app.listen(process.env.PORT, () => {
    console.log(`Server listening on http://localhost:${process.env.PORT}`);
});
