import "./styles/myForm.css";
import React from "react";

const MyForm = ({ onSubmit, children, className, style, ...props }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`myForm ${className}`}
      style={style}
      {...props}
    >
      {children}
    </form>
  );
};

export default MyForm;
