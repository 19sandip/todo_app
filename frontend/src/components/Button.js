import "./styles/myButton.css";
const MyButton = ({ text, onClick, className, style, props }) => {
  return (
    <button
      className={`myButton ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {text}
    </button>
  );
};
export default MyButton;
