import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

const C = {
  bg: "#101722",
  panel: "#182333",
  panel2: "#223247",
  border: "#506882",
  text: "#FFFFFF",
  muted: "#E3EAF2",
  blue: "#4285FF",
  green: "#3DDC84",
  red: "#FF5C6A",
};

export default function VideoCallScreen({
  goBack,
  nodeId = "SBX-482731",
}) {
  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const [facing, setFacing] = useState("front");
  const [cameraOn, setCameraOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    requestPermissions();

    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function requestPermissions() {
    try {
      const cameraResult = await requestCameraPermission();
      const microphoneResult = await requestMicrophonePermission();

      if (!cameraResult.granted) {
        Alert.alert(
          "Camera permission",
          "Shadow Box needs camera permission for video calls."
        );
      }

      if (!microphoneResult.granted) {
        Alert.alert(
          "Microphone permission",
          "Shadow Box needs microphone permission for video calls."
        );
      }
    } catch (error) {
      console.error("Permission request failed:", error);
    }
  }

  function flipCamera() {
    setFacing((current) =>
      current === "front" ? "back" : "front"
    );
  }

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return [
        hours,
        String(minutes).padStart(2, "0"),
        String(secs).padStart(2, "0"),
      ].join(":");
    }

    return [
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  }

  const cameraReady =
    cameraPermission?.granted && cameraOn;

  return (
    <View style={styles.page}>
      <View style={styles.videoArea}>
        {cameraReady ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="video"
            mute={muted}
          />
        ) : (
          <View style={styles.cameraOff}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nodeId.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Feather
              name="video-off"
              size={34}
              color={C.muted}
            />

            <Text style={styles.cameraOffText}>
              {cameraPermission?.granted
                ? "Camera turned off"
                : "Camera permission needed"}
            </Text>
          </View>
        )}

        <View style={styles.topOverlay}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={goBack}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color="white"
            />
          </TouchableOpacity>

          <View style={styles.callInfo}>
            <Text style={styles.name}>{nodeId}</Text>

            <Text style={styles.status}>
              ● Secure video
            </Text>

            <Text style={styles.timer}>
              {formatTime(seconds)}
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <View style={styles.localPreview}>
          {cameraReady ? (
            <CameraView
              style={styles.localCamera}
              facing={facing}
              mode="video"
              mute
            />
          ) : (
            <View style={styles.localCameraOff}>
              <Feather
                name="video-off"
                size={22}
                color={C.muted}
              />
            </View>
          )}
        </View>

        {muted && (
          <View style={styles.mutedBadge}>
            <Feather
              name="mic-off"
              size={14}
              color="white"
            />

            <Text style={styles.mutedText}>Muted</Text>
          </View>
        )}

        <View style={styles.waitingBadge}>
          <Feather
            name="shield"
            size={14}
            color={C.green}
          />

          <Text style={styles.waitingText}>
            Waiting for remote video stream
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Control
          icon={muted ? "mic-off" : "mic"}
          label={muted ? "Unmute" : "Mute"}
          active={muted}
          onPress={() => setMuted((current) => !current)}
        />

        <Control
          icon="refresh-cw"
          label="Flip"
          onPress={flipCamera}
        />

        <Control
          icon={cameraOn ? "video" : "video-off"}
          label={cameraOn ? "Camera" : "Camera Off"}
          active={!cameraOn}
          onPress={() => setCameraOn((current) => !current)}
        />
      </View>

      <TouchableOpacity
        style={styles.endButton}
        onPress={goBack}
      >
        <Feather
          name="phone-off"
          size={24}
          color="white"
        />

        <Text style={styles.endText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

function Control({
  icon,
  label,
  active = false,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.control,
        active && styles.controlActive,
      ]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={23}
        color="white"
      />

      <Text style={styles.controlText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 26,
  },

  videoArea: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
  },

  topOverlay: {
    position: "absolute",
    top: 16,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(10,15,22,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  callInfo: {
    alignItems: "center",
    backgroundColor: "rgba(10,15,22,0.7)",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },

  name: {
    color: C.text,
    fontSize: 17,
    fontWeight: "900",
  },

  status: {
    color: C.green,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  timer: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  cameraOff: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "white",
    fontSize: 44,
    fontWeight: "900",
  },

  cameraOffText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: "800",
  },

  localPreview: {
    position: "absolute",
    right: 16,
    bottom: 82,
    width: 104,
    height: 145,
    borderRadius: 20,
    backgroundColor: C.panel2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    overflow: "hidden",
  },

  localCamera: {
    flex: 1,
  },

  localCameraOff: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  mutedBadge: {
    position: "absolute",
    left: 16,
    bottom: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.red,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  mutedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
  },

  waitingBadge: {
    position: "absolute",
    left: 16,
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(10,15,22,0.74)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  waitingText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "800",
  },

  controls: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    marginBottom: 16,
  },

  control: {
    flex: 1,
    height: 78,
    borderRadius: 20,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  controlActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },

  controlText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },

  endButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: C.red,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  endText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },
});