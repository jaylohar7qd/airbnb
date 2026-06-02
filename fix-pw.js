require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_DB_URI)
  .then(async () => {
    const h = await bcrypt.hash('Password@123', 12);
    await User.updateOne({email:'loharjai6@gmail.com'}, { $set: { password: h } });
    console.log('UPDATED DIRECTLY!');
    process.exit(0);
  });
