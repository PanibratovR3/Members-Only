const express = require("express");
const path = require("path");
const { body, validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");
const queries = require("./db/queries");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (request, response) => {
  response.render("index");
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
      await queries.addNewUser(
        firstName,
        lastName,
        username,
        hashedPassword,
        isAdminFlag
      );
      response.redirect("/");
    }
  },
];

app.get("/sign-up", (request, response) => {
  response.render("sign-up-form");
});

app.post("/sign-up", signUpPostArray);

app.listen(PORT, () =>
  console.log(`Server was launched at http://localhost:${PORT}/`)
);
