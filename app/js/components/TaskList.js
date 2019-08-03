import React from "react";
import Task from "./Task";
import EmptyListBanner from "./EmptyListBanner";
import "../../css/TaskList.css";

const TaskList = ({taskList = taskList || [], onComplete, onDelete, openTimeLimitModal}) => {

  function complete(id) { onComplete(id); }
  function remove(id) { onDelete(id); }
  function showTimeLimitModal(id) { openTimeLimitModal(id); }

  return (
    <div id="task-list-cont" className="list-cont">
      <ul className="list-group" id="task-list-cont-main">
        {
          (taskList.length < 1) 
            ? <EmptyListBanner /> 
            : taskList.map((task, i) => 
                <Task key={i++} 
                  task={task}
                  complete={complete}
                  remove={remove}
                  showTimeLimitModal={showTimeLimitModal} />
              )
        }
      </ul>
    </div>
  );
}

export default TaskList;
