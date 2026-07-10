import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  red: "#EF4444",
};

export default function InputBar({
  message,
  setMessage,
  onSend,
  onOpenAttachments,
  isRecording,
  onStartRecording,
  onStopRecording,
}) {
  return (
    <View style={styles.inputBar}>
      <TouchableOpacity style={styles.squareBtn} onPress={onOpenAttachments}>
        <Feather name="plus" size={24} color={C.blue} />
      </TouchableOpacity>

      <View style={styles.inputWrap}>
        <TextInput
          placeholder="Message..."
          placeholderTextColor={C.muted}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={onSend}
        />
      </View>

      <TouchableOpacity
        style={[styles.squareBtn, isRecording && styles.recordingBtn]}
        onPress={isRecording ? onStopRecording : onStartRecording}
      >
        <Feather
          name={isRecording ? "square" : "mic"}
          size={21}
          color={isRecording ? "white" : C.muted}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
        <Ionicons name="send" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    minHeight: 82,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.bg,
  },
  squareBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingBtn: {
    backgroundColor: C.red,
    borderColor: C.red,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  input: {
    color: C.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
});