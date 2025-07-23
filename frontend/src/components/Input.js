import "./styles/myInput.css";
import React from "react";

const MyInput = ({ type, placeholder, value, onChange, className, name }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`myInput ${className}`}
      name={name}
    />
  );
};

export default MyInput;
