import { Schema, Types, model } from "mongoose";

export const reviewSchema = Schema({
    userId: {
        type: Types.ObjectId,
        ref: "user",
        required: true,
    },
    orderId: {
        type: Types.ObjectId,
        ref: "order",
        required: true,
    },
    menuItemId: { // Added this field
        type: Types.ObjectId,
        ref: "menuItem",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
    },
}, {
    timestamps: true
});

export const reviewModel = model("review", reviewSchema);