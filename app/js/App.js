import React from "react";

const App = () => (
  <div id="main-container">
    <div className="modal fade" id="task-time-limit-cont" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">What time does the task end?</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
  
          <div className="modal-body">
            <div id="task-time-input-day-part">
              <label htmlFor="task-time-input-day">On which day?</label>
              <input type="text" id="task-time-input-day" placeholder="DD" />
              <span className="disable-fade">/</span>
              <input type="text" id="task-time-input-month" placeholder="MM" />
              <span className="disable-fade">/</span>
              <input type="text" id="task-time-input-year" placeholder="YYYY" />
            </div>
  
            <div id="task-time-input-time-part">
              <label htmlFor="task-time-input-time-cont">At what time?</label>
              <span id="task-time-input-time-cont">
                <input type="text" id="task-time-input-hour" />
                <span className="disable-fade">:</span>
                <input type="text" id="task-time-input-minute" />
                <span className="disable-fade">:</span>
                <input type="text" id="task-time-input-second" />
              </span>
            </div>
  
            <div id="remove-time-check">
              <input type="checkbox" id="remove-time-input" />
              <label htmlFor="remove-time-input">Remove time limit</label>
            </div>
          </div>
  
          <div className="modal-footer">
            <button type="button" className="btn btn-white" task-id="" task-type="" data-dismiss="modal" id="close-task-time-limit-modal">Save</button>
          </div>
  
        </div>
      </div>
    </div>
  
    <header>
      <div>
        <span className="date-shift-btn" id="previous-date-shift-btn"><i className="fa fa-arrow-circle-left"></i></span>
        <span id="current-date-cont">
          <h1></h1>
        </span>
        <span className="date-shift-btn" id="next-date-shift-btn"><i className="fa fa-arrow-circle-right"></i></span>
  
        <span id="header-icon-cont">
          <span id="date-shift-home-btn" className="header-icon">
            <i className="fa fa-home"></i>
          </span>
  
          <span id="task-list-refresh" className="header-icon">
            <i className="fa fa-refresh"></i>
          </span>
  
          <span id="add-task-btn" className="header-icon">
            <i className="fa fa-plus"></i>
          </span>
        </span>
      </div>
    </header>
  
    <article>
      <div id="task-search-box" className="input-box">
        <input type="text" id="task-search-input" placeholder="Enter task's text to search" autoFocus />
      </div>
  
      <div id="task-add-input-box" className="input-box">
        <div id="task-input-error-box"></div>
        <input type="text" id="task-text-input" placeholder="What do you want to do next?" autoFocus />
        <span id="task-input-send-btn"><i className="fa fa-send"></i></span>
      </div>
  
      <div id="task-list-cont" className="list-cont">
        <ul className="list-group" id="task-list-cont-main"></ul>
      </div>
  
      <div id="empty-list-banner">
        <h2 id="empty-list-banner-text">No tasks.</h2>
      </div>
    </article>
  </div>
);

export default App;
