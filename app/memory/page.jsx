// start here
"use client";
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import Title from "../components/Title";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ResultWithSources from "../components/ResultWithSources";
import "../globals.css";

const Memory = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! whats the name of your favourity food?",
      type: "bot",
    },
  ]);
  const [firstMsg, setFirstMsg] = useState(true);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmitPrompt = async () => {
    console.log("sending", prompt);
    try {
      // update the user message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await fetch("/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt, firstMsg }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setPrompt("");

      // to prevent from reinitialize the chain
      setFirstMsg(false);

      const searchRes = await response.json();

      // add the bot message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: searchRes.output.response, type: "bot", sourceDocuments: null },
      ]);

      console.log({ searchRes });
      setError("");
    } catch (err) {
      console.log(err);
      setError(err);
    }
  };

  return (
    <>
      <Title headingText={"Memory"} emoji="" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="I remember eveything"
              boldText="Let's see if it can remember your name and favourite food. This tool will let you ask anything containing in a PDF document. "
              description="This tool uses Buffer Memory and Conversation Chain. Head over to Module X to get started!"
            />
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile="brain" />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleSubmitPrompt}
              error={error}
            />
          </>
        }
      />
    </>
  );
};

export default Memory;
