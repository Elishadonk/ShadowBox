import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  red: "#EF4444",
};

export default function NewChatScreen({ goBack, openChat }) {
  const [nodeId, setNodeId] = useState("");
  const [error, setError] = useState("");

  function formatNodeId(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 6);
    return numbers ? `SBX-${numbers}` : "";
  }

  function startChat() {
    const formatted = formatNodeId(nodeId);

    if (formatted.length !== 10) {
      setError("Enter a valid Node ID like SBX-482731");
      return;
    }

    setError("");
    openChat(formatted);
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={30} color={C.blue} />
        </TouchableOpacity>

        <Text style={styles.title}>New Chat</Text>

        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.sub}>Enter a permanent Shadow Box Node ID</Text>

      <View style={styles.inputBox}>
        <Feather name="hash" size={18} color={C.muted} />
        <TextInput
          placeholder="SBX-482731"
          placeholderTextColor={C.muted}
          style={styles.input}
          value={nodeId}
          onChangeText={(text) => {
            setNodeId(formatNodeId(text));
            setError("");
          }}
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={startChat}>
        <Feather name="message-circle" size={18} color="white" />
        <Text style={styles.buttonText}>Open Chat</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Feather name="shield" size={20} color={C.blue} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Node ID Required</Text>
          <Text style={styles.infoText}>
            Every Shadow Box chat starts with a permanent Node ID.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg, paddingTop: 55, paddingHorizontal: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: { color: C.text, fontSize: 24, fontWeight: "900" },
  sub: { color: C.muted, marginBottom: 22, fontSize: 14 },
  inputBox: {
    height: 52,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: { flex: 1, color: C.text, fontSize: 15 },
  error: {
    color: C.red,
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    height: 52,
    backgroundColor: C.blue,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  buttonText: { color: "white", fontWeight: "900", fontSize: 15 },
  infoBox: {
    marginTop: 30,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  infoTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  infoText: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});