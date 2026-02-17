// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

// hostRouter.get("/add-home", hostController.getAddHome);
authRouter.get("/login",authController.getlogin)
authRouter.post("/login",authController.postLogin)
authRouter.post("/logout",authController.postLogout)
authRouter.get("/signup",authController.goto_sign_in_page)
authRouter.post("/Signup",authController.postSignup)

module.exports = authRouter;