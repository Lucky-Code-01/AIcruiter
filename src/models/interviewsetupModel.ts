import mongoose,{Schema} from 'mongoose'

const interviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSchema",
        required: true
    },

    role: {
        type: String,
        required: true
    },

    experience: {
        type: Number,
        required: true
    },

    interviewType: {
        type: String,
        required: true
    },

    skills: [
        {
            type: String
        }
    ],

    projects: [
        {
            type: String,
        }
    ]
},{timestamps:true})

export default mongoose.models.interviewSChema || mongoose.model('interviewSChema',interviewSchema);
