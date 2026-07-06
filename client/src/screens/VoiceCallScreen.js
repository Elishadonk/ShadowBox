import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
  red: "#FF4D4D",
};

export default function VoiceCallScreen({ goBack, nodeId = "Alpha-01" }) {
  return (
    <View style={styles.page}>
      <TouchableOpacity style={styles.back} onPress={goBack}>
        <Ionicons name="chevron-back" size={32} color={C.blue} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.name}>{nodeId}</Text>
        <Text style={styles.status}>● Connected</Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{nodeId[0]}</Text>
        </View>

        <Text style={styles.timer}>00:03:42</Text>
        <Text style={styles.secure}>Encrypted voice link</Text>
      </View>

      <View style={styles.controls}>
        <Control icon="mic-off" label="Mute" />
        <Control icon="volume-2" label="Speaker" />
        <Control icon="grid" label="Keypad" />
      </View>

      <TouchableOpacity style={styles.endBtn} onPress={goBack}>
        <Feather name="phone-off" size={22} color="white" />
        <Text style={styles.endText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

function Control({ icon, label }) {
  return (
    <TouchableOpacity style={styles.control}>
      <Feather name={icon} size={22} color={C.text} />
      <Text style={styles.controlText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg, paddingTop: 55, paddingHorizontal: 22 },
  back: { alignSelf: "flex-start" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  name: { color: C.text, fontSize: 30, fontWeight: "900" },
  status: { color: C.green, marginTop: 8, fontWeight: "700" },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 42,
  },
  avatarText: { color: C.blue, fontSize: 46, fontWeight: "900" },
  timer: { color: C.text, fontSize: 24, fontWeight: "800", marginTop: 34 },
  secure: { color: C.muted, marginTop: 8 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  control: {
    width: 96,
    height: 76,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  controlText: { color: C.muted, fontSize: 12, marginTop: 8, fontWeight: "800" },
  endBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.red,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  endText: { color: "white", fontWeight: "900", fontSize: 16 },
});