import React from "react";

const Emoji = ({ color }) => {
  return (
    <div className={`bg-${color}-500 text-center`}>
      <p>the color is {color}</p>
      {color === "red" ? <p>the color is red</p> : <p>the color is not red</p>}
      <p></p>
    </div>
  );
};

export default Emoji;
