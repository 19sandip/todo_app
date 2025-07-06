import React from "react";
import "../styles/signup.css"
import {useNavigate} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../authentication/Authentication";


function Signup() {
       const {handleRegister } = useContext(AuthContext);
        const [user, setUser] = React.useState({});
        const navigate = useNavigate();

    const handleSignup = async (e) =>{
        e.preventDefault();
        try{
            const res = await handleRegister(user);
            
            if(res.success){
                setUser({});
                alert("Signup successful");
                navigate("/login");
            }else{
                alert("Signup failed: " + res.message);
            }
        }catch(err){
            console.error("Error during signup:", err);
        }
        
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    }
    return (
        <div className="signupFormPage">
            <form onSubmit={handleSignup} className="signupForm">
                 <div className="backToHome"><span onClick={()=> navigate("/")}>Back to home</span></div>
                <h2>Signup</h2>
                <input type="text" placeholder="full name" name="name" onChange={handleChange} className="input">
                </input>
                <input type="text" placeholder="email" name="email" onChange={handleChange} className="input">
                </input>
                <input type="password" placeholder="password" name="password" onChange={handleChange} className="input">
                </input>
            <button className="button">Submit</button>
            <div>Already have an account ? <span onClick={()=> navigate("/login")} style={{cursor : "pointer"}}><b>Login</b></span></div>
        </form>
        </div>
    )
}

export default Signup;