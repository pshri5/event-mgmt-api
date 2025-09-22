import mongoose,{Schema} from "mongoose";
import { User } from "./user.model";

const eventSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true,
    },
    eventType:{
        type: String,
        required: true,
        enum: ["conference","workshop","seminar","other"]
    },
    price:{
        type: Number,
        required: true
    },
    Owner:{
        type: mongoose.Types.ObjectId,
        ref: User,
        required: true,
    },
    status:{
        type: String,
        enum: ["draft","published","completed","cancelled"],
        default: "draft"
    },
    capacity: {
        type: Number,
        default: 100
        
    },
    participants:{
        type: mongoose.Types.ObjectId,
        ref: User
    },
    startDate:{
        type: Date,
        required: true,
    },
    endDate:{
        type: Date,
        required: true
    }
},{timestamps:true})

//Validation for start and end date where end date is after start date
eventSchema.pre("save",function(next){
    if (this.endDate<this.startDate) {
        next(new Error("End date must be after start date"))
    }else{
        next()
    }
})

//Number of spots left
eventSchema.virtual("availableSpots").get(function(){
    return this.capacity- this.participants.length
})

// Add validation method to prevent last-minute cancellations
eventSchema.methods.canCancel = function() {
    const hoursBeforeEvent = 24; // Configurable
    const currentTime = new Date();
    const timeDifference = this.startDate.getTime() - currentTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    return hoursDifference > hoursBeforeEvent;
}


export const Event = mongoose.model("Event",eventSchema)