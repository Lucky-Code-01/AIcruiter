import mongoose,{ Schema } from 'mongoose'

const interviewsessionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userSchema',
        required: true
    },

    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interviewSChema',
        required: true
    }, 

    result: [
        {
            question: String,
            answer: {
                type: String,
                default: ""
            },
            score: {
                type: Number,
                default: 0
            },
            feeback: {
                type: String,
                default: ""
            }
        }
    ],

    currentQuestionIndex: {
        type: Number,
        default: 0
    },

    totalQuestion: {
        type: Number,
        default: 5
    },

    interviewStatus: {
        type: String,
        enum: ["in-progress", "completed"],
        default: "in-progress"
    }
},{ timestamps: true });

interviewsessionSchema.index(
  { interviewId: 1, userId: 1 },
  { unique: true }
);


export default mongoose.models.interviewsessionSchema || mongoose.model('interviewsessionSchema', interviewsessionSchema);