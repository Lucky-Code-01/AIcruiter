import mongoose from "mongoose";

interface mongooseConnection{
    conn: typeof mongoose | null;
    promise: Promise <typeof mongoose> | null;
};

declare global {
    var mongoose : mongooseConnection;
}

const cached = global.mongoose || {conn: null, promise: null};

if(!global.mongoose){
    global.mongoose = cached;
}

async function dbConnection(){
    try{
        if(cached.conn){
            console.log("Database Already Connected!!");
        }

        if(!cached.promise){
            cached.promise = mongoose.connect((`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.towglxj.mongodb.net/${process.env.MONGODB_DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`))
        }

        cached.conn = await cached.promise;
        console.log("Database Connected Successfully!!");
        return cached.conn;
    }
    catch(error){
        throw new Error("Database Connection Failed!!");
    }
}

export default dbConnection;
