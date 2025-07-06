import "../styles/home.css";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AuthContext } from "../../authentication/Authentication";

const initialData = {
  pending: [
    { id: "task-1", content: "Task 1" },
    { id: "task-2", content: "Task 2" },
  ],
  inProgress: [],
  done: [],
};

function HomePage() {
  
  const {addTask, allTask} = useContext(AuthContext)
  const [taskStatus, setTaskStatus] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const [columns, setColumns] = useState(initialData);
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const navigate = useNavigate();

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const items = Array.from(columns[source.droppableId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setColumns({
        ...columns,
        [source.droppableId]: items,
      });
    } else {
      const sourceItems = Array.from(columns[source.droppableId]);
      const destItems = Array.from(columns[destination.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
    }
  };
  if(allTask){
    console.log("All Task: ", allTask)
  }else{
    console.log("you are not getting task")
  }
  const handleAddTaskFormState = () => {
    if (isAddTaskFormOpen) {
      setIsAddTaskFormOpen(false)
    }
  }

  const handleAddTask = async ()=>{
    
      const token = localStorage.getItem("token");
      if(!token) {
        alert("Login to add task")
        navigate("/login")
      }
    
      try{
        const res = await addTask({title, description, taskStatus});
        if(res.success){
          setDescription("")
          setTitle("");
          setTaskStatus("");
          alert("task added")
          navigate('/')
        }else{
          alert("something went wrong while adding task")
        }
      }catch(err){
        console.error("Error in adding task:", err);
        alert(err);
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

        <DragDropContext onDragEnd={onDragEnd}>

          <div className="main_container columns">

            {Object.entries(columns).map(([columnId, tasks]) => (

              <Droppable key={columnId} droppableId={columnId}>

                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="column"
                  >
                    <h3 style={{ textTransform: "capitalize", textAlign: "center" }} >{columnId}</h3>


                    {tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
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
                            <h3> {task.content}</h3>
                            <div className="taskActions">
                                  <button className="actionbtn">Del</button>
                                  <button className="actionbtn">asgn</button>
                                  <button className="actionbtn">edit</button>
                            </div>
                           
                          </div>
                        )}
                      </Draggable>
                    ))}

                    <div className="addTaskField" isDropDisabled={false}>
                      <p onClick={() => {setIsAddTaskFormOpen(!isAddTaskFormOpen); setTaskStatus(columnId)}} className="addTaskButton">Add Task</p>
                    </div>


                    {provided.placeholder}
                  </div>


                )}

              </Droppable>
            ))}
          </div>

        </DragDropContext>
      </div>


      <form className="addTaskForm" style={{ display: isAddTaskFormOpen ? 'flex' : 'none' }} onSubmit={handleAddTask}>
         <div className="addTaskInputFeild">
          <h1>Add Task</h1>
           <input type="text" placeholder="titel" required className="input" name="title" onChange={(e)=>setTitle(e.target.value)} value={title}></input>
         <textarea type="text" placeholder="description" className="input" name="description" onChange={(e)=>setDescription(e.target.value)} value={description}></textarea>
         <button className="addTaskButton">Add Task</button>
         </div>
        
          
      </form>

    </div>


  )
}

export default HomePage;

