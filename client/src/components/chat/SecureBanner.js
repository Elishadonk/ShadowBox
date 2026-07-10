import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const C = {
  card: "#111A23",
  border: "#1F2B36",
  muted: "#8793A0",
};

export default function SecureBanner({ isRecording }) {
  return (
    <View style={styles.secure}>
      <Feather name="lock" size={13} color={C.muted} />
      <Text style={styles.secureText}>
        {isRecording ? "Recording voice note..." : "End-to-end encrypted"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  secure: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  secureText: {
    color: C.muted,
    fontSize: 12,
  },
});