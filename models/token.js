const {Schema,model}= require('mongoose');

const tokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" ,required:true},
    refreshToken:{type:String,required:true},
    accessToken:String,
    createdAt:{type:Date,default:Date.now,expires: 60 * 86400}
    /// 60 => Days , 86400 number of seconds in the Day
});

exports.Token = model('Token',tokenSchema);