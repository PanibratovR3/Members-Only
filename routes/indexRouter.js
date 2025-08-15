const { Router } = require("express");
const passport = require("../config/passport");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", indexController.mainPageGet);
indexRouter.get("/sign-up", indexController.signUpGet);
indexRouter.post("/sign-up", indexController.signUpPost);
indexRouter.get("/log-in", indexController.logInGet);
indexRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);
indexRouter.get("/log-out", indexController.logOutGet);
indexRouter.get("/membership", indexController.membershipGet);
indexRouter.post("/membership", indexController.membershipPost);
indexRouter.get("/new-message", indexController.newMessageGet);
indexRouter.post("/new-message", indexController.newMessagePost);
indexRouter.post("/messages/:id/delete", indexController.deleteMessagePost);

module.exports = indexRouter;
