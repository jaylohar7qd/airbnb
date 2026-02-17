// Core Modules
/*this.houseName = houseName;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.photo = photo;
    this.description=description;
    this._id=_id;
    
     save()
    static find()
    static fetchbyId
    static deletebyId
    */

const mongoose = require('mongoose');
const Favourite = require('./favourite');

const homeschema=new mongoose.Schema({           //here we said the mongoose that mujhe ek schema banake de
  houseName: {type: String, required:true},//----
  price:{type: Number, required:true},     //   |
  location:{type:String,required:true},   //   |----here required is used which says that whenever there will be the document such mention things should be there
  rating:{type: Number, required:true},    //---
  photo:String,
  description:String,
  rulesDocument:String  // stores the path to the rules document (PDF/image)
})

homeschema.pre('findOneAndDelete',async function(next){
  const homeId = this.getQuery()._id;
  await Favourite.deleteMany({houseId:homeId});
  next;
  
});
module.exports = mongoose.model('Home',homeschema);
