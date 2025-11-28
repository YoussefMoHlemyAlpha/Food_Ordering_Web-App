import mongoose from "mongoose";
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.Mongo_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};
export default dbConnection;