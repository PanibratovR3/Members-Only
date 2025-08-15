const queries = require("../db/queries");
const bcrypt = require("bcryptjs");
const { body, validationResult, check } = require("express-validator");
require("dotenv").config({ quiet: true });

const nameAlphabetError = "must contain only letters";
const nameMinimumLengthError = "must contain at least 3 letters.";
const usernameEmailError = "must contain domain 'templar.com'.";
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
    .contains("templar.com")
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

async function mainPageGet(request, response) {
  const messages = await queries.getAllMessages();
  response.render("index", { user: request.user, messages: messages });
}

function signUpGet(request, response) {
  response.render("sign-up-form");
}

const signUpPost = [
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

function logInGet(request, response) {
  response.render("log-in-form");
}

function logOutGet(request, response, next) {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
}

function membershipGet(request, response) {
  response.render("membership-form");
}

async function membershipPost(request, response) {
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
}

function newMessageGet(request, response) {
  response.render("new-message-form");
}

async function newMessagePost(request, response) {
  const { title, message } = request.body;
  if (request.isAuthenticated()) {
    await queries.createMessage(request.user.id, title, message);
    response.redirect("/");
  } else {
    response.redirect("/");
  }
}

async function deleteMessagePost(request, response) {
  const { id } = request.params;
  await queries.deleteMessage(Number(id));
  response.redirect("/");
}

module.exports = {
  mainPageGet,
  signUpGet,
  signUpPost,
  logInGet,
  logOutGet,
  membershipGet,
  membershipPost,
  newMessageGet,
  newMessagePost,
  deleteMessagePost,
};
