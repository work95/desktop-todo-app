import React from "react";
import "../../css/HeaderActionButton.css";

const HeaderActionButton = ({id, iconName, actionHandler}) => (
  <span id={`${id}`} className="header-icon" onClick={actionHandler}>
    <i className={`${iconName}`}></i>
  </span>
);

export default HeaderActionButton;
