import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { registerGlobals } from "@livekit/react-native";

import HomeScreen from "./src/screens/HomeScreen";
import NewChatScreen from "./src/screens/NewChatScreen";
import ChatScreen from "./src/screens/ChatScreen";
import VoiceCallScreen from "./src/screens/VoiceCallScreen";
import VideoCallScreen from "./src/screens/VideoCallScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import NodeScreen from "./src/screens/NodeScreen";

import { initDatabase } from "./src/database/database";

registerGlobals();

export default function App() {
  const [screen, setScreen] = useState("home");
  const [nodeId, setNodeId] = useState("SBX-482731");
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState("");

  useEffect(() => {
    async function prepareDatabase() {
      try {
        await initDatabase();
        console.log("Shadow Box database ready");
        setDatabaseReady(true);
      } catch (err) {
        console.error("Database failed:", err);
        setDatabaseError(String(err));
      }
    }

    prepareDatabase();
  }, []);

  const openChat = (id) => {
    setNodeId(id || "SBX-482731");
    setScreen("chat");
  };

  if (databaseError) {
    return (
      <View style={styles.loadingPage}>
        <Text style={styles.errorTitle}>Database error</Text>
        <Text style={styles.errorText}>{databaseError}</Text>
      </View>
    );
  }

  if (!databaseReady) {
    return (
      <View style={styles.loadingPage}>
        <Text style={styles.loadingTitle}>SHADOW BOX</Text>
        <Text style={styles.loadingText}>Preparing secure storage...</Text>
      </View>
    );
  }

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
    return (
      <VoiceCallScreen
        nodeId={nodeId}
        goBack={() => setScreen("chat")}
      />
    );
  }

  if (screen === "video") {
    return (
      <VideoCallScreen
        nodeId={nodeId}
        goBack={() => setScreen("chat")}
      />
    );
  }

  if (screen === "contacts") {
    return (
      <ContactsScreen
        goBack={() => setScreen("home")}
        openChat={openChat}
      />
    );
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

const styles = StyleSheet.create({
  loadingPage: {
    flex: 1,
    backgroundColor: "#101722",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },

  loadingText: {
    color: "#E3EAF2",
    fontSize: 14,
    marginTop: 10,
  },

  errorTitle: {
    color: "#FF5C6A",
    fontSize: 22,
    fontWeight: "900",
  },

  errorText: {
    color: "#E3EAF2",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
});