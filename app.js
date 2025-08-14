const express = require("express");
const path = require("path");
const { body, validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");
const queries = require("./db/queries");
const session = require("express-session");
const passport = require("passport");
const pool = require("./db/pool");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await queries.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect user" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await queries.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const nameAlphabetError = "must contain only letters";
const nameMinimumLengthError = "must contain at least 3 letters.";
const usernameEmailError = "must be in the format of email.";
const passwordMinimunLenghtError = "must contain at least 7 symbols.";
const passwordSpaceError = "must not contain spaces in the middle.";

const validateNewUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${nameAlphabetError}`)
    .isLength({ min: 3 })
    .withMessage(`First name ${nameMinimumLengthError}`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${nameAlphabetError}`)
    .isLength({ min: 3 })
    .withMessage(`Last name ${nameMinimumLengthError}`),
  body("username")
    .trim()
    .isEmail()
    .withMessage(`Username ${usernameEmailError}`),
  body("password")
    .trim()
    .isLength({ min: 7 })
    .withMessage(`Password ${passwordMinimunLenghtError}`)
    .custom((value) => !/\s/.test(value))
    .withMessage(`Password ${passwordSpaceError}`),
  check("confirmPassword", "Passwords do not match.").custom(
    (value, { req }) => value === req.body.password
  ),
];
const PORT = 3000;

app.get("/", async (request, response) => {
  const messages = await queries.getAllMessages();
  response.render("index", { user: request.user, messages: messages });
});

const signUpPostArray = [
  validateNewUser,
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).render("sign-up-form", {
        errors: errors.array(),
      });
    } else {
      const { firstName, lastName, username, password, isAdmin } = request.body;
      const isAdminFlag = isAdmin === "on" ? true : false;
      const hashedPassword = await bcrypt.hash(password, 10);
      const rowsToCheck = await queries.getUsersByUsernameAndPassword(
        username,
        hashedPassword
      );
      if (rowsToCheck.length > 0) {
        response.render("sign-up-form", {
          errorsExist: { msg: "Username or password already exists." },
        });
      } else {
        await queries.addNewUser(
          firstName,
          lastName,
          username,
          hashedPassword,
          isAdminFlag
        );
        response.redirect("/");
      }
    }
  },
];

app.get("/sign-up", (request, response) => {
  response.render("sign-up-form");
});

app.post("/sign-up", signUpPostArray);

app.get("/log-in", (request, response) => {
  response.render("log-in-form");
});

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/log-out", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.use((error, request, response, next) => {
  console.error("ERROR!");
  console.error(error.name, " : ", error.message);
});

app.get("/membership", (request, response) => {
  response.render("membership-form");
});

app.post("/membership", async (request, response) => {
  const { answer } = request.body;
  if (answer === process.env.MEMBERSHIP_ANSWER && request.isAuthenticated()) {
    await queries.giveMembershipToUser(request.user.id);
    response.redirect("/");
  } else if (!request.isAuthenticated()) {
    response.redirect("/");
  } else {
    response.render("membership-form", {
      error: { msg: "Incorrect answer. Try again." },
    });
  }
});

app.get("/new-message", (request, response) => {
  response.render("new-message-form");
});

app.post("/new-message", async (request, response) => {
  const { title, message } = request.body;
  if (request.isAuthenticated()) {
    await queries.createMessage(request.user.id, title, message);
    response.redirect("/");
  } else {
    response.redirect("/");
  }
});

app.listen(PORT, () =>
  console.log(`Server was launched at http://localhost:${PORT}/`)
);
