const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  console.log("=== DEBUG getIndex ===");
  console.log("session.isLoggedIn:", req.session.isLoggedIn);
  console.log("req.isLoggedIn:", req.isLoggedIn);
  console.log("session.user:", req.session.user);
  console.log("=============");
  Home.find().then(registeredHomes=>{
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user
    })
  }).catch(err => {
    console.log("Error fetching homes:", err);
    next(err);
  });
}  

exports.getHomes = (req, res, next) => {
  Home.find().then(registeredHomes =>
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn ,
      user:req.session.user
    })
  );
};
exports.gethostHomes = (req, res, next) => {
  Home.find().then(registeredHomes =>
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "Host Home",
      isLoggedIn: req.isLoggedIn ,
      user:req.session.user
    })
  );
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn ,
    user:req.session.user
  });
};

exports.getFavouriteList = async(req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  
  
   
    res.render("store/favourite-list", {
      favouriteHomes: user.favourites,
      pageTitle: "My Favourites",
      currentPage: "favourite",
      isLoggedIn: req.isLoggedIn ,
      user:req.session.user});};
 

exports.getHomesDetails=(req,res,next)=>{
  const homesId=req.params.homesId;
  console.log("At home details page",homesId);
  Home.findById(homesId).then(homes=>{
    
    if (!homes){
      res.redirect("/homes");
      console.log('hi');
    }else {
      res.render("store/home-detail", {
      home: homes,
      pageTitle: "Home Detail",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn ,
      user:req.session.user
    });
    }
  });
};
;
exports.postAddtofavourite= async(req,res,next)=>{
 if (!req.session.user) {
   return res.redirect("/login");
 }
 const homeId =req.body.id;
 const userId=req.session.user._id;
 const user=await User.findById(userId)
 if (!user.favourites.includes(homeId)){
    user.favourites.push(homeId);
    await user.save();
 }
  res.redirect("/favourite-list");
  };
exports.deletefavbyId=async(req,res,next)=>{
  const homeId=req.params.homeId;
  const userId=req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)){
    user.favourites = user.favourites.filter(fav=> fav!=homeId);
    await user.save();
  }
 
      res.redirect("/favourite-list");
    }
;

// Controller to display rules document for a home
exports.getRules = async (req, res, next) => {
  const homeId = req.params.homeId;
  try {
    const home = await Home.findById(homeId);
    if (!home) {
      return res.redirect("/homes");
      console.log("home not found")
    }
    res.render("store/rules", {
      home: home,
      pageTitle: "House Rules - " + home.houseName,
      currentPage: "rules",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  } catch (err) {
    console.log("Error fetching rules:", err);
    res.redirect("/homes");
  }
};
 
  