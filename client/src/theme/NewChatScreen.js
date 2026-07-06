import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
};

export default function NewChatScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.back}>‹</Text>

      <Text style={styles.title}>New Chat</Text>
      <Text style={styles.sub}>Enter or select a Node ID</Text>

      <View style={styles.inputBox}>
        <TextInput
          placeholder="Example: Alpha-01"
          placeholderTextColor={C.muted}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Open Chat</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Recent Nodes</Text>

      {["Alpha-01", "Bravo-02", "Charlie-03"].map((id) => (
        <TouchableOpacity key={id} style={styles.node}>
          <Text style={styles.nodeText}>{id}</Text>
          <Text style={styles.nodeSub}>Tap to open</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 55,
    paddingHorizontal: 24,
  },
  back: {
    color: C.blue,
    fontSize: 40,
    marginBottom: 15,
  },
  title: {
    color: C.text,
    fontSize: 30,
    fontWeight: "900",
  },
  sub: {
    color: C.muted,
    marginTop: 6,
    marginBottom: 28,
  },
  inputBox: {
    height: 54,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    color: C.text,
    fontSize: 16,
  },
  button: {
    height: 54,
    backgroundColor: C.blue,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  section: {
    color: C.text,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 34,
    marginBottom: 12,
  },
  node: {
    height: 68,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
  },
  nodeText: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
  },
  nodeSub: {
    color: C.muted,
    fontSize: 12,
    marginTop: 3,
  },
});