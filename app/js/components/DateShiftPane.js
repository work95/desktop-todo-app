import React from "react";
import Config from "../Config";
import "../../css/DateShiftPane.css";

const DateShiftPane = ({date = date || new Date(), dateShiftBackward = f => f, dateShiftForward = f => f}) => {
  return (
    <span className="date-shift-cont">
      <span className="date-shift-btn" id="previous-date-shift-btn"
        onClick={dateShiftBackward}>
        <i className="fa fa-arrow-circle-left"></i>
      </span>

      <span id="current-date-cont">
        <h1>{`${Config.MonthNamesShort[date.getMonth()]} ${date.getDate()}`}</h1>
      </span>

      <span className="date-shift-btn" id="next-date-shift-btn"
        onClick={dateShiftForward}>
        <i className="fa fa-arrow-circle-right"></i>
      </span>
    </span>
  );
}

export default DateShiftPane;
