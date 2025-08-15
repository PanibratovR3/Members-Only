const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");
const indexRouter = require("./routes/indexRouter");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use("/", indexRouter);

const PORT = 3000;

app.use((error, request, response, next) => {
  console.error("ERROR!");
  console.error(error);
});

app.listen(PORT, () =>
  console.log(`Server was launched at http://localhost:${PORT}/`)
);
