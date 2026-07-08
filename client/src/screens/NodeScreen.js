import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { getProfile, updateDisplayName } from "../database/profile";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
};

export default function NodeScreen({ goBack }) {
  const [nodeId, setNodeId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const profile = await getProfile();
    setNodeId(profile.nodeId);
    setDisplayName(profile.displayName);
  }

  async function saveName() {
    const name = displayName.trim() || "Shadow User";
    await updateDisplayName(name);
    setDisplayName(name);
    setEditing(false);
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={30} color={C.blue} />
        </TouchableOpacity>

        <Text style={styles.title}>My Node</Text>

        <View style={{ width: 30 }} />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.status}>● Online</Text>
        <Text style={styles.statusSub}>Shadow Box identity active</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Permanent Node ID</Text>
        <Text style={styles.nodeId}>{nodeId}</Text>
        <Text style={styles.help}>
          People use this ID to chat, voice call, video call, and connect with you.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Display Name</Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={C.muted}
          />
        ) : (
          <Text style={styles.displayName}>{displayName}</Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={editing ? saveName : () => setEditing(true)}
        >
          <Feather name={editing ? "check" : "edit-2"} size={17} color="white" />
          <Text style={styles.buttonText}>
            {editing ? "Save Name" : "Edit Display Name"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Version</Text>
        <Text style={styles.version}>Shadow Box v0.1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 55,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: "900",
  },
  statusCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  status: {
    color: C.green,
    fontSize: 18,
    fontWeight: "900",
  },
  statusSub: {
    color: C.muted,
    marginTop: 6,
    fontSize: 13,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  label: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  nodeId: {
    color: C.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1,
  },
  help: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  displayName: {
    color: C.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },
  input: {
    height: 50,
    backgroundColor: "#0B141D",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    color: C.text,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  button: {
    height: 48,
    borderRadius: 14,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
  },
  version: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
  },
});