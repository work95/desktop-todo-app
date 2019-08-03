import React from "react";

const TaskBox = ({placeholder, actionHandler, show}) => {
  let _input;
  return (show
    ? (<div className="task-box input-box">
        <div id="task-input-error-box"></div>
        <input type="text" ref={(input) => _input = input} id="task-text-input" placeholder={placeholder} autoFocus />
        <span className="task-input-send-btn" onClick={() => actionHandler(_input.value)}>
          <i className="fa fa-send"></i>
        </span>
      </div>
    )
    : null
  );
}

export default TaskBox;
