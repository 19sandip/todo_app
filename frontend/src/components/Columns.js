import { Droppable, Draggable } from "react-beautiful-dnd";
import MyCard from "./Card.js";
import MyButton from "./Button.js";

const MyColumn = ({
  columnId,
  tasks,
  handleTaskDelete,
  setIsAssignTaskFormOpen,
  setIsEditTaskFormOpen,
  setIsAddTaskFormOpen,
  isAddTaskFormOpen,
  isEditTaskFormOpen,
  isAssignTaskFormOpen,
  setTaskId,
  setTaskStatus,
  handleSmartAssign,
}) => {
  const teamMates = JSON.parse(localStorage.getItem("teamMates"));

  return (
    <div className={`column column-${columnId}`} key={columnId}>
      <h2>{columnId}</h2>
      <Droppable
        key={columnId}
        droppableId={columnId}
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={true}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`task-list ${
              snapshot.isDraggingOver ? "dragging-over" : ""
            }`}
            style={{
              height: "100%",
              width: "100%",
            }}
          >
            {tasks &&
              tasks.map((task, taskIndex) => (
                <Draggable
                  key={task._id}
                  draggableId={task._id}
                  index={taskIndex}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                      className={snapshot.isDragging ? "dragging" : ""}
                    >
                      <MyCard task={task}>
                        <div>
                          {teamMates.some((u) => {
                            return u._id === task.assigned_user ? (
                              <span>Assigned to : {u.name}</span>
                            ) : (
                              ""
                            );
                          })}
                        </div>
                        <MyButton
                          text={"asgn"}
                          onClick={() => {
                            setIsAssignTaskFormOpen(!isAssignTaskFormOpen);
                            setTaskId(task._id);
                          }}
                        ></MyButton>
                        <MyButton
                          text={"sma"}
                          onClick={() => {
                            handleSmartAssign(task);
                          }}
                        ></MyButton>
                        <MyButton
                          text={"edit"}
                          onClick={() => {
                            setIsEditTaskFormOpen(!isEditTaskFormOpen);
                            setTaskId(task._id);
                          }}
                        ></MyButton>
                        <MyButton
                          text={"del"}
                          onClick={(e) =>{ 
                            e.stopPropagation();
                            handleTaskDelete(e, task)
                          }}
                        ></MyButton>
                      </MyCard>
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
            <div
              className="add-task-button"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "4rem",
              }}
            >
              <MyButton
                text={"Add Task"}
                onClick={() => {
                  setIsAddTaskFormOpen(!isAddTaskFormOpen);
                  setTaskStatus(columnId);
                }}
              ></MyButton>
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default MyColumn;
