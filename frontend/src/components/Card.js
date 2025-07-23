import  { forwardRef } from "react";
import "./styles/myCard.css";

const MyCard = forwardRef(
  ({ children, className, task, draggableProps, dragHandleProps }, ref) => {
    return (
      <div
        className={`card ${className}`}
        ref={ref}
        {...draggableProps}
        {...dragHandleProps}
        key={task._id}
      >
        <div className="card-header">
          <h2>{task.title}</h2>
        </div>
        <div className="card-body">{children}</div>
      </div>
    );
  }
);

export default MyCard;
