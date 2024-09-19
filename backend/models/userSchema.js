const mongoose = require('mongoose');
const {Schema} = mongoose;
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
      name:{
        type: 'string',
        required:[true,'user name is Required'],
        minLength:[5,'Name must be at least 5 char'],
        maxLength:[50,'Name must be at most 50 char'],
        trim: true,
      },
      email:{
        type: 'string',
        required:[true,'user email is Required'],
        unique:true,
        lowercase:true,
        unique:[true,'already registered']
      },
      password:{
        type: 'string',
        required:[true,'user password is Required'],
        select:false
      },
      forgotPasswordToken:{
        type: 'string',
      },
      forgotPasswordExpiryDate:{
        type: 'date',
      }
}, {
    timestamps:true,
});

userSchema.pre('save',async function(next){
  if(!this.isModified('password')) {
    return next();
  }
  this.password =  await bcrypt.hash(this.password,10);
  return next();
})

userSchema.methods = {
  jwtToken(){
    return JWT.sign(
      {id: this._id,email:this.email},
      process.env.SECRET,
      {expiresIn: '24h'}
    )
  }
}

const userModel = mongoose.model('User', userSchema)
module.exports = userModel;