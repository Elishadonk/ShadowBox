import React, { useState, useEffect } from "react";

import HomeScreen from "./src/screens/HomeScreen";
import NewChatScreen from "./src/screens/NewChatScreen";
import ChatScreen from "./src/screens/ChatScreen";
import VoiceCallScreen from "./src/screens/VoiceCallScreen";
import VideoCallScreen from "./src/screens/VideoCallScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import NodeScreen from "./src/screens/NodeScreen";

import { initDatabase } from "./src/database/database";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [nodeId, setNodeId] = useState("SBX-482731");

  useEffect(() => {
    initDatabase()
      .then(() => console.log("Shadow Box database ready"))
      .catch((err) => console.error("Database failed:", err));
  }, []);

  const openChat = (id) => {
    setNodeId(id || "SBX-482731");
    setScreen("chat");
  };

  if (screen === "chat") {
    return (
      <ChatScreen
        nodeId={nodeId}
        goBack={() => setScreen("home")}
        openVoiceCall={() => setScreen("voice")}
        openVideoCall={() => setScreen("video")}
      />
    );
  }

  if (screen === "voice") {
    return <VoiceCallScreen nodeId={nodeId} goBack={() => setScreen("chat")} />;
  }

  if (screen === "video") {
    return <VideoCallScreen nodeId={nodeId} goBack={() => setScreen("chat")} />;
  }

  if (screen === "contacts") {
    return <ContactsScreen goBack={() => setScreen("home")} openChat={openChat} />;
  }

  if (screen === "node") {
    return <NodeScreen goBack={() => setScreen("home")} />;
  }

  if (screen === "newchat") {
    return (
      <NewChatScreen
        goBack={() => setScreen("home")}
        openChat={openChat}
      />
    );
  }

  return (
    <HomeScreen
      openNewChat={() => setScreen("newchat")}
      openContacts={() => setScreen("contacts")}
      openNode={() => setScreen("node")}
      openChat={openChat}
    />
  );
}