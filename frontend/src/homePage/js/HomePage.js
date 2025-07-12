import "../styles/home.css";
import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AuthContext } from "../../authentication/Authentication";
import { io } from "socket.io-client";


const server_url = "http://localhost:3003";


function HomePage() {

  const user = JSON.parse(localStorage.getItem("user")) || null;
  const { tasks, setTasks } = useContext(AuthContext) // not in use
  const [taskStatus, setTaskStatus] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const socketRef = useRef();
  const [columns, setColumns] = useState({
    pending: [],
    inProgress: [],
    done: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(server_url, {
      transports: ["websocket"], // 👈 avoid polling issues
      reconnection: true,
    });
    socketRef.current.on("connection", () => {

    });

    socketRef.current.on("addTask", (res) => {
      if(res.socketId === socketRef.current.id) {
          alert(res.message);
      }
          if (res && res.success) {
            const localStorageTasks = JSON.parse(localStorage.getItem("tasks")) || [];
            localStorageTasks.push(res.task);
            localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
           setColumns((prevColumns) => {
          const updatedColumns = { ...prevColumns };
          Object.keys(updatedColumns).forEach(column => {
            if( column === res.task.status) {
           updatedColumns[column].push(res.task);
            }
          });
          return updatedColumns;
        });
            setDescription("");
            setTitle("");
            setTaskStatus("");
            setIsAddTaskFormOpen(false)
            navigate("/");
          } else {
            alert("something went wrong while adding task");
          }
        })

    socketRef.current.on("deleteTask", (res) => {
      if (res && res.success) {
        if(res.socketId === socketRef.current.id) {
           alert(res.message);
        }

        const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
        console.log("localStorageTasks", localStorageTasks);
        const updatedTasks = localStorageTasks.filter(task => task._id !== res.taskId);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        setColumns((prevColumns) => {
          const updatedColumns = { ...prevColumns };
          Object.keys(updatedColumns).forEach(column => {
            updatedColumns[column] = updatedColumns[column].filter(task => task._id !== res.taskId);
          });
          return updatedColumns;
        });
      }
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("connection error", err.message);
    });
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);


  useEffect(() => {

    const fetchTasks = async () => {
      try {
        const allTaskFromLS = JSON.parse(localStorage.getItem("tasks")) || null;
        const allTask = {
          pending: allTaskFromLS?.filter((task) => task.status === 'pending'),
          inProgress: allTaskFromLS?.filter((task) => task.status === 'inProgress'),
          done: allTaskFromLS?.filter((task) => task.status === 'done'),
        };
        setColumns(allTask);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }

    };

    fetchTasks();

  }, []); // Only run on mount or refresh

console.log("dragging man ...................................")


  const onDragEnd = (result) => {
    const { source, destination } = result;
   console.log("Before state:", JSON.stringify(columns[source.droppableId]));
console.log("Dragging:", result.draggableId);
console.log("From", source.index, "to", destination.index);
console.log("Destination:", JSON.stringify(columns[destination.droppableId]));


    //  Only check for destination
    if (!destination) return;
    if(source.droppableId === destination.droppableId && source.index === destination.index){
      return;
    }

    //  Same column reordering
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(columns[source.droppableId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setColumns((prevColumns) => ({
        ...prevColumns,
        [source.droppableId]: items,
      }));
    } else {
      // Moving between columns
      const sourceItems = Array.from(columns[source.droppableId]);
      const destItems = Array.from(columns[destination.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setColumns((prevColumns) => ({
        ...prevColumns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      }));
    }
  };


  const handleAddTaskFormState = () => {
    if (isAddTaskFormOpen) {
      setIsAddTaskFormOpen(false)
    }
  }



  const handleAddTask = async (e) => {
    // e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Login to add task")
      navigate("/login")
      return;
    }

    try {
      socketRef.current.emit(
        "addTask",
        { title, description, status: taskStatus, userId: user._id },
      );
    } catch (err) {
      console.error("Error in adding task:", err);
      alert(err);
    }
  }

  const handleTaskDelete = async (taskId) => {
    if (!taskId) {
      alert("task id is required to delete task");
      return;
    }
    if (!socketRef.current) {
      alert("Socket connection is not established");
      return;
    }

    try {
      socketRef.current.emit("deleteTask", { taskId })

    } catch (err) {
      console.error("Error in deleting the task: ", err);
      return;
    }
  }


  return (
    <div id="home" className="home">
      <header>
        <h1>Todo APP</h1>
      </header>

      <div className="container" onClick={() => handleAddTaskFormState()} style={{ opacity: isAddTaskFormOpen ? .5 : 1 }}>

        <div className="userContainer">

          {
            user ? (
              <div className="userDetails">
                <h3>Welcome, {user.name}</h3>

                <button onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  localStorage.removeItem("tasks");
                  navigate("/login");
                }} className="btn logoutbtn">Logout</button>
              </div>
            ) : (
              <div className="userDetails">
                <button onClick={() => navigate("/login")} className="btn loginbtn">Login</button>
                <h3>Please Login to see your tasks</h3>
              </div>
            )
          }

        </div>

        <div className="main_container columns">
          <DragDropContext onDragEnd={onDragEnd}>


            {columns && Object.entries(columns).map(([columnId, tasks]) => (

              <Droppable key={columnId} droppableId={columnId}>

                {
                  (provided) => (
                    <div
                      ref={provided.innerRef}
                      { ...provided.droppableProps }
                      className="column"
                    >
                      <h3 style={{ textTransform: "capitalize", textAlign: "center" }} >{columnId}</h3>


                      {tasks && tasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                userSelect: "none",
                                ...provided.draggableProps.style,
                              }}
                              className={`task ${snapshot.isDragging ? 'dragging' : ''} `}
                            >
                              <h3> {task.title}</h3>
                              <div className="taskActions">
                                {console.log(typeof(task._id))}
                                <button className="actionbtn" onClick={() => handleTaskDelete(task._id)}>Del</button>
                                <button className="actionbtn">asgn</button>
                                <button className="actionbtn">edit</button>
                              </div>
                            </div>
                          )}
                           
                        </Draggable>
                       
                      ))}
                      {provided.placeholder}
                      <div className="addTaskField">
                        <p onClick={() => { setIsAddTaskFormOpen(!isAddTaskFormOpen); setTaskStatus(columnId) }} className="addTaskButton">Add Task</p>
                      </div>

                    </div>
                  )
                }

              </Droppable>
            ))

            }



          </DragDropContext>
        </div>


      </div>

      <form className="addTaskForm" style={{ display: isAddTaskFormOpen ? 'flex' : 'none' }} onSubmit={handleAddTask}>
        <div className="addTaskInputFeild">
          <h1>Add Task</h1>
          <input type="text" placeholder="titel" required className="input" name="title" onChange={(e) => { e.preventDefault(); setTitle(e.target.value) }} value={title}></input>
          <textarea type="text" placeholder="description" className="input" name="description" onChange={(e) => { e.preventDefault(); setDescription(e.target.value) }} value={description}></textarea>
          <button className="addTaskButton">Add Task</button>
        </div>


      </form>

    </div>
  )
}

export default HomePage;

