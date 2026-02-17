const Home = require("../models/home");
const fs=require('fs')
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn 
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then(
    (home)=> {

    if(!home) {
      console.log("Home not found for editing");
      return res.redirect("/host/host-home-list");
    }
    console.log(homeId,editing, home);
    res.render("host/edit-home",{
      home:home,
      pageTitle:"Edit your Home",
      currentTitle:"host-homes",
      editing:editing,
      isLoggedIn: req.isLoggedIn ,
      user:req.session.user
    })
  });
};


exports.getHostHomes = (req, res, next) => {
  Home.find().then(registeredHomes =>
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn ,
      user:req.session.user
    })
  );
};

exports.postAddHome = (req, res, next) => {
  const { houseName,price, location, rating,  description} = req.body;
  console.log('Files received:', req.files);
  
  if (!req.files || !req.files.photo){
    return res.status(422).send("No images provided")
  }
  const photo = req.files.photo[0].path;
  
  // Get rules document path if uploaded
  let rulesDocument = null;
  if (req.files.Rulephoto && req.files.Rulephoto[0]) {
    rulesDocument = req.files.Rulephoto[0].path;
  }
  
  const home = new Home({houseName, price, location, rating, photo, description, rulesDocument});
  home.save().then(()=>{
    console.log('Home Saved successfully')
  });

  res.redirect("/host/host-home-list");
};
exports.postEditHome = (req,res,next)=>{
  const { id, houseName,price,location,rating,description } =req.body;
  Home.findById(id).then((home)=>{
    home.houseName=houseName;
    home.price=price;
    home.location=location;
    home.rating=rating;
    home.description=description;
    
    // Handle photo upload
    if (req.files && req.files.photo && req.files.photo[0]){
      const oldPhoto = home.photo;
      home.photo = req.files.photo[0].path;
      // Delete old photo if it exists
      if (oldPhoto) {
        fs.unlink(oldPhoto, (err) => {
          if (err) {
            console.log("Error while deleting the old photo", err);
          }
        });
      }
    }
    
    // Handle rules document upload
    if (req.files && req.files.Rulephoto && req.files.Rulephoto[0]){
      const oldRulesDoc = home.rulesDocument;
      home.rulesDocument = req.files.Rulephoto[0].path;
      // Delete old rules document if it exists
      if (oldRulesDoc) {
        fs.unlink(oldRulesDoc, (err) => {
          if (err) {
            console.log("Error while deleting the old rules document", err);
          }else {
            home.photo = req.file.path;
          }
        });
      }
    }

    return home.save();
  }).then(result =>{
    console.log('result:',result);
    res.redirect("/host/host-home-list");
  }).catch(err=>{
    console.log("error while updating",err);
    res.redirect("/host/host-home-list");
  });
};
exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("home id is ",homeId)
  Home.findByIdAndDelete(homeId).then(()=>{
    res.redirect("/host/host-home-list");
  }).catch(error =>{
    console.log("Error while deleting",error);
  })
};
  
  

