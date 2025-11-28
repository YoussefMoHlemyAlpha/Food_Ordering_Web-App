import { Schema,Types,model } from "mongoose";


export const categorySchema=Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },

})

export const categoryModel=model("category",categorySchema)