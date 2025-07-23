import React from "react";
import "./styles/signup.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../authentication/Authentication";
import MyButton from "../components/Button.js";
import MyInput from "../components/Input.js";
import MyForm from "../components/Form.js";
import myTextarea from "../components/Textarea.js";

function Signup() {
  const { handleRegister } = useContext(AuthContext);
  const [user, setUser] = React.useState({});
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if(!user.name || !user.email || !user.password) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res = await handleRegister(user);

      if (res.success) {
        setUser({});
        alert("Signup successful");
        navigate("/login");
      } else {
        alert("Signup failed: " + res.message);
      }
    } catch (err) {
      console.error("Error during signup:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };
  
  return (
    <div className="signupFormPage">
      <MyForm onSubmit={handleSignup}>
        <div className="backToHome">
          <span onClick={() => navigate("/")}>Back to home</span>
        </div>
        <h2>Signup</h2>
        <MyInput
          type="text"
          placeholder="full name"
          name="name"
          onChange={handleChange}
          className="input"
        />

        <MyInput
          type="text"
          placeholder="email"
          name="email"
          onChange={handleChange}
          className="input"
        />

        <MyInput
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
          className="input"
        />

        <MyButton text={"Submit"} />
        <div>
          Already have an account ?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer" }}
          >
            <b>Login</b>
          </span>
        </div>
      </MyForm>
    </div>
  );
}

export default Signup;
