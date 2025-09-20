import mongoose,{Schema} from "mongoose"
import { User } from "./user.model"

const participantSchema = new Schema({
    user:{
        type: mongooose.Types.objectId,
        ref: User,
        required: true,
    },
    role:{
        type: String,
        enum: ["Owner","Admin","Paticipant"],
        default: "Participant",
    },
    joinedAt:{
        type: Date,
        default: Date.now
    }
},{timestamps:true})