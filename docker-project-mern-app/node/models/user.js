const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  f_sno: {
    type: Number,
    unique: true,
  },
  f_userName: {
    type: String,
    required: true,
    unique: true,
  },
  f_Pwd: {
    type: String,
    required: true,
  },
});

userSchema.plugin(AutoIncrement, { inc_field: 'f_sno' });
const User = mongoose.model('User', userSchema);
module.exports = User;