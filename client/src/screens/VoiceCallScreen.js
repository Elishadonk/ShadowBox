import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  AudioSession,
  LiveKitRoom,
  useRoomContext,
} from "@livekit/react-native";
import { RoomEvent } from "livekit-client";

const TOKEN_SERVER_URL = "http://172.27.135.84:3001";

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

export default function VoiceCallScreen({
  goBack,
  nodeId = "SBX-482731",
}) {
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    prepareCall();

    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  async function prepareCall() {
    try {
      setLoading(true);
      setErrorText("");

      await AudioSession.startAudioSession();

      const identity = `device-${Date.now()}`;

      const response = await fetch(`${TOKEN_SERVER_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName: `voice-${nodeId}`,
          participantIdentity: identity,
          participantName: identity,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Token request failed");
      }

      if (
        !result.serverUrl ||
        result.serverUrl.includes("your-") ||
        result.serverUrl.includes("YOUR")
      ) {
        throw new Error("LiveKit server URL is still a placeholder");
      }

      setServerUrl(result.serverUrl);
      setToken(result.participantToken);
    } catch (error) {
      console.error("Voice call setup failed:", error);
      setErrorText(String(error.message || error));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={styles.loadingTitle}>Connecting secure call...</Text>
        <Text style={styles.loadingText}>Preparing microphone and room</Text>
      </View>
    );
  }

  if (errorText) {
    return (
      <View style={styles.loadingPage}>
        <Feather name="alert-circle" size={46} color={C.red} />

        <Text style={styles.errorTitle}>Connection failed</Text>
        <Text style={styles.errorText}>{errorText}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={prepareCall}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backTextButton} onPress={goBack}>
          <Text style={styles.backText}>Back to Chat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onError={(error) => {
        console.error("LiveKit room error:", error);
        Alert.alert("Call error", String(error.message || error));
      }}
      onDisconnected={goBack}
    >
      <ConnectedVoiceCall nodeId={nodeId} goBack={goBack} />
    </LiveKitRoom>
  );
}

function ConnectedVoiceCall({ nodeId, goBack }) {
  const room = useRoomContext();

  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    let timer;

    async function startCall() {
      try {
        await room.localParticipant.setMicrophoneEnabled(true);

        setConnected(true);
        setParticipantCount(room.remoteParticipants.size + 1);

        timer = setInterval(() => {
          setSeconds((current) => current + 1);
        }, 1000);
      } catch (error) {
        console.error("Microphone publish failed:", error);
        Alert.alert(
          "Microphone error",
          "Shadow Box could not publish your microphone."
        );
      }
    }

    function updateParticipants() {
      setParticipantCount(room.remoteParticipants.size + 1);
    }

    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);

    startCall();

    return () => {
      if (timer) {
        clearInterval(timer);
      }

      room.off(RoomEvent.ParticipantConnected, updateParticipants);
      room.off(RoomEvent.ParticipantDisconnected, updateParticipants);
    };
  }, [room]);

  async function toggleMute() {
    try {
      const nextMuted = !muted;

      await room.localParticipant.setMicrophoneEnabled(!nextMuted);
      setMuted(nextMuted);
    } catch (error) {
      console.error("Mute failed:", error);
    }
  }

  async function endCall() {
    try {
      await room.disconnect();
    } catch (error) {
      console.error("Disconnect failed:", error);
    }

    await AudioSession.stopAudioSession();
    goBack();
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={endCall}>
          <Ionicons name="chevron-back" size={27} color={C.text} />
        </TouchableOpacity>

        <View style={styles.secureBadge}>
          <Feather name="lock" size={13} color={C.green} />
          <Text style={styles.secureBadgeText}>LiveKit secure room</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {nodeId.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{nodeId}</Text>

        <Text style={styles.status}>
          ● {connected ? "Connected" : "Connecting"}
        </Text>

        <Text style={styles.timer}>{formatTime(seconds)}</Text>

        <Text style={styles.participants}>
          {participantCount === 1
            ? "Waiting for the other phone..."
            : `${participantCount} participants connected`}
        </Text>

        {muted && (
          <View style={styles.mutedBadge}>
            <Feather name="mic-off" size={14} color="white" />
            <Text style={styles.mutedText}>Microphone muted</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.control, muted && styles.controlActive]}
          onPress={toggleMute}
        >
          <Feather
            name={muted ? "mic-off" : "mic"}
            size={24}
            color="white"
          />

          <Text style={styles.controlText}>
            {muted ? "Unmute" : "Mute"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.endButton} onPress={endCall}>
        <Feather name="phone-off" size={24} color="white" />
        <Text style={styles.endText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  loadingPage: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 18,
  },

  loadingText: {
    color: C.muted,
    fontSize: 13,
    marginTop: 8,
  },

  errorTitle: {
    color: C.red,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 18,
  },

  errorText: {
    color: C.muted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 24,
    backgroundColor: C.blue,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },

  retryText: {
    color: "white",
    fontWeight: "900",
  },

  backTextButton: {
    marginTop: 18,
  },

  backText: {
    color: C.muted,
    fontWeight: "800",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  secureBadgeText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: C.blue,
    borderWidth: 6,
    borderColor: C.panel2,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "white",
    fontSize: 52,
    fontWeight: "900",
  },

  name: {
    color: C.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 30,
  },

  status: {
    color: C.green,
    marginTop: 9,
    fontSize: 14,
    fontWeight: "800",
  },

  timer: {
    color: C.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 24,
    letterSpacing: 1,
  },

  participants: {
    color: C.muted,
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
  },

  mutedBadge: {
    marginTop: 18,
    backgroundColor: C.red,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  mutedText: {
    color: "white",
    fontWeight: "900",
  },

  controls: {
    alignItems: "center",
    marginBottom: 20,
  },

  control: {
    width: 110,
    height: 82,
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