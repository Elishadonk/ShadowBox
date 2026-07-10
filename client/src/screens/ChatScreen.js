import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  createAudioPlayer,
} from "expo-audio";

import { getMessages, saveMessage } from "../database/messages";
import { getContacts } from "../database/contacts";

const C = {
  bg: "#101722",
  header: "#182333",
  panel: "#223247",
  panel2: "#2B3E56",
  border: "#506882",
  text: "#FFFFFF",
  muted: "#E3EAF2",
  blue: "#4285FF",
  blueDark: "#1E63DB",
  green: "#3DDC84",
  red: "#FF5C6A",
  whiteSoft: "#F7FAFC",
};

export default function ChatScreen({
  goBack,
  nodeId = "SBX-482731",
  openVoiceCall,
  openVideoCall,
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contactName, setContactName] = useState("");
  const [playingVoice, setPlayingVoice] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const listRef = useRef(null);
  const playerRef = useRef(null);
  const playbackTimerRef = useRef(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    loadChat();
    loadContactName();
  }, [nodeId]);

  useEffect(() => {
    setupAudio();

    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }

      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (err) {
          console.log("Player cleanup skipped:", err);
        }
      }
    };
  }, []);

  async function setupAudio() {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        console.log("Microphone permission denied");
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    } catch (err) {
      console.error("Audio setup failed:", err);
    }
  }

  async function loadContactName() {
    try {
      const contacts = await getContacts();
      const contact = contacts.find((item) => item.id === nodeId);

      setContactName(contact ? contact.name : "");
    } catch (err) {
      console.error("Failed to load contact name:", err);
    }
  }

  async function loadChat() {
    try {
      const savedMessages = await getMessages(nodeId);

      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        setMessages([
          {
            id: "starter-1",
            type: "text",
            content: "Secure channel opened.",
            text: "Secure channel opened.",
            mine: false,
            time: "10:24",
          },
          {
            id: "starter-2",
            type: "text",
            content: "Shadow Box online.",
            text: "Shadow Box online.",
            mine: true,
            time: "10:25",
          },
        ]);
      }
    } catch (err) {
      console.error("Load failed:", err);
    }
  }

  async function sendMessage() {
    const text = message.trim();

    if (!text) return;

    setMessage("");

    await addMessage({
      type: "text",
      content: text,
      text,
    });
  }

  async function addMessage({ type = "text", content, text }) {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: `local-${Date.now()}-${Math.random()}`,
      type,
      content,
      text,
      mine: true,
      time: now,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    try {
      await saveMessage({
        nodeId,
        text,
        type,
        content,
        mine: true,
        time: now,
      });
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  async function pickImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setOpen(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;

        await addMessage({
          type: "image",
          content: imageUri,
          text: "Picture",
        });
      }

      setOpen(false);
    } catch (err) {
      console.error("Image picker failed:", err);
      setOpen(false);
    }
  }

  async function startRecording() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error("Recording start failed:", err);
    }
  }

  async function stopRecording() {
    try {
      await audioRecorder.stop();

      const voiceUri = audioRecorder.uri;

      if (!voiceUri) {
        console.log("No recording URI found");
        return;
      }

      await addMessage({
        type: "voice",
        content: voiceUri,
        text: "Voice message",
      });

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch (err) {
      console.error("Recording stop failed:", err);
    }
  }

  async function playVoice(uri) {
    try {
      if (!uri) return;

      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }

      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (err) {
          console.log("Old player cleanup skipped:", err);
        }

        playerRef.current = null;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      const player = createAudioPlayer(uri);

      playerRef.current = player;
      setPlayingVoice(uri);

      player.seekTo(0);
      player.play();

      playbackTimerRef.current = setTimeout(() => {
        setPlayingVoice(null);
      }, 5000);
    } catch (err) {
      console.error("Voice playback failed:", err);
      setPlayingVoice(null);
    }
  }

  function getMessageValue(item) {
    return String(item.content || item.text || "");
  }

  function renderMessageContent(item) {
    const value = getMessageValue(item);
    const imageUri = value.replace("IMAGE::", "");

    if (item.type === "image" || value.startsWith("IMAGE::")) {
      return (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setPreviewImage(imageUri)}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.chatImage}
          />
        </TouchableOpacity>
      );
    }

    if (item.type === "voice") {
      const isPlaying = playingVoice === item.content;

      return (
        <TouchableOpacity
          style={styles.voiceBubble}
          activeOpacity={0.82}
          onPress={() => playVoice(item.content)}
        >
          <View style={styles.voicePlayButton}>
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="white"
            />
          </View>

          <View style={styles.waveform}>
            {[12, 19, 27, 15, 30, 21, 13, 25, 17, 29, 15, 23].map(
              (height, index) => (
                <View
                  key={`${item.id}-wave-${index}`}
                  style={[
                    styles.waveBar,
                    { height },
                    item.mine && styles.waveBarMine,
                  ]}
                />
              )
            )}
          </View>

          <Text
            style={
              item.mine
                ? styles.voiceTextMine
                : styles.voiceText
            }
          >
            Voice
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <Text
        style={item.mine ? styles.myText : styles.msgText}
      >
        {item.content || item.text}
      </Text>
    );
  }

  function renderMessage({ item }) {
    return (
      <View
        style={
          item.mine
            ? styles.myBubble
            : styles.otherBubble
        }
      >
        {renderMessageContent(item)}

        <Text
          style={item.mine ? styles.myTime : styles.msgTime}
        >
          {item.mine ? `${item.time}  ✓✓` : item.time}
        </Text>
      </View>
    );
  }

  const title = contactName || nodeId;

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={goBack}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color={C.whiteSoft}
          />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {title.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {title}
          </Text>

          {contactName ? (
            <Text style={styles.nodeId}>{nodeId}</Text>
          ) : null}

          <Text style={styles.online}>● Online</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={openVoiceCall}
        >
          <Feather
            name="phone"
            size={20}
            color={C.whiteSoft}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={openVideoCall}
        >
          <Feather
            name="video"
            size={21}
            color={C.whiteSoft}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.secure}>
        <Feather
          name={recorderState.isRecording ? "mic" : "lock"}
          size={13}
          color={
            recorderState.isRecording ? C.red : C.muted
          }
        />

        <Text
          style={[
            styles.secureText,
            recorderState.isRecording &&
              styles.recordingText,
          ]}
        >
          {recorderState.isRecording
            ? "Recording voice note..."
            : "End-to-end encrypted"}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={15}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        ListHeaderComponent={
          <Text style={styles.day}>Today</Text>
        }
        onContentSizeChange={() => {
          listRef.current?.scrollToEnd({
            animated: false,
          });
        }}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => setOpen(true)}
        >
          <Feather
            name="plus"
            size={23}
            color={C.whiteSoft}
          />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Message..."
            placeholderTextColor={C.muted}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.inputButton,
            recorderState.isRecording &&
              styles.recordingButton,
          ]}
          onPress={
            recorderState.isRecording
              ? stopRecording
              : startRecording
          }
        >
          <Feather
            name={
              recorderState.isRecording
                ? "square"
                : "mic"
            }
            size={20}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Ionicons
            name="send"
            size={19}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {open && (
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
        >
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />

            <TouchableOpacity
              style={styles.menu}
              onPress={pickImage}
            >
              <View style={styles.menuIcon}>
                <Feather
                  name="image"
                  size={18}
                  color="white"
                />
              </View>

              <Text style={styles.menuText}>
                Upload Picture
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      )}

      <Modal
        visible={Boolean(previewImage)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.preview}>
          <Image
            source={{ uri: previewImage }}
            style={styles.previewImage}
          />

          <Pressable
            style={styles.previewClose}
            onPress={() => setPreviewImage(null)}
          >
            <Feather
              name="x"
              size={25}
              color="white"
            />
          </Pressable>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 14,
    backgroundColor: C.header,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "white",
    fontSize: 19,
    fontWeight: "900",
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: C.text,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  nodeId: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },

  online: {
    color: C.green,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  secure: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  secureText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  recordingText: {
    color: C.red,
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
  },

  day: {
    alignSelf: "center",
    color: C.muted,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 20,
    fontSize: 12,
    fontWeight: "800",
  },

  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 14,
    maxWidth: "82%",
  },

  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: C.blue,
    borderRadius: 20,
    borderTopRightRadius: 6,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 14,
    maxWidth: "82%",
  },

  msgText: {
    color: C.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },

  myText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },

  msgTime: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    alignSelf: "flex-end",
    marginTop: 7,
  },

  myTime: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: "700",
    alignSelf: "flex-end",
    marginTop: 7,
  },

  chatImage: {
    width: 230,
    height: 230,
    borderRadius: 16,
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  voiceBubble: {
    minWidth: 210,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  voicePlayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.blueDark,
    alignItems: "center",
    justifyContent: "center",
  },

  waveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: C.blue,
  },

  waveBarMine: {
    backgroundColor: "white",
  },

  voiceText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
  },

  voiceTextMine: {
    color: "white",
    fontSize: 13,
    fontWeight: "800",
  },

  inputBar: {
    minHeight: 86,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.header,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  inputButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingButton: {
    backgroundColor: C.red,
    borderColor: C.red,
  },

  inputWrap: {
    flex: 1,
    minHeight: 46,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  input: {
    color: C.text,
    fontSize: 16,
    fontWeight: "500",
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "flex-end",
  },

  sheet: {
    marginHorizontal: 14,
    marginBottom: 96,
    backgroundColor: C.header,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    paddingTop: 10,
  },

  handle: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: C.muted,
    opacity: 0.55,
    alignSelf: "center",
    marginBottom: 8,
  },

  menu: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.blue,
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    color: C.text,
    fontSize: 17,
    fontWeight: "900",
  },

  preview: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.98)",
    justifyContent: "center",
    alignItems: "center",
  },

  previewImage: {
    width: "100%",
    height: "82%",
    resizeMode: "contain",
  },

  previewClose: {
    position: "absolute",
    top: 46,
    right: 18,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
});