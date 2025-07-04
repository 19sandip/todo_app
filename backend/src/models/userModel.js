import {Schema, model} from 'mongoose';

const userSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    created_Tasks : {
        type : [Schema.Types.ObjectId],
        ref: 'task',
    }

})

const User = model('user', userSchema);
export default User;