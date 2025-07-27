// ✌✌ A simple and responsive Todo application to manage your personal or group task perfectly.

// **app Overview**

This is a full-stack Todo App that allows users to:

- Add, edit, delete and assign tasks
- Organize tasks by status (Pending, In Progress, Completed)
- Assign tasks to teammates
- Drag and drop tasks between columns (like a Kanban board)
- Sync tasks in real-time using WebSockets

// **Tech stack**
Built using:

- **Frontend**: React.js, react-beautiful-dnd, jwt-decode
- **Backend**: Node.js, Express.js, MongoDB, jwt
- **Real-time**: Socket.IO

**Setup/Installation**
clone the repo :

git clone https://github.com/19sandip/todo_app.git
cd todo app

cd frontend
npm install

cd backend
npm install

**Add invironment variables**
here use your credendials :

PORT=3003
MONGO_PASS= your cluster password
MONGO_USER= your mongo user id
MONGO_URI= use you mongo uri
JWT_SECRET=todo_app

**Run the app**
cd backend
npm run dev

cd frontend
npm start

**Featurs list and uses guide**
Here user can :
add, delete, assign, and edit the task;
also user can make group of people to handle a project and assign/reassign the task to the group members

**How to use** :
Firstly if you are new user you have to create a account with your name , email
and you have to create a password also then you can login to your account with your registered email and password

After logging in Now you can handle task with the group or solo;
to create group click on **add member** button and enter the member's email (here member should have to be a user of this todo app already);
and hit the **add** button after that you will see confirmation message it means you and the member are a part of the group;
from now you can assign the task to the member and he can also assign the task to you. And both of you are allowed to edit and delete the task;

**Logic of smart assign and conflict handling**

-smart assign ->

To implement this feature I have stored all the teammates information in the localStorage;
First I am using the forOf loop on the teammates array and finding the user with the minimum assigned task.
After that I simply call the **assignTask** function which is already written for assigning the task with email;

-conflict handling->

**firstly know the conflict**-> 'The conflict is when two teammates are editting the same task at the same time, How will I show them both versions and let them override or accept the peer's version';

Socket.io made my work easy here I am emitting an event called edittingTask at every change(I have not used useState because it was causing an error that is the peer was able to see the edited info one letter later)

**Link to Live app and demo video**
Live link : https://todo-app-xi-blue.vercel.app/

Logic document link : https://docs.google.com/document/d/1hQ9Z4HzAqvq89fX9yugBKw6T2ohi5xLRwHbLpGhu7Dk/edit?usp=sharing