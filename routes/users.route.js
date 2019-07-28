require("../models/user.model");
require("../db");

const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");

const Ctrl = require("../controller/users.route.controller");

router.post("/register", Ctrl.registerUser);

router.post("/login", Ctrl.userLogin);

router.post("/logout", Ctrl.userLogout);

router.get("/:username/dashboard", authenticateUser, Ctrl.accessDashboard);

router.get("/:username/drinks", authenticateUser, Ctrl.populateDrinks);

router.post("/:username/drinks", authenticateUser, Ctrl.addDrink);

router.delete("/:username/drinks/:id", authenticateUser, Ctrl.deleteDrink);

router.put("/:username/drinks/:id", authenticateUser, Ctrl.updateDrink);

router.get("/userprofile", authenticateUser, Ctrl.getUserProfile);

module.exports = router;
