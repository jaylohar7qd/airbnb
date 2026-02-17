// either ways const Home = require("../models/home");
const {check, validationResult}=require("express-validator");
const bcrypt=require("bcryptjs")
const User = require("../models/user");
exports.getlogin = (req, res, next) => {
  res.render("auth/login", {

    pageTitle: "Login",
    currentPage: "login",
    
    isLoggedIn: false,
    oldInput:{email:""},
    errormessages:[],
    user:{}
  });
};
exports.getIndex = (req, res, next) => {
  // Home.find().then(registeredHomes=>{
  //   res.render("store/index", {
  //     registeredHomes: registeredHomes,
  //     pageTitle: "airbnb Home",
  //     currentPage: "index",
  //   })
  // });
  res.redirect("/")
}  
exports.postLogin = async(req,res,next)=>{
  try {
  const{email,password} = req.body;
  console.log("postLogin called with email:", email);
  const user= await User.findOne({email});
  if(!user){
    return res.status(422).render("auth/login",{
      pageTitle:"Login",
      currentPage:"login",
      isLoggedIn:false,
      errormessages:["User does not exist"],
      oldInput: {email},
      user:{}
      
    })
  } 
  const isMatch= await bcrypt.compare(password,user.password);
  if (!isMatch){
    return res.status(422).render('auth/login',{
      pageTitle:'Login',
      isLoggedIn:false,
      currentPage:"login",
      errormessages:['Invalid Password'],
      oldInput:{email},
      user:{}
    });
  }
  
  req.session.isLoggedIn=true;
  
  // Convert mongoose document to plain object to avoid BSON version conflicts
  req.session.user = user.toObject ? user.toObject() : user;
  // Convert _id to string to prevent ObjectId serialization issues
  req.session.user._id = req.session.user._id.toString();
  console.log("Login successful - Setting isLoggedIn: true, user:", user.email);
  req.session.save((err) => {
    if (err) {
      console.log("Session save error:", err);
      return res.redirect("/login");
    }
    console.log("Session saved successfully, redirecting to /");
    res.redirect("/");
  });
  } catch(err) {
    console.log("postLogin error:", err);
    next(err);
  }
};

exports.postLogout = (req,res,next)=>{
  // res.cookie("isLoggedIn",false);
  req.session.destroy(()=>{
    res.redirect("/login");
  });
}
exports.goto_sign_in_page = (req, res, next) => {
  res.render("auth/Signup", {

    pageTitle: "Signup",
    currentPage: "signup",

    isLoggedIn: false,
    errormessages:[],
    oldInput:{firstName:"",lastName:"",email:"",userType:""},
    user:{}
  });
};
exports.postSignup = [
check("firstName")
.trim()
.isLength({min:2})
.withMessage("First Name should be atleast 2 character long")
.matches(/^[A-Za-z\s]+$/)
.withMessage("First Name should contain only alphabets"),

check("lastName")
.matches(/^[A-Za-z\s]*$/)
.withMessage("last Name should contain only alphabets"),

check("email")
.isEmail()
.withMessage("Please enter a valid email")
.normalizeEmail(),

check("password")
.isLength({min:8})
.withMessage("Password should be atleast 8 characters long")
.matches(/[a-z]/)
.withMessage("Password should have atleast 1 lower character ")
.matches(/[A-Z]/)
.withMessage("Password should have atleast 1 uppercase character")
.matches(/[0-9]/)
.withMessage("Password should have atleast 1 number")
.matches(/[!@#$%^&*()_+.,/|}{}\";<>?|]/)
.withMessage("Password should have atleast 1 special character")
.trim(),

check('confirm_password')
.trim()
.custom((value,{req})=>{
  if(value !== req.body.password){
    throw new Error("Passwords do not match");

  }
  return true;
}),

check('userType')
.notEmpty()
.withMessage('UserType is required')
.isIn(['guest','host'])
.withMessage('Invalid user type'),

check('terms')
.notEmpty()
.withMessage('please fill this')
.custom((value,{req})=>{
  if (value !=="on"){
    throw new Error("please accept the terms and condition")
  }
  return true;
})
,
(req,res,next)=>{
 const{firstName,lastName,email,password,userType}=req.body;
 const errors = validationResult(req);
 if(!errors.isEmpty() ){
  return res.status(422).render('auth/Signup',{
    pageTitle:'Sign Up',
    currentPage: 'Signup',
    isLoggedIn :false,
    errormessages:errors.array().map(error => error.msg),
    oldInput:{firstName,lastName,email,password,userType,
      user:{}
    }
  })
 } 
 bcrypt.hash(password,12).then(hashPassword => {
  const user = new User({firstName,lastName,email,password :hashPassword,userType});
 return user.save()
 })
 .then(()=>{
  res.redirect("/login");
 }).catch(err=>{
  console.log("Error while saving user: ",err );
   return res.status(422).render('auth/Signup',{
    pageTitle:'Sign Up',
    currentPage: 'Signup',
    isLoggedIn :false,
    errormessages:[err.messages],
    oldInput:{firstName,lastName,email,userType},
      user:{}
    
  })
 });
 

}]


