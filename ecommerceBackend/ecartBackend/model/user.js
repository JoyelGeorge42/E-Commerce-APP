const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator  = require('validator');
//we will bycrypt the password before saving into model
const bcrypt = require('bcrypt');
//constant for holding jwt 
const jwt = require('jsonwebtoken');
//importing crypto library from nodejs
const crypto = require('crypto'); //no need to install this is prebuild module


//SCHEMA FOR USER 
const userSchema = new Schema({
name:{
    type:String,
    required:[true,'Please enter the name'],
    maxLength:[30,'maximum length should be less then 30 char'],
    minLength:[3,'min length should be at least 3 char']
},
email:{
    type:String,
    required:[true,'Please enter the email'],
    unique:true,
    validate:[validator.isEmail,'please enter a valid email']
},
password:{
    type:String,
    required:[true,'Please enter the password'],
    minLength:[8,'min length should be at least 8 char for password'],
    select:false
},
gender:{
    type:String,
    required:[true,'Please enter the password'],
    enum: ['male', 'female', 'other']
},
createdAt: {
    type: Date,
    default: Date.now
  },
    avatar:{
            public_id: {
            type: String,
            required: true
            },
            url: {
            type: String,
            required: true
            }
    },

    role:{
        type: String,
        default:'user'
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

//writing function before saving data to UserSchema hash the password
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
this.password= await bcrypt.hash(this.password,10)
})

//generating TOKEN
userSchema.methods.getToken = function(){
    return jwt.sign({ id: this._id,role: this.role,name:this.name},process.env.JWT_SECRET_KEY,
        {expiresIn:'1h'}
        )
}

//compaire password
userSchema.methods.passwordMatcher = function(enteredpassword){
    console.log(enteredpassword,'db-password',this.password)
    return bcrypt.compare(enteredpassword,this.password)
}

//Generating Password Rest Token
userSchema.methods.getResetPasswordToken = function(){
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    //hashing and adding resetPasswordToken to UserSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15*60*1000;
    return resetToken
}

module.exports = mongoose.model('User', userSchema);