import React from "react";
import "../../css/Task.css";

const Task = ({task, complete, remove, showTimeLimitModal}) => {
  let date = new Date(parseInt(task.startTime));

  return (
    <li className="list-group-item" id={task.id} status={task.status ? `true` : `false`}>
      <span id="task-action-icons">
        <span className="complete-task-btn" onClick={() => complete(task.id)} status="false" className="dropdown-item">
          <i className="fa fa-check"></i>
        </span>

        <span className="delete-task-btn" onClick={() => remove(task.id)} className="dropdown-item">
          <i className="fa fa-trash-o"></i>
        </span>

        {/* <span className="add-time-limit-btn" onClick={() => showTimeLimitModal(task.id)} task-id="" className="dropdown-item" data-toggle="modal" data-target="#task-time-limit-cont" href="#">
          <i className="fa fa-clock-o"></i>
        </span> */}
      </span>

      <span className={`task-text ${task.status ? "disabled-fade" : ""}`}>
        <span className={`task-text-cont ${task.status ? "strikethrough" : ""}`}>{task.text}</span>
        <br />
        <span className="task-start-date">{date.getDate()}/{(date.getMonth() + 1)}/{date.getFullYear()}</span>
        <span className="task-end-time"></span>
      </span>
    </li>
  );
}

export default Task;
