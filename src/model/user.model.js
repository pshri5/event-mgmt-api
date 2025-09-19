import mongoose,{Schema} from "mongoose";

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
        required: true
    },
},{timestamps: true})





export const User = mongoose.model("User",userSchema)