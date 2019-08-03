import React from "react";
import "../../css/TimeLimitModal.css";

const TimeLimitModal = ({show, setTimeLimit}) => {
  let date = new Date();
  let _day, _month, _year, _hour, _minute, _second;

  return (
    show 
      ? (
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
                    <input type="text" id="task-time-input-day" placeholder="DD" ref={(input) => _day = input} defaultValue={date.getDate()} />
                    <span className="disable-fade">/</span>
                    <input type="text" id="task-time-input-month" placeholder="MM" ref={(input) => _month = input} defaultValue={date.getMonth() + 1} />
                    <span className="disable-fade">/</span>
                    <input type="text" id="task-time-input-year" placeholder="YYYY" ref={(input) => _year = input} defaultValue={date.getFullYear()} />
                  </div>

                  <div id="task-time-input-time-part">
                    <label htmlFor="task-time-input-time-cont">At what time?</label>
                    <span id="task-time-input-time-cont">
                      <input type="text" id="task-time-input-hour" ref={(input) => _hour = input} defaultValue={date.getHours()} />
                      <span className="disable-fade">:</span>
                      <input type="text" id="task-time-input-minute" ref={(input) => _minute = input} defaultValue={date.getMinutes()} />
                      <span className="disable-fade">:</span>
                      <input type="text" id="task-time-input-second" ref={(input) => _second = input} defaultValue={date.getSeconds()} />
                    </span>
                  </div>

                  <div id="remove-time-check">
                    <input type="checkbox" id="remove-time-input" />
                    <label htmlFor="remove-time-input">Remove time limit</label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setTimeLimit(_day.value, _month.value, _year.value, _hour.value, _minute.value, _second.value)} className="btn btn-white" task-id="" task-type="" data-dismiss="modal" id="close-task-time-limit-modal">Save</button>
                </div>

              </div>
            </div>
          </div>
        )
      : null
  );
}

export default TimeLimitModal;
