import fs from "fs";
import React from "react";
import Config from "./Config";
import List from "./List";
import Utility from "./Utility";
import DateShiftPane from "./components/DateShiftPane";
import HeaderActionButton from "./components/HeaderActionButton";
import TaskList from "./components/TaskList";
import TimeLimitModal from "./components/TimeLimitModal";
import TaskBox from "./components/TaskBox";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: new Date(),
      dateShift: 0,
      LocalTaskList: [],
      MainTaskList: new List(),
      currentTimeLimitTask: "",
      showAddTaskBox: false,
      showSearchTaskBox: false,
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

  getTasksByDate(date, list) {
    return (list || this.state.MainTaskList.toValueArray() || []).filter((task) => 
      (new Date(task.startTime).toLocaleDateString() === date.toLocaleDateString()));
  }

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

  dateShiftHome() {
    this.setState({
      dateShift: 0,
      currentDate: new Date(),
      LocalTaskList: null
    });
  }

  refreshTaskList() {
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  addTask(text) {
    let date = new Date().getTime();
    let id = `task_${date}`;
    this.state.MainTaskList.add(id, {id: id, text: text, startTime: date, endTime: null, status: false})
    this.storeTaskList();
    this.dateShiftHome();
  }

  searchTask(text) {
    // Fetch the tasks for the date of the current pane and then filter.
    let list = this.state.MainTaskList.toValueArray().filter((task) => Utility.subseq(task.text, text));
    let searchedList = new List();
    list.map((task) => searchedList.add(task.id, task));
    this.setState({
      LocalTaskList: list
    });
  }

  storeTaskList() {
    fs.writeFileSync(Config.TASK_STORAGE_FILE, JSON.stringify(this.state.MainTaskList));
  }

  componentWillMount() {
    // Setup the configuration parameters.
    Config.setupConfiguration();
    let list = this.load();

    // Load the 'LocalTaskList' before component renders.
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate, list.toValueArray()),
      MainTaskList: list
    });
  }

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

  onComplete(id) {
    let task = this.state.MainTaskList.get(id);
    task.status = !task.status;
    this.storeTaskList();
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  onDelete(id) {
    this.state.MainTaskList.remove(id);
    this.storeTaskList();
    this.setState({
      LocalTaskList: this.getTasksByDate(this.state.currentDate)
    });
  }

  openAddTaskBox() {
    this.setState({ showAddTaskBox: !this.state.showAddTaskBox });
  }

  openSearchTaskBox() {
    this.setState({ 
      showSearchTaskBox: !this.state.showSearchTaskBox
    });
  }

  openTimeLimitModal(id) {
    this.setState({
      currentTimeLimitTask: id,
      showTimeLimitModal: true
    });
  }

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
    const {dateShiftBackward, dateShiftForward, getTasksByDate,
      dateShiftHome, refreshTaskList, addTask, searchTask, onComplete, 
      onDelete, openAddTaskBox, openSearchTaskBox, openTimeLimitModal, setTimeLimit} = this;

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
