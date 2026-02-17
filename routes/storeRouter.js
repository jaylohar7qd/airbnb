// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");

storeRouter.get("/", storeController.getIndex)
storeRouter.get("/homes", storeController.getIndex);
storeRouter.get("/favourite-list", storeController.getFavouriteList);
storeRouter.get("/host/host-home-list", storeController.gethostHomes)
storeRouter.get("/homes/:homesId",storeController.getHomesDetails);
storeRouter.get("/rules/:homeId", storeController.getRules);  // Route to view rules
storeRouter.get("/store/bookings",storeController.getBookings);
storeRouter.get("/store/home-list", storeController.getHomes);
storeRouter.post("/favourite-list",storeController.postAddtofavourite);
storeRouter.post("/favourite/delete/:homeId",storeController.deletefavbyId)

module.exports = storeRouter;