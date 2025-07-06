import React, { useState, useContext } from "react";
import "../styles/login.css"
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../authentication/Authentication";


function Login() {
    const { handleLogin, getTask,setAllTask} = useContext(AuthContext);
    const navigate = useNavigate();
    const [emailAndPassword, setEmailAndPassword] = useState({})


    const login = async (e) => {
    e.preventDefault();
    try{
        const res = await handleLogin(emailAndPassword);
        if(res.success){
            setEmailAndPassword({});
            localStorage.setItem("user", JSON.stringify(res.user))
            localStorage.setItem("token", res.token);
            const userId = res.user._id;
            await getTask(userId);
            alert(res.message);
            navigate("/")
        }else{
           alert(res.message);
        }

    } catch(err){
        console.log("Error in login : ", err)
    }

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmailAndPassword((prev) => ({
            ...prev,
            [name]: value
        }

        ))
    }

    return (
        <div className="loginFormPage">
            <form onSubmit={login} className="loginForm">
                <div className="backToHome"><span onClick={() => navigate("/")}>Back to home</span></div>
                <h2>Login</h2>
                <input type="text" placeholder="email" name="email" onChange={handleChange} className="input">
                </input>
                <input type="password" placeholder="password" name="password" onChange={handleChange} className="input">
                </input>
                <button className="button">Submit</button>
                <div>New user ? <span onClick={() => navigate("/signup")} style={{ cursor: "pointer" }}><b>Signup</b></span></div>
            </form>
        </div>

    )
}

export default Login;