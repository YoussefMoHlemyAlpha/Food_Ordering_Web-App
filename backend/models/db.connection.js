import mongoose from "mongoose";
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.Mongo_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
};
export default dbConnection;