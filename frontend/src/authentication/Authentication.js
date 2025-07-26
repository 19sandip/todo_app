import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({});

const server = "todo-dd5tl1q9h-sandeep-kumars-projects-9189288a.vercel.app"

const client = axios.create({
  baseURL: `${server}/api`,
});

export const AuthProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const fetchTasks = async () => {
        const user = JSON.parse(localStorage.getItem("user")) || null;
        const isFirstFetch = localStorage.getItem("isfirstFetch");

        if (user && isFirstFetch === true) {
          try {
            const tasks = await getTask(user._id); // getTask should return stringified tasks or array // if taskData is already an object, skip this line
            setTasks(tasks);
            localStorage.setItem("isfirstFetch", false);
          } catch (error) {
            console.error("Error fetching tasks:", error);
          }
        }
      };

      fetchTasks();
    });
  }, []);

  const handleRegister = async (user) => {
    let { name, email, password } = user;
    let newUser = {
      name,
      email,
      password,
    };
    try {
      let res = await client.post("/user/register", newUser);
      return res.data;
    } catch (err) {
      console.error("Error while signup ");
      return { message: "Error while signup" };
    }
  };

  const handleLogin = async (user) => {
    if (!user) return { message: "user credentials are required for login" };
    try {
      let res = await client.post("/user/login", user);
      return res.data;
    } catch (err) {
      return { message: "Error while logging in" };
    }
  };

  let handleLogout = async () => {
    let { userName } = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : {};
    if (!userName) {
      return { message: "userName is required" };
    }
    try {
      let res = await client.post("/logout", { userName });
      if (res.status === 200) {
        localStorage.removeItem("user");
      }
      return res.data;
    } catch (err) {
      return err.response;
    }
  };

  let getHistory = async () => {
    try {
      let res = await client.get("history/get");
      localStorage.setItem("history", JSON.stringify(res.data.history));
      return;
    } catch (err) {
      console.error("Error while getting history", err);
      return err;
    }
  };

  const getTask = async (userId) => {
    if (!userId) {
      return JSON.stringify({ message: "user's id required" });
    }

    try {
      const res = await client.get("/task/get", { params: { userId } });
      if (res.status === 200) {
        localStorage.setItem("tasks", JSON.stringify(res.data.tasks));
      }
      return res.data.tasks;
    } catch (err) {
      return JSON.stringify({ message: err });
    }
  };

  let handlers = {
    handleRegister,
    handleLogin,
    handleLogout,
    getHistory,
    getTask,
    tasks,
    setTasks,
  };

  return (
    <AuthContext.Provider value={handlers}>{children}</AuthContext.Provider>
  );
};
