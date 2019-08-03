import React from "react";

const HeaderActionButton = ({id, iconName, actionHandler}) => (
  <span id={`${id}`} className="header-icon" onClick={actionHandler}>
    <i className={`${iconName}`}></i>
  </span>
);

export default HeaderActionButton;
