import mongoose, { Schema } from "mongoose";

// making another type script interface for user
export interface User{
    username: string,
    email: string,
    password: string,
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "username is required!!"],
        trim: true
    },

    email: {
        type: String,
        match: [/.+\@.+\..+/,"provided a valid email"],
        required: [true, "email is required!!"],
    },

    password: {
        type: String,
        required: true,
    }
});


const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User',userSchema);

export default UserModel;
 