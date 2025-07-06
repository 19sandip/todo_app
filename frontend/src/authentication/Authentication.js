import axios from 'axios';
import { createContext} from 'react';
import { useState } from 'react';



export const AuthContext = createContext({});

const server = "http://localhost:3003"

const client = axios.create({
    baseURL: `${server}/api`
})


export const AuthProvider = ({ children}) =>{

  const [allTask, setAllTask] = useState({})

  const handleRegister = async (user) => {
    let {name, email, password} = user;
    let newUser ={
      name,
      email,
      password 
    }
    try{
         let res = await client.post("/user/register", newUser);
          return res.data;
    } catch(err){
        console.error("Error while signup ")
        return {message: "Error while signup"};
    }

  }


  const handleLogin = async (user) =>{
    console.log("user:", user)
     if(!user) return {message: "user credentials are required for login"}
    try{
      let res =  await client.post("/user/login", user);
      return res.data;
    } catch(err){
        return {message : "Error while logging in"};
    }
  }

  let handleLogout = async () => {
    let {userName} = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
    if(!userName){
      return {message : "userName is required"}
    }
 try{

  let res = await client.post("/logout", {userName});
  if(res.status === 200){
    localStorage.removeItem("user");
  }
  return res.data;
 } catch(err){
   return err.response;
 }

  }


  let addHistory = async (doerId, action)=>{
    if(!doerId){
        return {message: "doer's id is required"}
    }
    try{
      let res = await client.post("/history/add", {
       doerId, action, time : new Date()
      })
      return res;
    } catch(err){
         console.error("Error while adding history", err)
       return err;
    }
  }


  let getHistory = async (token) =>{
    try{
      let res = await client.get("/history/get");
      return res.data;
    }catch(err){
        console.error("Error while getting history", err)
      return err;
    }
  }

  const addTask =async (task) =>{
   const {title, description,taskStatus} = task;
   console.log("this is taskStatus", taskStatus)
   const user = localStorage.getItem("user");
   if(!title){
    return {message : "title is requred"}
   }
   try{
    const newTask = {
        title : title,
        description: description,
        status : taskStatus,
        owner : user._id
    }
    const res = await client.post("/task/create", newTask);
    return res.data;

   }catch(err){
    console.error("Error while adding task :", err)
    return {message : "Error while adding task :", err}
   }


   
    
  }


  const getTask = async (userId) =>{
    console.log(userId, "userId from context")
   if(!userId){
    return {message : "user's id is requred"}
   }
   try{
    const res = await client.get("/task/get", { params: { userId } });
    console.log("res:", res);
    if(res.data.success){
      setAllTask(res.data.tasks);
    }
    return res.data.tasks;

   }catch(err){
    console.error("Error while getting task :", err)
    return {message : "Error while getting task :", err}
   }
  }



  const editTask =async (taskId, newTask) =>{
      if(!taskId){
        return {message : "taskId is requred"}
      }
      try{
        const res = await client.post("/task/edit", newTask);
        return res.data;
      } catch(err){
        console.error("Error while editting task: ", err);
        return {message: "Error while editting task"}
      }
  }


  const deleteTask =async (taskId) =>{
         if(!taskId) return {message : "taskId is required"};
         try{
        const res = await client.delete("/task/edit", taskId)
        return res.data;
         }catch(err){
            console.error("Error while deleting task: ", err);
        return {message: "Error while deleting task"}
         }
  }


  const assignTask =async (taskId, assigned_user_id) =>{
 if(!taskId || !assigned_user_id) return {message : "taskId and assignee id is required"};
         try{
        const res = await client.delete("/task/assign", {taskId, assigned_user_id})
        return res.data;
         }catch(err){
            console.error("Error while assigning task: ", err);
        return {message: "Error while assigning task"}
         }
  }








let handlers = {handleRegister, handleLogin, handleLogout, assignTask, deleteTask, editTask, addTask, getHistory, addHistory, getTask, allTask , setAllTask};

return(<AuthContext.Provider value={handlers}>
         {children}
</AuthContext.Provider>)

}