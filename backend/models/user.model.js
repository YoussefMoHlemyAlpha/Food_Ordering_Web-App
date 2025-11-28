import { Schema, Types, model } from "mongoose";



export const userSchema = Schema({
    firstName: {
        type: String,
        required: true,
        min: 3
    },
    lastName: {
        type: String,
        required: true,
        min: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 20

    },
    confirmPassword: {
        type: String,
        required: true,
        min: 6,
        max: 20
    },
    role: {
        type: String,
        enum: ["user", "admin", 'deliveryMan'],
        default: "user"
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },


}, { timestamps: true })

export const userModel = model('user', userSchema)