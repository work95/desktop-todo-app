import fs from "fs";
import React from "react";
import Config from "./Config";
import Init from "../js/Init";
import List from "./List";
import Utility from "./Utility";
import DateShiftPane from "./components/DateShiftPane";
import HeaderActionButton from "./components/HeaderActionButton";
import TaskBox from "./components/TaskBox";
import TaskList from "./components/TaskList";
import TimeLimitModal from "./components/TimeLimitModal";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Date currently on.
      currentDate: new Date(),

      // How many steps back or forward.
      dateShift: 0,

      // Array of tasks for the current date (currentDate).
      LocalTaskList: [],

      // JSON containing all the tasks.
      MainTaskList: new List(),

      // Set limit for this task.
      currentTimeLimitTask: "",

      // Show/hide state for add task box.
      showAddTaskBox: false,

      // Show/hide state for search task box.
      showSearchTaskBox: false,

      // Show/hide state for task time limit modal.
      showTimeLimitModal: false
    };

    this.load = this.load.bind(this);
    this.getTasksByDate = this.getTasksByDate.bind(this);
    this.dateShiftBackward = this.dateShiftBackward.bind(this);
    this.dateShiftForward = this.dateShiftForward.bind(this);
    this.dateShiftHome = this.dateShiftHome.bind(this);
    this.refreshTaskList = this.refreshTaskList.bind(this);
    this.addTask = this.addTask.bind(this);
    this.searchTask = this.searchTask.bind(this);
    this.storeTaskList = this.storeTaskList.bind(this);
    this.onComplete = this.onComplete.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.openAddTaskBox = this.openAddTaskBox.bind(this);
    this.openSearchTaskBox = this.openSearchTaskBox.bind(this);
    this.setTimeLimit =this.setTimeLimit.bind(this);
    this.openTimeLimitModal = this.openTimeLimitModal.bind(this);
  }

  /* Get an array of tasks for the provided date. */
  getTasksByDate(date, list) {
    return (list || this.state.MainTaskList.getValues() || []).filter((task) => 
      (new Date(task.startTime).toLocaleDateString() === date.toLocaleDateString()));
  }

  /* Load tasks for one day backward. */
  dateShiftBackward() {
    let date = new Date();
    let shift = this.state.dateShift - 1;
    date.setDate(date.getDate() + shift);
    this.setState({
      dateShift: shift,
      currentDate: date,
      LocalTaskList: null
    });
  }

  /* Load tasks for one day forward. */
  dateShiftForward() {
    let date = new Date();
    let shift = this.state.dateShift + 1;
    date.setDate(date.getDate() + shift);
    this.setState({
      dateShift: shift,
      currentDate: date,
      LocalTaskList: null
    });
  }

  /* Shift back to the today's date. */
  dateShiftHome() {
    this.setState({
      dateShift: 0,
      currentDate: new Date(),
      LocalTaskList: null
    });
  }

  /* Load the lists before the <TaskList /> is rendered. */
  componentWillMount() {
    // Run startup functions.
    Init.init();

    // Deserialize the JSON stored in main file.
    let list = this.load();
    
    // Load the 'LocalTaskList' before component renders.
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate, list.getValues()),
      MainTaskList: list
    });
  }

  /* Deserialize the JSON object stored in file. */
  load() {
    let oldData = JSON.parse(fs.readFileSync(Config.TASK_STORAGE_FILE)).container;
    let list = new List();
    for (let i in oldData) {
      let task = oldData[i];
      list.add(task.id, {
        id: task.id,
        text: task.text,
        startTime: task.startTime,
        endTime: task.endTime,
        status: task.status
      });
    }
    
    return list;
  }
  
  /* Serialize the JSON object. */
  storeTaskList() {
    fs.writeFileSync(Config.TASK_STORAGE_FILE, JSON.stringify(this.state.MainTaskList));
  }

  /* Reload the task list. */
  refreshTaskList() {
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  /* Add task. */
  addTask(text) {
    let date = new Date().getTime();
    let id = `task_${date}`;
    this.state.MainTaskList.add(id, {id: id, text: text, startTime: date, endTime: null, status: false})
    this.storeTaskList();
    this.dateShiftHome();
  }

  /* Search for tasks. */
  searchTask(text) {
    // Fetch the tasks for the date of the current pane and then filter.
    let list = this.state.MainTaskList.getValues().filter((task) => Utility.subseq(task.text, text));
    let searchedList = new List();
    list.map((task) => searchedList.add(task.id, task));
    this.setState({
      LocalTaskList: list
    });
  }
  

  /* Task status set to true or false. */
  onComplete(id) {
    let task = this.state.MainTaskList.get(id);
    task.status = !task.status;
    this.storeTaskList();
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  /* Delete task. */
  onDelete(id) {
    this.state.MainTaskList.remove(id);
    this.storeTaskList();
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  /* Set state for add task box. */
  openAddTaskBox() {
    this.setState({ showAddTaskBox: !this.state.showAddTaskBox });
  }

  /* Set state for search task box. */
  openSearchTaskBox() {
    this.setState({ 
      showSearchTaskBox: !this.state.showSearchTaskBox
    });
  }

  /* Set state for add task time limit modal. */
  openTimeLimitModal(id) {
    this.setState({
      currentTimeLimitTask: id,
      showTimeLimitModal: true
    });
  }

  /* Set the time limit for a task 'this.state.currentTimeLimitTask' */
  setTimeLimit(day, month, year, hour, minute, second) {
    let endTime = new Date(`${year}/${month}/${day} ${hour}:${minute}:${second}`).getTime();
    let taskId = this.state.currentTimeLimitTask;

    let task = this.state.MainTaskList.get(taskId);
    task.endTime = endTime;
    this.storeTaskList();
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  render() {
    const {LocalTaskList, currentDate, showAddTaskBox, showSearchTaskBox, showTimeLimitModal} = this.state;
    const {dateShiftBackward, dateShiftForward, getTasksByDate, dateShiftHome, 
      refreshTaskList, addTask, searchTask, onComplete, onDelete, openAddTaskBox, 
      openSearchTaskBox, openTimeLimitModal, setTimeLimit} = this;

    return (
      <div id="main-container">
        <TimeLimitModal show={showTimeLimitModal} setTimeLimit={setTimeLimit} />

        <header>
          <div>
            <DateShiftPane
              date={currentDate}
              dateShiftBackward={dateShiftBackward}
              dateShiftForward={dateShiftForward} 
            />
  
            <span id="header-icon-cont">
              <HeaderActionButton id={`date-shift-home-btn`} iconName={`fa fa-home`} actionHandler={dateShiftHome} />
              <HeaderActionButton id={`task-list-refresh`} iconName={`fa fa-refresh`} actionHandler={refreshTaskList} />
              <HeaderActionButton id={`task-list-search-btn`} iconName={`fa fa-search`} actionHandler={openSearchTaskBox} />
              <HeaderActionButton id={`add-task-btn`} iconName={`fa fa-plus`} actionHandler={openAddTaskBox} />
            </span>
          </div>
        </header>
      
        <article>
          <TaskBox placeholder={`What do you want to do next?`} show={showAddTaskBox} actionHandler={addTask} />
          <TaskBox placeholder={`Enter task's text to search`} show={showSearchTaskBox} actionHandler={searchTask} />
          <TaskList taskList={LocalTaskList || getTasksByDate(currentDate)} onComplete={onComplete} onDelete={onDelete} openTimeLimitModal={openTimeLimitModal} />
        </article>
      </div>
    );
  }
}

export default App;
