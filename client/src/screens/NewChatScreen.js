import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
};

const RECENTS = ["Alpha-01", "Bravo-02", "Charlie-03"];

export default function NewChatScreen({ goBack, openChat }) {
  const [nodeId, setNodeId] = useState("");

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={30} color={C.blue} />
        </TouchableOpacity>

        <Text style={styles.title}>New Chat</Text>

        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.sub}>Enter a Node ID or select recent</Text>

      <View style={styles.inputBox}>
        <Feather name="hash" size={18} color={C.muted} />
        <TextInput
          placeholder="Example: Alpha-01"
          placeholderTextColor={C.muted}
          style={styles.input}
          value={nodeId}
          onChangeText={setNodeId}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => openChat(nodeId)}>
        <Feather name="message-circle" size={18} color="white" />
        <Text style={styles.buttonText}>Open Chat</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Recent Nodes</Text>

      <FlatList
        data={RECENTS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.node} onPress={() => openChat(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item[0]}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.nodeText}>{item}</Text>
              <Text style={styles.nodeSub}>Tap to open chat</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      />
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
  section: {
    color: C.text,
    fontWeight: "900",
    fontSize: 16,
    marginTop: 30,
    marginBottom: 10,
  },
  node: {
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.blue, fontWeight: "900" },
  nodeText: { color: C.text, fontSize: 16, fontWeight: "800" },
  nodeSub: { color: C.muted, fontSize: 12, marginTop: 3 },
});