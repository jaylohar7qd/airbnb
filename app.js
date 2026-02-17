// Core Module
const path = require('path');


// External Module
const express = require('express');
const session = require('express-session');
const {default: mongoose} = require('mongoose');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const MONGO_DB_path="mongodb+srv://loharjai6_db:jay@jay.yskdkdi.mongodb.net/airbnb?appName=jay"

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter= require("./routes/auth_Router")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");





const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


const randomString=(length)=>{
  const character='abcdefghijklmnopqrstuvwxyz';
  let result='';
  for(let i=0;i<length;i++){
    result+=character.charAt(Math.floor(Math.random()*character.length))
  }
  return result;
}
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"uploads/");
  },
  filename:(req,file,cb)=>{
    cb(null,randomString(10)+'-'+file.originalname);

  }
})
const filefilter=(req,file,cb)=>{
  // Accept images and PDF documents
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg'|| file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf'){
    cb(null,true);
  }
  else{cb(null,false);}
}
const multerOption={
  storage,filefilter
};

app.use(express.urlencoded());
// Handle multiple file uploads: photo and Rulephoto
app.use(multer(multerOption).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'Rulephoto', maxCount: 1 }
]))
app.use(express.static(path.join(rootDir, 'public')))
app.use("/uploads",express.static(path.join(rootDir,'uploads')))
app.use("/host/uploads",express.static(path.join(rootDir,'uploads')))

app.use(session({
  secret:"Knowloedge AI with Complete Coding",
  resave:false,
  saveUninitialized:true,
  
}))
app.use((req,res,next)=>{
  console.log("cookie get check overhere",req.get('Cookie'));
  req.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.user = req.session.user || {};
  next();
})
app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req,res,next)=>{
  if (req.isLoggedIn){
    return next();
  }
  else{
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);



app.use(errorsController.pageNotFound);
const PORT = 3000;


mongoose.connect(MONGO_DB_path).then(()=>{
  console.log("connect to mongo")
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });

}).catch(err =>{
  console.log('Error while connecting to mongo:',err);
});