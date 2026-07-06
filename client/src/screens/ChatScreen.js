import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
  purple: "#8B5CF6",
};

export default function ChatScreen({ goBack, nodeId = "Alpha-01", openVoiceCall, openVideoCall }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={32} color={C.blue} />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{nodeId[0]}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{nodeId}</Text>
          <Text style={styles.online}>● Online</Text>
        </View>

        <TouchableOpacity onPress={openVoiceCall}>
          <Feather name="phone" size={22} color={C.blue} />
        </TouchableOpacity>

        <TouchableOpacity onPress={openVideoCall}>
          <Feather name="video" size={23} color={C.blue} />
        </TouchableOpacity>
      </View>

      <View style={styles.secure}>
        <Feather name="lock" size={13} color={C.muted} />
        <Text style={styles.secureText}>End-to-end encrypted</Text>
      </View>

      <View style={styles.messages}>
        <Text style={styles.day}>Today</Text>

        <View style={styles.otherBubble}>
          <Text style={styles.msgText}>Secure channel opened.</Text>
          <Text style={styles.msgTime}>10:24</Text>
        </View>

        <View style={styles.myBubble}>
          <Text style={styles.myText}>Shadow Box online.</Text>
          <Text style={styles.myTime}>10:25 ✓✓</Text>
        </View>
      </View>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.squareBtn} onPress={() => setOpen(true)}>
          <Feather name="plus" size={24} color={C.blue} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Message..."
            placeholderTextColor={C.muted}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.squareBtn}>
          <Feather name="mic" size={21} color={C.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {open && (
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />
            <Menu title="Voice Call" color={C.green} icon="phone" onPress={openVoiceCall} />
            <Menu title="Video Call" color={C.purple} icon="video" onPress={openVideoCall} />
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

function Menu({ title, color, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.menu} onPress={onPress}>
      <View style={[styles.menuDot, { backgroundColor: color }]}>
        <Feather name={icon} size={16} color="white" />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.blue, fontWeight: "900", fontSize: 18 },
  name: { color: C.text, fontSize: 19, fontWeight: "900" },
  online: { color: C.green, fontSize: 12, marginTop: 2 },
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
  secureText: { color: C.muted, fontSize: 12 },
  messages: { flex: 1, padding: 18, paddingTop: 20 },
  day: {
    alignSelf: "center",
    color: C.muted,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 20,
    fontSize: 12,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: C.card,
    borderRadius: 17,
    padding: 12,
    marginBottom: 14,
    maxWidth: "78%",
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: C.blue,
    borderRadius: 17,
    padding: 12,
    marginBottom: 14,
    maxWidth: "78%",
  },
  msgText: { color: C.text, fontSize: 15 },
  myText: { color: "white", fontSize: 15, fontWeight: "700" },
  msgTime: { color: C.muted, fontSize: 11, marginTop: 6, alignSelf: "flex-end" },
  myTime: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 6, alignSelf: "flex-end" },
  inputBar: {
    minHeight: 82,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  inputWrap: {
    flex: 1,
    height: 44,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  input: { color: C.text, fontSize: 15 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    marginHorizontal: 14,
    marginBottom: 96,
    backgroundColor: "#121B24",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    paddingTop: 10,
  },
  handle: {
    width: 46,
    height: 4,
    borderRadius: 3,
    backgroundColor: C.muted,
    opacity: 0.6,
    alignSelf: "center",
    marginBottom: 8,
  },
  menu: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  menuDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { color: C.text, fontSize: 17, fontWeight: "800" },
});