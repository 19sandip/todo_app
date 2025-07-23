import "./styles/myTextarea.css";
import React from "react";

const MyTextarea = ({
  placeholder,
  name,
  onChange,
  text,
  className,
  value,
}) => {
  return (
    <textarea
      onChange={onChange}
      className={`myTextarea ${className}`}
      placeholder={placeholder}
      name={name}
      value={value}
    >
      {text}
    </textarea>
  );
};

export default MyTextarea;
