import "../styles/home.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import { io } from "socket.io-client";
import MyColumn from "../../components/Columns.js";
import MyForm from "../../components/Form.js";
import MyTextarea from "../../components/Textarea.js";
import MyButton from "../../components/Button.js";
import MyInput from "../../components/Input.js";
const server_url = "http://localhost:3003";

function HomePage() {
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const [taskId, setTaskId] = useState("");

  const taskIdRef = useRef(taskId);
  const [history, setHistory] = useState([]);
  const [doer, setDoer] = useState("");
  const [doerAction, setDoerAction] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const [isEditTaskFormOpen, setIsEditTaskFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isAssignTaskFormOpen, setIsAssignTaskFormOpen] = useState(false);
  const socketRef = useRef();
  const [columns, setColumns] = useState();
  const [openAddMemberForm, setOpenAddMemberForm] = useState(false);
  const [memberAdded, setMemberAdded] = useState(false);

  const navigate = useNavigate();

  //updating taskIdRef when taskId updated
  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);

   // here all the socket.io events are implimented
  useEffect(() => {
    socketRef.current = io(server_url, {
      transports: ["websocket"], //avoid polling issues
      reconnection: true,
    });
    socketRef.current.on("connection", () => {});

    socketRef.current.on("getHistory", (historyData) => {
      try {
        let localHistory = JSON.parse(localStorage.getItem("history")) || null;
        localHistory.unshift(historyData.newHistory);
        if (localHistory.length >= 20) {
          // Remove the oldest history item if we have more than 20
          localHistory.pop();
        }
        localStorage.setItem("history", JSON.stringify(localHistory));
        setHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          updatedHistory.unshift(historyData.newHistory);
          if (updatedHistory.length > 20) {
            updatedHistory.pop();
          }
          return updatedHistory;
        });
      } catch (err) {
        alert(err);
      }
    });

    socketRef.current.on("addTask", (res) => {
      if (res.socketId === socketRef.current.id) {
        alert(res.message);
        setDoer(user.name);
        setDoerAction(`${res.task.title} task added`);

        setDescription("");
        setTitle("");
        setTaskStatus("");
        setIsAddTaskFormOpen(false);
        const localStorageTasks =
          JSON.parse(localStorage.getItem("tasks")) || [];
        localStorageTasks.push(res.task);
        localStorage.setItem("tasks", JSON.stringify(localStorageTasks));

        setColumns((prevColumns) => {
          const updatedColumns = { ...prevColumns };

          Object.keys(updatedColumns).forEach((column) => {
            if (column === res.task.status) {
              updatedColumns[column] = [...updatedColumns[column], res.task]; // ✅ immutable update
            }
          });

          return updatedColumns;
        });
      }

      navigate("/");
    });

    socketRef.current.on("deleteTask", (res) => {
      if (res.socketId === socketRef.current.id) {
        setDoer(user.name);
        setDoerAction(`${res.task.title} task deleted`);
        alert(res.message);
      }

      if (user._id === res.userId) {
        const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
        const updatedTasks = localStorageTasks.filter(
          (task) => task._id !== res.task._id
        );
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        setColumns((prevColumns) => {
          const updatedColumns = { ...prevColumns };
          Object.keys(updatedColumns).forEach((column) => {
            updatedColumns[column] = updatedColumns[column].filter(
              (task) => task._id !== res.task._id
            );
          });
          return updatedColumns;
        });
      }

      if (user._id === res.assignedUserId) {
        const localStorageTasks = JSON.parse(
          localStorage.getItem("assignedTasks")
        );
        const updatedTasks = localStorageTasks.filter(
          (task) => task._id !== res.task._id
        );
        localStorage.setItem("assignedTasks", JSON.stringify(updatedTasks));
        setColumns((prevColumns) => {
          const updatedColumns = { ...prevColumns };
          Object.keys(updatedColumns).forEach((column) => {
            updatedColumns[column] = updatedColumns[column].filter(
              (task) => task._id !== res.task._id
            );
          });
          return updatedColumns;
        });
      }
    });

    socketRef.current.on("dragAndDrop", (res) => {
      const result = res;
      const dndResult = result.dndResult;
      if (!result.success) {
        alert("Internal server error");
        return;
      }
      const { source, destination } = dndResult;

      //dragged outside of the droppable column
      if (!destination) {
        return;
      }
      if (source.droppableId !== destination.droppableId) {
        const localTask = JSON.parse(localStorage.getItem("tasks"));
        const updatedTask = localTask.map((task) => {
          if (task._id === dndResult.draggableId) {
            return { ...task, status: destination.droppableId };
          }
          return task;
        });

        localStorage.setItem("tasks", JSON.stringify(updatedTask));
      }

      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };

        // Remove the task from the source column
        const taskToMove = updatedColumns[source.droppableId].find(
          (task) => task._id === dndResult.draggableId
        );
        updatedColumns[source.droppableId] = updatedColumns[
          source.droppableId
        ].filter((task) => task._id !== dndResult.draggableId);

        // Insert the task into the destination column at the correct index
        if (taskToMove) {
          const updatedTask = {
            ...taskToMove,
            status: destination.droppableId,
          };
          updatedColumns[destination.droppableId] = [
            ...updatedColumns[destination.droppableId].slice(
              0,
              destination.index
            ),
            updatedTask,
            ...updatedColumns[destination.droppableId].slice(destination.index),
          ];
        }

        return updatedColumns;
      });
    });

    socketRef.current.on("editTask", (res) => {
      const { message, task, socketId, success } = res;
      if (!success) {
        alert(message);
        return;
      }
      try {
        if (socketId === socketRef.current.id) {
          setDoer(user.name);
          setDoerAction(`${task.title} task edited`);
        }

        if (task.owner === user._id) {
          const localStorageTasks =
            JSON.parse(localStorage.getItem("tasks")) || [];
          if (!localStorageTasks) {
            alert("No tasks found in local storage");
            return;
          }

          const updatedTasks = localStorageTasks.map((t) => {
            if (t._id === task._id) {
              return task;
            }
            return t;
          });
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));

          setColumns((prev) => {
            const updatedColumns = { ...prev };
            Object.keys(updatedColumns).forEach((column) => {
              if (column === task.status) {
                updatedColumns[column] = updatedColumns[column].map((t) => {
                  if (t._id === task._id) {
                    return task;
                  }
                  return t;
                });
              }
            });
            return updatedColumns;
          });
        }

        //updating task for teamMate

        if (task.assigned_user === user._id) {
          const localStorageTasks =
            JSON.parse(localStorage.getItem("assignedTasks")) || [];
          if (!localStorageTasks) {
            alert("No tasks found in local storage");
            return;
          }

          const updatedTasks = localStorageTasks.map((t) => {
            if (t._id === task._id) {
              return task;
            }
            return t;
          });
          localStorage.setItem("assignedTasks", JSON.stringify(updatedTasks));

          setColumns((prev) => {
            const updatedColumns = { ...prev };
            Object.keys(updatedColumns).forEach((column) => {
              if (column === task.status) {
                updatedColumns[column] = updatedColumns[column].map((t) => {
                  if (t._id === task._id) {
                    return task;
                  }
                  return t;
                });
              }
            });
            return updatedColumns;
          });
        }

        if (socketId === socketRef.current.id) {
          setIsEditTaskFormOpen(false);
          setTitle("");
          setDescription("");
          setTaskId("");
          alert("Task edited successfully");
          navigate("/");
        }
      } catch (err) {
        alert(err);
      }
    });

    socketRef.current.on("edittingTask", (res) => {
      const { newTitle, newDes, edittinTaskId, socketId } = res;

      if (
        taskIdRef.current === edittinTaskId &&
        socketId !== socketRef.current.id
      ) {
        setTitle(newTitle);
        setDescription(newDes);
      }
    });

    socketRef.current.on("assignTask", (res) => {
      const {
        assigned_task,
        assigned_user,
        socketId,
        message,
        currUser,
        prevAssignedUser,
      } = res;
      try {
        if (socketId === socketRef.current.id) {
          setDoer(user.name);
          setDoerAction(
            `assigned ${assigned_task.title} task to ${assigned_user.name}`
          );
        }

        if (currUser._id === user._id) {
          const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
          const teamMates = JSON.parse(localStorage.getItem("teamMates"));
          const updatedTeam = teamMates.map((teamMate) => {
            if (teamMate._id === assigned_user._id) {
              return {
                ...teamMate,
                assigned_Tasks: [...teamMate.assigned_Tasks, assigned_task._id],
              };
            }
            return teamMate;
          });

          localStorage.setItem("teamMates", JSON.stringify(updatedTeam));
          const updatedTasks = tasks.map((t) => {
            if (t._id === assigned_task._id) {
              return assigned_task;
            }
            return t;
          });
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));

          // Update the columns state
          setColumns((prev) => {
            const updatedColumns = { ...prev };
            Object.keys(updatedColumns).forEach((col) => {
              if (col === assigned_task.status) {
                updatedColumns[col] = updatedColumns[col].map((t) => {
                  if (t._id === assigned_task._id) {
                    return assigned_task;
                  }
                  return t;
                });
              }
            });
            return updatedColumns;
          });
        }

        if (user._id === assigned_user._id) {
          const localUser = JSON.parse(localStorage.getItem("user")) || [];
          localUser.assigned_Tasks.push(assigned_task);
          localStorage.setItem("user", JSON.stringify(localUser));
          const assignedTasks =
            JSON.parse(localStorage.getItem("assignedTasks")) || [];
          assignedTasks.push(assigned_task);
          localStorage.setItem("assignedTasks", JSON.stringify(assignedTasks));

          setColumns((prev) => {
            const updatedColumns = { ...prev };
            Object.keys(updatedColumns).forEach((col) => {
              if (col === assigned_task.status) {
                updatedColumns[col].push(assigned_task);
              }
            });
            return updatedColumns;
          });
        }
        if (
          prevAssignedUser !== undefined &&
          prevAssignedUser !== null &&
          user._id === prevAssignedUser._id
        ) {
          const localAssignedTasks =
            JSON.parse(localStorage.getItem("assignedTasks")) || [];
          const filteredTask = localAssignedTasks.filter(
            (t) => t._id !== assigned_task._id
          );
          localStorage.setItem("tasks", JSON.stringify(filteredTask));

          setColumns((prevCols) => {
            const updatedColumns = { ...prevCols };
            Object.keys(updatedColumns).forEach((column) => {
              if (column === assigned_task.status) {
                updatedColumns[column] = updatedColumns[column].filter(
                  (task) => task._id !== assigned_task._id
                );
              }
            });
            return updatedColumns;
          });
        }

        setEmail("");
        setTaskId("");
        setIsAssignTaskFormOpen(false);
        if (socketId === socketRef.current.id) {
          alert(message);
        }
        navigate("/");
      } catch (err) {
        alert(err);
      }
    });

    socketRef.current.on("addMember", (res) => {
      const { currUser, member } = res;
      try {
        if (user._id === currUser._id) {
          const team = JSON.parse(localStorage.getItem("teamMates"));
          team.push(member);
          localStorage.setItem("teamMates", JSON.stringify(team));
          alert("member added successfully");
          setMemberAdded(!memberAdded);
        }
        if (user._id === member._id) {
          const team = JSON.parse(localStorage.getItem("teamMates"));
          team.push(currUser);
          localStorage.setItem("teamMates", JSON.stringify(team));
          setMemberAdded(!memberAdded);
        }
      } catch (err) {
        alert(err);
      }
    });

    socketRef.current.on("error", (err) => {
      setEmail("");
      setTaskId("");
      setIsAddTaskFormOpen(false);
      setIsAssignTaskFormOpen(false);
      setTitle("");
      setDoer("");
      setDoerAction("");
      setTaskStatus("");
      setDescription("");
      alert(err.message);
      navigate("/");
    });

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
    if (doer && doerAction) {
      socketRef.current.emit("setHistory", { who: doer, what: doerAction });
      setDoer("");
      setDoerAction("");
    }
  }, [doer, doerAction]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let allTaskFromLS = JSON.parse(localStorage.getItem("tasks")) || null;
        const histories = JSON.parse(localStorage.getItem("history")) || null;
        const assigned_tasks =
          JSON.parse(localStorage.getItem("assignedTasks")) || null;
        if (assigned_tasks && assigned_tasks.length > 0) {
          allTaskFromLS = [allTaskFromLS, assigned_tasks].flat();
        }
        const allTask = {
          pending: allTaskFromLS?.filter((task) => task.status === "pending"),
          inProgress: allTaskFromLS?.filter(
            (task) => task.status === "inProgress"
          ),
          done: allTaskFromLS?.filter((task) => task.status === "done"),
        };
        setColumns(allTask);
        setHistory(histories);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        alert(err);
      }
    };

    fetchTasks();
  }, []); // Only run on mount or refresh

         //function to show the peer edited info versions simultaneously
  const handleChangeForEdittingTask = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (name === "title") setTitle(value);
    if (name === "description") setDescription(value);

    // Used the value directly from the event, not from the state
    socketRef.current.emit("edittingTask", {
      newTitle: name === "title" ? value : title,
      newDes: name === "description" ? value : description,
      taskId,
    });
  };
        // function for doing rest of page blur when  a was openned
  const handleTaskActionFormState = () => {
    if (isAddTaskFormOpen) {
      setIsAddTaskFormOpen(false);
      setTitle("");
      setDescription("");
    }
    if (isEditTaskFormOpen) {
      setIsEditTaskFormOpen(false);
      setTitle("");
      setDescription("");
    }
    if (isAssignTaskFormOpen) {
      setIsAssignTaskFormOpen(false);
      setEmail("");
      setTaskId("");
    }
    if (openAddMemberForm) {
      setOpenAddMemberForm(false);
      setEmail("");
    }
  };
      // function for adding task
  const handleAddTask = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Login to add task");
      navigate("/login");
      return;
    }

    try {
      socketRef.current.emit("addTask", {
        title,
        description,
        status: taskStatus,
        owner: user._id,
      });
    } catch (err) {
      console.error("Error in adding task:", err);
      alert(err);
    }
  };

   //function for deleting the task
  const handleTaskDelete = async (e, task) => {
   
    if (!task) {
      alert("task is required to delete task");
      return;
    }
    if (!socketRef.current) {
      alert("Socket connection is not established");
      return;
    }

    try {
      socketRef.current.emit("deleteTask", { task });
    } catch (err) {
      console.error("Error in deleting the task: ", err);
      return;
    }
  };

  // edit task handler
  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!taskId || !title) {
      alert("task id and title are required to edit task");
      return;
    }
    try {
      socketRef.current.emit("editTask", {
        taskId,
        newTitle: title,
        newDescription: description,
        userId: user._id,
      });
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error in editing task: ", err);
      alert(err);
    }
  };

  //function for assigning the task to the teammate
  const assignTask = async (e) => {
    e.preventDefault();
    try {
      socketRef.current.emit("assignTask", {
        member_email: email.toLocaleLowerCase(),
        taskId,
        userId: user._id,
      });
    } catch (err) {
      alert("Error in assigning: ", err);
    }
  };


  //function for drag and drop 
  const onDragEndHandler = (result) => {
    const { source, destination } = result;
    //  Only check for destination
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    socketRef.current.emit("dragAndDrop", result);
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

      // function for adding members in the group
  const addMember = async (e) => {
    e.preventDefault();
    if (email === user.email) {
      alert("You cannot add yourself as a member");
      return;
    }
    try {
      socketRef.current.emit("addMember", {
        member_email: email,
        userId: user._id,
      });
      setEmail("");
      setOpenAddMemberForm(false);
    } catch (err) {
      console.error(err);
      alert("Error in adding member: ", err);
    }
  };

     // function for smart assign
  const handleSmartAssign = async (t) => {
    if (t.assigned_user) {
      alert("This task has been already  assigned!");
      return;
    }
    const teamMates = JSON.parse(localStorage.getItem("teamMates"));

    if (!teamMates) {
      alert("You haven't teamMates");
      return;
    }
    let user_with_min_activeTask = null;
    for (const teamMate of teamMates) {
      const totalActiveTask = teamMate.assigned_Tasks
        ? teamMate.assigned_Tasks.length
        : 0;

      teamMate.totalActiveTask = totalActiveTask;

      if (
        user_with_min_activeTask === null ||
        teamMate.totalActiveTask < user_with_min_activeTask.totalActiveTask
      ) {
        user_with_min_activeTask = teamMate;
      }
    }
    try {
      socketRef.current.emit("assignTask", {
        member_email: user_with_min_activeTask.email,
        taskId: t._id,
        userId: user._id,
      });
    } catch (err) {
      alert(err);
    }
  };

    // fuction for appling sliding effect on user container in mobile view
  const handleUserContainerView = () => {
    const userContainer = document.getElementById("usercontainer");
    const columns = document.getElementById("columns");

    if (!userContainer.classList.contains("showUserContainer")) {
      userContainer.classList.add("showUserContainer");
      columns.style.opacity = ".3";
    } else {
      userContainer.classList.remove("showUserContainer");
      columns.style.opacity = "1";
    }
  };

  return (
    <div className="home">
      <div className="header mobileVeiwHeader">
        <h2 className="todo">Todo app</h2>

        <div className="user" onClick={handleUserContainerView}>
          {user ? <h2>{user && user.name[0].toUpperCase()}</h2> : <h2>U</h2>}
        </div>
      </div>
      <div
        className="container"
        id="container"
        onClick={() => {
          handleTaskActionFormState();
        }}
        style={{
          opacity:
            isAddTaskFormOpen ||
            isAssignTaskFormOpen ||
            isEditTaskFormOpen ||
            openAddMemberForm
              ? 0.5
              : 1,
        }}
      >
        <div className="userContainer" id="usercontainer">
          <div>
            {user ? (
              <div
                className="userDetails"
                style={{ display: "flex", gap: ".5rem" }}
              >
                <h3>Welcome, {user.name}</h3>

                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    localStorage.removeItem("tasks");
                    localStorage.removeItem("history");
                    localStorage.removeItem("assignedTasks");
                    localStorage.removeItem("teamMates");
                    localStorage.removeItem("isFirstFetch");
                    navigate("/login");
                  }}
                  className="btn logoutbtn"
                  style={{
                    padding: ".2rem",
                    backgroundColor: "#b64536ff",
                    color: "white",
                    borderRadius: "5px",
                  }}
                >
                  Logout
                </button>
                <MyButton
                  onClick={() => {
                    setOpenAddMemberForm(!openAddMemberForm);
                  }}
                  text={"Add member"}
                  style={{
                    padding: ".2rem",
                    backgroundColor: "#474753ff",
                    color: "white",
                    borderRadius: "5px",
                  }}
                />
              </div>
            ) : (
              <div className="userDetails">
                <button
                  onClick={() => navigate("/login")}
                  className="btn loginbtn"
                >
                  Login
                </button>
                <h3>Please Login to see your tasks</h3>
              </div>
            )}
          </div>

          {user && (
            <div className="historyContainer">
              <h3>Actions History {history && history.length}</h3>
              <div className="history">
                {history &&
                  history.map((item, index) => (
                    <div key={index} className="historyItem">
                      <p>
                        <span>{item.username}</span>
                        <b> {item.action}</b>
                        <span> at </span>
                        <span>
                          {" "}
                          {new Date(item.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEndHandler}>
          <div>
            <div className="columns" id="columns">
              {columns &&
                Object.entries(columns).map(([columnId, tasks]) => (
                  <MyColumn
                    key={columnId}
                    columnId={columnId}
                    tasks={tasks}
                    setIsAddTaskFormOpen={setIsAddTaskFormOpen}
                    setIsAssignTaskFormOpen={setIsAssignTaskFormOpen}
                    setIsEditTaskFormOpen={setIsEditTaskFormOpen}
                    isAddTaskFormOpen={isAddTaskFormOpen}
                    isAssignTaskFormOpen={isAssignTaskFormOpen}
                    isEditTaskFormOpen={isEditTaskFormOpen}
                    setTaskId={setTaskId}
                    taskId={taskId}
                    handleTaskDelete={handleTaskDelete}
                    setTaskStatus={setTaskStatus}
                    handleSmartAssign={handleSmartAssign}
                  />
                ))}
            </div>
          </div>
        </DragDropContext>
      </div>
      {/* form for adding task */}
      <MyForm
        className="taskActionForm"
        style={{ display: isAddTaskFormOpen ? "flex" : "none" }}
        onSubmit={handleAddTask}
      >
        <div className="addTaskInputFeild taskActionInputFeild">
          <h1>Add Task</h1>
          <MyInput
            type="text"
            placeholder="title"
            required
            className="input"
            name="title"
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            value={title}
          />
          <MyTextarea
            type="text"
            placeholder="description"
            className="input"
            name="description"
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            value={description}
          />
          <MyButton className="taskActionBtn" text={"add task"} />
        </div>
      </MyForm>

      {/* form for editing task */}
      <MyForm
        className=" taskActionForm"
        style={{ display: isEditTaskFormOpen ? "flex" : "none" }}
        onSubmit={handleEditTask}
      >
        <div className="editTaskInputFeild taskActionInputFeild">
          <h1>Edit Task</h1>
          <MyInput
            type="text"
            placeholder="new title"
            required
            className="input"
            name="title"
            onChange={(e) => handleChangeForEdittingTask(e)}
            value={title}
          />
          <MyTextarea
            type="text"
            placeholder="new description"
            className="input"
            name="description"
            onChange={(e) => handleChangeForEdittingTask(e)}
            value={description}
          />
          <MyButton className="taskActionBtn" text={"Edit task"} />
        </div>
      </MyForm>

      {/* form for assign task */}
      <MyForm
        className="taskActionForm"
        style={{ display: isAssignTaskFormOpen ? "flex" : "none" }}
        onSubmit={assignTask}
      >
        <div className="EditTaskInputFeild taskActionInputFeild">
          <h1>Assign Task</h1>
          <MyInput
            type="text"
            placeholder="enter email"
            required
            className="input"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <MyButton className="taskActionBtn" text={"Assign task"} />
        </div>
      </MyForm>

      {/* add member form */}
      <MyForm
        className="taskActionForm"
        style={{ display: openAddMemberForm ? "flex" : "none" }}
        onSubmit={addMember}
      >
        <div className="addTeamMemberForm taskActionInputFeild">
          <h1>Add team mate</h1>
          <MyInput
            type="text"
            placeholder="enter email"
            required
            className="input"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <MyButton className="taskActionBtn" text={"Add Member"} />
        </div>
      </MyForm>
    </div>
  );
}

export default HomePage;
