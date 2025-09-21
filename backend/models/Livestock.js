import mongoose from "mongoose";

const { Schema } = mongoose;

const LivestockPlanSchema = new Schema({

    livestockId: { 
        type: String, 
        required: true 
    },

    animalType: { 
        type: String, 
        required: true 
    }, // Cow, Goat, Poultry etc

    breed: { 
        type: String
    },

    gender: { 
        type: String, 
        enum: ["Male", "Female"] 
    },

    dob: { 
        type: Date 
    },



    health: {
        healthStatus: { type: String, default: "Healthy" },
        veterinarian: { type: String }
    },
  

    // Fields added to match frontend payloads (AddLivestockPlan.jsx)
    // top-level weight (frontend may send weight directly)
    weight: { type: Number },
    // detailed feeding entries submitted from the frontend
    feedings: [
        {
            feedType: { type: String },
            quantity: { type: String },
            frequency: { type: String }
        }
    ],
    // detailed health records (dates, treatments, vet)
    healthRecords: [
        {
            date: { type: Date },
            treatment: { type: String },
            vet: { type: String }
        }
    ],
    // housing details collected on the frontend
    housing: { type: String },
  
    createdAt: { 
        type: Date, 
        default: Date.now 
    }

});

// Model name is "Livestock", collection name will be "livestock"
const Livestock = mongoose.model('Livestock', LivestockPlanSchema,'livestocks');

export default Livestock;
