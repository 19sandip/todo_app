import { useState, useContext } from "react";
import "./styles/login.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authentication/Authentication.js";
import MyForm from "../components/Form.js";
import MyButton from "../components/Button.js";
import MyInput from "../components/Input.js";

function Login() {
  const { handleLogin, getHistory } = useContext(AuthContext);
  const navigate = useNavigate();
  const [emailAndPassword, setEmailAndPassword] = useState({
    email: "",
    password: "",
  });

  const login = async (e) => {
    e.preventDefault();
    if (!emailAndPassword.email || !emailAndPassword.password) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res = await handleLogin(emailAndPassword);
      if (res.success) {
        setEmailAndPassword({});
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("token", res.token);
        localStorage.setItem("tasks", JSON.stringify(res.user.created_Tasks));

        localStorage.setItem(
          "assignedTasks",
          JSON.stringify(res.user.assigned_Tasks)
        );
        localStorage.setItem(
          "teamMates",
          JSON.stringify(res.user.team_members)
        );
        await getHistory();
        alert(res.message);
        navigate("/");
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailAndPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="loginFormPage">
      <MyForm onSubmit={login} className="loginForm">
        <div className="backToHome">
          <span onClick={() => navigate("/")}>Back to home</span>
        </div>
        <h2>Login</h2>
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
        <MyButton className="button" text="Submit" />
        <div>
          New user ?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ cursor: "pointer" }}
          >
            <b>Signup</b>
          </span>
        </div>
      </MyForm>
    </div>
  );
}

export default Login;
