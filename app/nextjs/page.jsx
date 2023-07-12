"use client";
import React, { useState } from "react";
import Emoji from "../components/Emoji";

const NextJSTutorial = () => {
  const firstName = "Erez";
  const [lastName, setLastName] = useState("");

  const handleSubmit = async () => {
    const responce = await fetch("api/next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: "Some message", lastName }),
    });
    console.log(await responce.json());
  };

  return (
    <div>
      <p>This is where the page appears</p>
      <p>TaiWind CSS is awesome</p>
      <p className="text-red-500">{firstName}</p>

      {/* state */}
      <div className="flex flex-col space snap-y">
        <div>
          <p>My last name is: {lastName}</p>
          <input
            type="text"
            className="outline w-32 rounded-md"
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />

          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
      <Emoji color="blue" />
    </div>
  );
};

export default NextJSTutorial;
