import axios from 'axios';
import { createContext, useState, useEffect} from 'react';




export const AuthContext = createContext({});

const server = "http://localhost:3003"

const client = axios.create({
    baseURL: `${server}/api`
})


export const AuthProvider = ({ children}) =>{
   const [tasks, setTasks] = useState([]);

   useEffect(() => {
      setTimeout(() => {
        const fetchTasks = async () => {
        const user = JSON.parse(localStorage.getItem("user")) || null;
        const isFirstFetch = localStorage.getItem("isfirstFetch");
  
        if (user && isFirstFetch === true) {
          console.log("Fetching tasks for user:", user._id, "isFirstFetch:", isFirstFetch);
          try {
            const tasks = await getTask(user._id); // getTask should return stringified tasks or array // if taskData is already an object, skip this line
            setTasks(tasks);
           localStorage.setItem("isfirstFetch", false);
          } catch (error) {
            console.error("Error fetching tasks:", error);
          }
        }
      };
  
      fetchTasks()
      });
      ;
    },[]);
 

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


  const getTask = async(userId)=>{
    
        if(!userId){
          return JSON.stringify({message: "user's id required"})
        }

        try{
          const res = await client.get("/task/get", { params: { userId } });
          if(res.status === 200){
            localStorage.setItem("tasks", JSON.stringify(res.data.tasks));
             setTasks(res.data.tasks);
          }
            return res.data.tasks;
        }catch(err){
          return JSON.stringify({message: err})
        }
  }

  const addTask =async (task) =>{
   const {title, description,taskStatus} = task;
   const user = JSON.parse(localStorage.getItem("user"));
   if(!user){
    return JSON.stringify({message: "login first"})
   }
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








let handlers = {handleRegister, handleLogin, handleLogout, assignTask, deleteTask, editTask, addTask, getHistory, addHistory,getTask, tasks, setTasks};

return(<AuthContext.Provider value={handlers}>
         {children}
</AuthContext.Provider>)

}