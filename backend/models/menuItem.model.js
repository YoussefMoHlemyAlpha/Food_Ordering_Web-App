import { Schema,Types,model } from "mongoose";



export const menuItemSchema=Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    categoryId:{
        type:Types.ObjectId,
        ref:"category",
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    }

},{
    timestamps:true})


export const ItemModel=model("menuItem",menuItemSchema)    