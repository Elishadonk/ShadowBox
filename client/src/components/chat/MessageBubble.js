import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
};

export default function MessageBubble({ item, playingVoice, onPlayVoice }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const value = String(item.content || item.text || "");
  const imageUri = value.replace("IMAGE::", "");

  const isImage = item.type === "image" || value.startsWith("IMAGE::");
  const isVoice = item.type === "voice";

  async function saveImage() {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow gallery access to save images.");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert("Saved", "Picture saved to your gallery.");
    } catch (err) {
      console.error("Save image failed:", err);
      Alert.alert("Error", "Could not save picture.");
    }
  }

  return (
    <>
      <View style={item.mine ? styles.myBubble : styles.otherBubble}>
        {isImage ? (
          <TouchableOpacity onPress={() => setPreviewOpen(true)}>
            <Image source={{ uri: imageUri }} style={styles.chatImage} />
          </TouchableOpacity>
        ) : isVoice ? (
          <TouchableOpacity
            style={styles.voiceBubble}
            onPress={() => onPlayVoice(item.content)}
          >
            <Feather
              name={playingVoice === item.content ? "pause-circle" : "play-circle"}
              size={24}
              color={item.mine ? "white" : C.blue}
            />

            <Text style={item.mine ? styles.voiceTextMine : styles.voiceText}>
              Voice message
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={item.mine ? styles.myText : styles.msgText}>
            {item.content || item.text}
          </Text>
        )}

        <Text style={item.mine ? styles.myTime : styles.msgTime}>
          {item.mine ? `${item.time} ✓✓` : item.time}
        </Text>
      </View>

      {isImage && (
        <Modal visible={previewOpen} transparent animationType="fade">
          <View style={styles.preview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />

            <View style={styles.previewTop}>
              <Pressable style={styles.previewBtn} onPress={() => setPreviewOpen(false)}>
                <Feather name="x" size={24} color="white" />
              </Pressable>

              <Pressable style={styles.previewBtn} onPress={saveImage}>
                <Feather name="download" size={24} color="white" />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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

  chatImage: {
    width: 220,
    height: 220,
    borderRadius: 14,
    backgroundColor: C.border,
  },

  preview: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },

  previewImage: {
    width: "100%",
    height: "78%",
    resizeMode: "contain",
  },

  previewTop: {
    position: "absolute",
    top: 45,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  previewBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  voiceBubble: {
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  voiceText: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
  },

  voiceTextMine: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
  },

  msgText: {
    color: C.text,
    fontSize: 15,
  },

  myText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },

  msgTime: {
    color: C.muted,
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },

  myTime: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
});