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

export default function VideoCallScreen({ goBack, nodeId = "Alpha-01" }) {
  return (
    <View style={styles.page}>
      <View style={styles.videoArea}>
        <TouchableOpacity style={styles.back} onPress={goBack}>
          <Ionicons name="chevron-back" size={32} color={C.blue} />
        </TouchableOpacity>

        <View style={styles.topInfo}>
          <Text style={styles.name}>{nodeId}</Text>
          <Text style={styles.status}>● Encrypted Video Link</Text>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewText}>Local Preview</Text>
        </View>

        <View style={styles.centerCam}>
          <Feather name="video" size={46} color={C.muted} />
          <Text style={styles.waiting}>Waiting for camera stream...</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Control icon="mic-off" label="Mute" />
        <Control icon="refresh-cw" label="Flip" />
        <Control icon="video-off" label="Camera" />
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
  page: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 48 },
  videoArea: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  back: { alignSelf: "flex-start" },
  topInfo: { marginTop: 10 },
  name: { color: C.text, fontSize: 28, fontWeight: "900" },
  status: { color: C.green, marginTop: 6, fontWeight: "700" },
  preview: {
    position: "absolute",
    right: 18,
    top: 86,
    width: 92,
    height: 128,
    borderRadius: 18,
    backgroundColor: "#050A0F",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { color: C.muted, fontSize: 11, fontWeight: "800" },
  centerCam: { flex: 1, alignItems: "center", justifyContent: "center" },
  waiting: { color: C.muted, marginTop: 14, fontWeight: "700" },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 18,
  },
  control: {
    width: 96,
    height: 72,
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