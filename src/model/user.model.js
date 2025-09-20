import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,

    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
        required: [true,"Password is required"]
    },
},{timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next() //prevents rehashing of password
    
    this.password = await bcrypt.hash(this.password,10) //hashes the password before saving 
    next()

})



export const User = mongoose.model("User",userSchema)