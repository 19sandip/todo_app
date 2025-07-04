import {Schema, model} from 'mongoose';

const taskSchema = new Schema({
   title: {
         type: String,
         required: true
   },
   description : {
          type: String,
   },
   owner :{
            type: Schema.Types.ObjectId,
            ref:  'user',
   }, 
   assigned_user : {
            type: Schema.Types.ObjectId,
            ref:  'user'
   },
   status : {
         type: String,
         enum: ['pending', 'in-progress', 'done'],
         default: 'pending'
   },
   priority : {
         type: String,
         enum: ['low', 'medium', 'high'],
         default: 'medium'
   },

})

const Task = model('task', taskSchema);
export default Task;