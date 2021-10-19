import React from 'react';
import io from 'socket.io-client';
import uuid from 'react-uuid';

class App extends React.Component {
  
  state = {
    tasks: [],
    taskName: '',
    editTaskId: '',
  }
  
  componentDidMount(){
    this.socket = io();
    this.socket.connect('http://localhost:4000');
    this.socket.on('addTask', (id, name) => this.addTask(id, name));
    this.socket.on('removeTask', (id) => this.removeTask(id));
    this.socket.on('updateData', (taskList) => this.updateTasks(taskList));
    this.socket.on('editTask', (id, name) => this.editTask(id, name));
  }
  
  updateTasks(taskList){
   this.setState(state => ({...state, tasks: taskList}));
  }

  addTask(id, name, myTask = false){
    this.setState(state =>({...state, tasks: state.tasks.concat([{id, name}])}));
    if(myTask) this.socket.emit('addTask',id, name);
  }

  removeTask(id, myTask = false){ 
    this.setState(state =>({...state, tasks: state.tasks.filter((task,index) => index!==id)}));
    if(myTask) this.socket.emit('removeTask',id);
  }
  
  handleChange(event){
    this.setState(state => ({...state, taskName: event.target.value}));
  }
  
  submitForm(event, isEdit = false, idTask = ''){
    event.preventDefault();
    !isEdit ? this.addTask(uuid(), this.state.taskName, true) : this.editTask(idTask, this.state.taskName, true);
    this.setState(state => ({...state, taskName: '', editTaskId:''}));
  }
  
  handleEdit(id,name){
    this.setState(state => ({...state, taskName: name, editTaskId: id}));
  }
  
  editTask(id, name, myTask = false){
    this.setState(state => ({
      ...state, tasks: state.tasks.map(task => task.id === id ? task.name = name : task.name),
    }, this.forceUpdate())); 

    if(myTask) this.socket.emit('editTask',id, name);
  }

  render() {
    return (
      <div className="App">
    
        <header>
          <h1>ToDoList.app</h1>
        </header>
    
        <section className="tasks-section" id="tasks-section">
          <h2>Tasks</h2>
    
          <ul className="tasks-section__list" id="tasks-list">
            {
              this.state.tasks.map( task => <li> {
                 this.state.editTaskId !== task.id ? 
                  <div class="task">{task.name}
                    <div>
                      <button class="btn btn--red" onClick={() => this.handleEdit(task.id, task.name)}>Edit</button>
                      <button class="btn btn--red" onClick={() => this.removeTask(this.state.tasks.findIndex(el => el.name === task.name), true)}>Remove</button>
                    </div>
                  </div> : 
                  <form id="edit-task-form"  class="task" onSubmit={(event) => this.submitForm(event, true, task.id)}>
                    <input className="text-input" autocomplete="off" type="text" placeholder="Type your description" id="task-edit" value={this.state.taskName} onChange={(event) => this.handleChange(event)}/>
                    <button className="btn" type="submit" >Save</button>
                  </form>
              }
                </li>)
            }
          </ul>
          { 
            !this.state.editTaskId ?
              <form id="add-task-form" onSubmit={(event) => this.submitForm(event)}>
               <input className="text-input" autocomplete="off" type="text" placeholder="Type your description" id="task-name" value = {this.state.taskName} onChange={(event) => this.handleChange(event)}/>
               <button className="btn" type="submit" >Add</button>
              </form> : ''
          }
        </section>
      </div>
    );
  };

};

export default App;
