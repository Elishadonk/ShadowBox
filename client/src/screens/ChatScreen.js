import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

import {
  getMessages,
  saveMessage,
} from "../database/messages";

import { getContacts } from "../database/contacts";

/*
  Messages remain in memory while Shadow Box is running.
*/
const chatCache = new Map();

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

function createStarterMessages() {
  return [
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
  ];
}

export default function ChatScreen({
  goBack,
  nodeId = "SBX-482731",
  openVoiceCall,
  openVideoCall,
}) {
  const [messages, setMessages] = useState(
    () => chatCache.get(nodeId) || []
  );

  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [attachmentOpen, setAttachmentOpen] =
    useState(false);
  const [playingVoice, setPlayingVoice] =
    useState(null);
  const [previewImage, setPreviewImage] =
    useState(null);

  const listRef = useRef(null);

  /*
    ============================================================
    VOICE PLAYBACK CONTROL
    ============================================================

    playerRef:
      Holds the ONE AudioPlayer currently owned by this screen.

    activeVoiceRef:
      Holds the URI of the ONE voice that is allowed to play.

    playbackRequestRef:
      A numeric request ID.

      Every tap creates a new request ID.
      Old async operations become invalid immediately.

    playerSubscriptionRef:
      Holds the Expo Audio playback-status subscription so
      it can be removed when the player is destroyed.
  */
  const playerRef = useRef(null);
  const activeVoiceRef = useRef(null);
  const playbackRequestRef = useRef(0);
  const playerSubscriptionRef = useRef(null);

  const firstLayoutRef = useRef(true);

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const recorderState =
    useAudioRecorderState(audioRecorder);

  /*
    ============================================================
    CHAT LOADING
    ============================================================
  */
  useEffect(() => {
    let cancelled = false;

    const cachedMessages = chatCache.get(nodeId);

    if (cachedMessages) {
      setMessages(cachedMessages);
    } else {
      setMessages([]);
    }

    async function refreshChat() {
      try {
        const savedMessages =
          await getMessages(nodeId, 50);

        if (cancelled) return;

        const nextMessages =
          savedMessages.length > 0
            ? savedMessages
            : cachedMessages ||
              createStarterMessages();

        chatCache.set(nodeId, nextMessages);
        setMessages(nextMessages);
      } catch (error) {
        console.error(
          "Chat refresh failed:",
          error
        );

        if (!cancelled && !cachedMessages) {
          const starterMessages =
            createStarterMessages();

          chatCache.set(
            nodeId,
            starterMessages
          );

          setMessages(starterMessages);
        }
      }
    }

    refreshChat();

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  /*
    ============================================================
    CONTACT NAME
    ============================================================
  */
  useEffect(() => {
    let cancelled = false;

    async function loadContactName() {
      try {
        const contacts = await getContacts();

        if (cancelled) return;

        const contact = contacts.find(
          (item) =>
            item.id === nodeId ||
            item.nodeId === nodeId ||
            item.node_id === nodeId
        );

        setContactName(contact?.name || "");
      } catch (error) {
        console.error(
          "Failed to load contact name:",
          error
        );
      }
    }

    loadContactName();

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  /*
    ============================================================
    AUDIO SETUP
    ============================================================
  */
  useEffect(() => {
    async function setupAudio() {
      try {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
          console.log(
            "Microphone permission denied"
          );
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error(
          "Audio setup failed:",
          error
        );
      }
    }

    setupAudio();

    /*
      FULL PLAYBACK CLEANUP WHEN SCREEN CLOSES.
    */
    return () => {
      /*
        Invalidate every pending async playback request.
      */
      playbackRequestRef.current += 1;

      activeVoiceRef.current = null;

      /*
        Remove playback event listener.
      */
      if (playerSubscriptionRef.current) {
        try {
          playerSubscriptionRef.current.remove();
        } catch (error) {
          console.log(
            "Playback listener cleanup skipped:",
            error
          );
        }

        playerSubscriptionRef.current = null;
      }

      /*
        Remove the one active player.
      */
      const player = playerRef.current;

      playerRef.current = null;

      if (player) {
        try {
          player.pause();
        } catch (error) {
          console.log(
            "Audio pause cleanup skipped:",
            error
          );
        }

        try {
          player.remove();
        } catch (error) {
          console.log(
            "Audio player cleanup skipped:",
            error
          );
        }
      }
    };
  }, []);

  /*
    ============================================================
    MESSAGE CACHE
    ============================================================
  */
  const updateMessages = useCallback(
    (updater) => {
      setMessages((previousMessages) => {
        const updatedMessages =
          typeof updater === "function"
            ? updater(previousMessages)
            : updater;

        chatCache.set(
          nodeId,
          updatedMessages
        );

        return updatedMessages;
      });
    },
    [nodeId]
  );

  /*
    ============================================================
    SEND TEXT
    ============================================================
  */
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

  /*
    ============================================================
    ADD MESSAGE
    ============================================================
  */
  async function addMessage({
    type = "text",
    content,
    text,
  }) {
    const now = new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    const newMessage = {
      id: `local-${Date.now()}-${Math.random()}`,
      type,
      content,
      text,
      mine: true,
      time: now,
    };

    /*
      Optimistic UI.
    */
    updateMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
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
    } catch (error) {
      console.error(
        "Message save failed:",
        error
      );
    }
  }

  /*
    ============================================================
    IMAGE PICKER
    ============================================================
  */
  async function pickImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setAttachmentOpen(false);
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets?.length > 0
      ) {
        const imageUri =
          result.assets[0].uri;

        await addMessage({
          type: "image",
          content: imageUri,
          text: "Picture",
        });
      }
    } catch (error) {
      console.error(
        "Image picker failed:",
        error
      );
    } finally {
      setAttachmentOpen(false);
    }
  }

  /*
    ============================================================
    START RECORDING
    ============================================================
  */
  async function startRecording() {
    try {
      /*
        Stop voice playback before recording.
      */
      stopVoicePlayback();

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();
    } catch (error) {
      console.error(
        "Recording start failed:",
        error
      );
    }
  }

  /*
    ============================================================
    STOP RECORDING
    ============================================================
  */
  async function stopRecording() {
    try {
      await audioRecorder.stop();

      const voiceUri =
        audioRecorder.uri;

      if (!voiceUri) {
        console.log(
          "No recording URI found"
        );
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
    } catch (error) {
      console.error(
        "Recording stop failed:",
        error
      );
    }
  }

  /*
    ============================================================
    STOP CURRENT VOICE
    ============================================================

    This function is synchronous.

    That is important.

    We invalidate the current playback request FIRST,
    then destroy the player.

    So if another tap happens immediately, the old async
    operation can no longer claim playback again.
  */
  function stopVoicePlayback() {
    /*
      Invalidate ALL previous playback requests.
    */
    playbackRequestRef.current += 1;

    /*
      No voice is allowed to play now.
    */
    activeVoiceRef.current = null;

    /*
      UI immediately changes.
    */
    setPlayingVoice(null);

    /*
      Remove status listener.
    */
    if (playerSubscriptionRef.current) {
      try {
        playerSubscriptionRef.current.remove();
      } catch (error) {
        console.log(
          "Playback listener removal skipped:",
          error
        );
      }

      playerSubscriptionRef.current = null;
    }

    /*
      Take ownership away from the ref BEFORE
      touching the native player.
    */
    const player = playerRef.current;

    playerRef.current = null;

    if (!player) {
      return;
    }

    try {
      player.pause();
    } catch (error) {
      console.log(
        "Audio pause skipped:",
        error
      );
    }

    try {
      player.remove();
    } catch (error) {
      console.log(
        "Audio remove skipped:",
        error
      );
    }
  }

  /*
    ============================================================
    PLAY VOICE
    ============================================================

    GUARANTEES:

    1. Only ONE voice can be active.
    2. Double tap cannot create two players.
    3. Switching voice immediately invalidates the old request.
    4. Old async operations cannot install themselves again.
    5. Player is removed when playback finishes.
    */
  async function playVoice(uri) {
    if (!uri) return;

    /*
      ----------------------------------------------------------
      STEP 1
      ----------------------------------------------------------

      Read the current voice BEFORE changing anything.
      */
    const currentUri =
      activeVoiceRef.current;

    /*
      ----------------------------------------------------------
      SAME VOICE
      ----------------------------------------------------------

      If the same voice is already active, this tap means STOP.

      This happens immediately.

      No await.
      No second player.
      No race.
      */
    if (currentUri === uri) {
      stopVoicePlayback();
      return;
    }

    /*
      ----------------------------------------------------------
      NEW PLAYBACK REQUEST
      ----------------------------------------------------------

      Create a unique request number.

      Example:

      First tap:
        request = 1

      Second tap:
        request = 2

      If request 1 finishes an await later,
      it sees that 2 is now current and aborts.
      */
    const requestId =
      playbackRequestRef.current + 1;

    playbackRequestRef.current =
      requestId;

    /*
      ----------------------------------------------------------
      CLAIM THE VOICE IMMEDIATELY
      ----------------------------------------------------------

      This happens BEFORE the first await.

      This is the important double-tap protection.
      */
    activeVoiceRef.current = uri;

    /*
      UI immediately shows this voice as playing.
      */
    setPlayingVoice(uri);

    /*
      ----------------------------------------------------------
      DESTROY PREVIOUS PLAYER
      ----------------------------------------------------------
    */
    if (playerSubscriptionRef.current) {
      try {
        playerSubscriptionRef.current.remove();
      } catch (error) {
        console.log(
          "Old playback listener removal skipped:",
          error
        );
      }

      playerSubscriptionRef.current = null;
    }

    const oldPlayer =
      playerRef.current;

    playerRef.current = null;

    if (oldPlayer) {
      try {
        oldPlayer.pause();
      } catch (error) {
        console.log(
          "Previous audio pause skipped:",
          error
        );
      }

      try {
        oldPlayer.remove();
      } catch (error) {
        console.log(
          "Previous audio remove skipped:",
          error
        );
      }
    }

    try {
      /*
        --------------------------------------------------------
        AUDIO MODE
        --------------------------------------------------------
      */
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      /*
        --------------------------------------------------------
        RACE CHECK #1
        --------------------------------------------------------

        Maybe the user tapped another voice while
        setAudioModeAsync() was waiting.

        If so, this request is DEAD.
      */
      if (
        playbackRequestRef.current !==
        requestId
      ) {
        return;
      }

      if (
        activeVoiceRef.current !== uri
      ) {
        return;
      }

      /*
        --------------------------------------------------------
        CREATE EXACTLY ONE PLAYER
        --------------------------------------------------------
      */
      const player =
        createAudioPlayer(uri);

      /*
        --------------------------------------------------------
        RACE CHECK #2
        --------------------------------------------------------

        The user could have tapped again during
        createAudioPlayer().
      */
      if (
        playbackRequestRef.current !==
        requestId ||
        activeVoiceRef.current !== uri
      ) {
        try {
          player.remove();
        } catch (error) {
          console.log(
            "Unused player removal skipped:",
            error
          );
        }

        return;
      }

      /*
        --------------------------------------------------------
        PLAYER IS NOW OWNED BY THIS REQUEST
        --------------------------------------------------------
      */
      playerRef.current = player;

      /*
        --------------------------------------------------------
        LISTEN FOR REAL PLAYBACK COMPLETION
        --------------------------------------------------------

        No fake 5-second timer.

        Expo Audio tells us when the actual audio finishes.
      */
      playerSubscriptionRef.current =
        player.addListener(
          "playbackStatusUpdate",
          (status) => {
            /*
              Ignore events from an old request.
            */
            if (
              playbackRequestRef.current !==
              requestId
            ) {
              return;
            }

            if (
              activeVoiceRef.current !== uri
            ) {
              return;
            }

            /*
              Audio actually finished.
            */
            if (status.didJustFinish) {
              activeVoiceRef.current = null;

              if (
                playerRef.current ===
                player
              ) {
                playerRef.current = null;
              }

              setPlayingVoice(null);

              if (
                playerSubscriptionRef.current
              ) {
                try {
                  playerSubscriptionRef.current.remove();
                } catch (error) {
                  console.log(
                    "Playback completion listener cleanup skipped:",
                    error
                  );
                }

                playerSubscriptionRef.current =
                  null;
              }

              try {
                player.remove();
              } catch (error) {
                console.log(
                  "Playback completion player cleanup skipped:",
                  error
                );
              }
            }
          }
        );

      /*
        --------------------------------------------------------
        START FROM BEGINNING
        --------------------------------------------------------
      */
      await player.seekTo(0);

      /*
        --------------------------------------------------------
        RACE CHECK #3
        --------------------------------------------------------
      */
      if (
        playbackRequestRef.current !==
        requestId ||
        activeVoiceRef.current !== uri ||
        playerRef.current !== player
      ) {
        try {
          player.remove();
        } catch (error) {
          console.log(
            "Cancelled player cleanup skipped:",
            error
          );
        }

        return;
      }

      /*
        --------------------------------------------------------
        PLAY
        --------------------------------------------------------
      */
      player.play();
    } catch (error) {
      console.error(
        "Voice playback failed:",
        error
      );

      /*
        Only clean the UI if this is still
        the active playback request.
      */
      if (
        playbackRequestRef.current ===
          requestId &&
        activeVoiceRef.current === uri
      ) {
        activeVoiceRef.current = null;

        setPlayingVoice(null);

        if (
          playerSubscriptionRef.current
        ) {
          try {
            playerSubscriptionRef.current.remove();
          } catch (cleanupError) {
            console.log(
              "Playback listener cleanup failed:",
              cleanupError
            );
          }

          playerSubscriptionRef.current =
            null;
        }

        const failedPlayer =
          playerRef.current;

        playerRef.current = null;

        if (failedPlayer) {
          try {
            failedPlayer.remove();
          } catch (cleanupError) {
            console.log(
              "Failed player cleanup failed:",
              cleanupError
            );
          }
        }
      }
    }
  }

  /*
    ============================================================
    MESSAGE VALUE
    ============================================================
  */
  function getMessageValue(item) {
    return String(
      item.content ||
        item.text ||
        ""
    );
  }

  /*
    ============================================================
    MESSAGE CONTENT
    ============================================================
  */
  function renderMessageContent(item) {
    const value =
      getMessageValue(item);

    const imageUri =
      value.replace(
        "IMAGE::",
        ""
      );

    const isImage =
      item.type === "image" ||
      value.startsWith("IMAGE::");

    /*
      IMAGE
    */
    if (isImage) {
      return (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() =>
            setPreviewImage(imageUri)
          }
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.chatImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    /*
      VOICE
    */
    if (item.type === "voice") {
      const isPlaying =
        playingVoice === item.content;

      return (
        <TouchableOpacity
          style={styles.voiceBubble}
          activeOpacity={0.82}
          onPress={() =>
            playVoice(item.content)
          }
        >
          <View
            style={styles.voicePlayButton}
          >
            <Feather
              name={
                isPlaying
                  ? "pause"
                  : "play"
              }
              size={18}
              color="white"
            />
          </View>

          <View
            style={styles.waveform}
          >
            {[
              12,
              19,
              27,
              15,
              30,
              21,
              13,
              25,
              17,
              29,
              15,
              23,
            ].map(
              (height, index) => (
                <View
                  key={`${item.id}-wave-${index}`}
                  style={[
                    styles.waveBar,
                    { height },
                    item.mine &&
                      styles.waveBarMine,
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

    /*
      TEXT
    */
    return (
      <Text
        style={
          item.mine
            ? styles.myText
            : styles.msgText
        }
      >
        {item.content ||
          item.text}
      </Text>
    );
  }

  /*
    ============================================================
    MESSAGE RENDER
    ============================================================
  */
  const renderMessage =
    useCallback(
      ({ item }) => (
        <View
          style={
            item.mine
              ? styles.myBubble
              : styles.otherBubble
          }
        >
          {renderMessageContent(
            item
          )}

          <Text
            style={
              item.mine
                ? styles.myTime
                : styles.msgTime
            }
          >
            {item.mine
              ? `${item.time}  ✓✓`
              : item.time}
          </Text>
        </View>
      ),
      [playingVoice]
    );

  /*
    ============================================================
    LIST LAYOUT
    ============================================================
  */
  function handleListLayout() {
    if (!firstLayoutRef.current) {
      return;
    }

    firstLayoutRef.current = false;

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({
        animated: false,
      });
    });
  }

  const title =
    contactName || nodeId;

  /*
    ============================================================
    UI
    ============================================================
  */
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            /*
              Stop audio before leaving chat.
            */
            stopVoicePlayback();

            goBack?.();
          }}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color={C.whiteSoft}
          />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text
            style={styles.avatarText}
          >
            {title
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {title}
          </Text>

          {contactName ? (
            <Text
              style={styles.nodeId}
            >
              {nodeId}
            </Text>
          ) : null}

          <Text
            style={styles.online}
          >
            ● Online
          </Text>
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
          name={
            recorderState.isRecording
              ? "mic"
              : "lock"
          }
          size={13}
          color={
            recorderState.isRecording
              ? C.red
              : C.muted
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
        keyExtractor={(item) =>
          String(item.id)
        }
        style={styles.messages}
        contentContainerStyle={
          styles.messagesContent
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={16}
        windowSize={5}
        removeClippedSubviews={
          Platform.OS === "android"
        }
        ListHeaderComponent={
          <Text style={styles.day}>
            Today
          </Text>
        }
        onLayout={
          handleListLayout
        }
      />

      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() =>
            setAttachmentOpen(true)
          }
        >
          <Feather
            name="plus"
            size={23}
            color={C.whiteSoft}
          />
        </TouchableOpacity>

        <View
          style={styles.inputWrap}
        >
          <TextInput
            placeholder="Message..."
            placeholderTextColor={
              C.muted
            }
            style={styles.input}
            value={message}
            onChangeText={
              setMessage
            }
            onSubmitEditing={
              sendMessage
            }
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

      {attachmentOpen && (
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setAttachmentOpen(false)
          }
        >
          <Pressable
            style={styles.sheet}
          >
            <View
              style={styles.handle}
            />

            <TouchableOpacity
              style={styles.menu}
              onPress={pickImage}
            >
              <View
                style={styles.menuIcon}
              >
                <Feather
                  name="image"
                  size={18}
                  color="white"
                />
              </View>

              <Text
                style={styles.menuText}
              >
                Upload Picture
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      )}

      <Modal
        visible={Boolean(
          previewImage
        )}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setPreviewImage(null)
        }
      >
        <View
          style={styles.preview}
        >
          <Image
            source={{
              uri: previewImage,
            }}
            style={
              styles.previewImage
            }
          />

          <Pressable
            style={
              styles.previewClose
            }
            onPress={() =>
              setPreviewImage(null)
            }
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

/*
  ==============================================================
  STYLES
  ==============================================================
*/

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
    borderColor:
      "rgba(255,255,255,0.16)",
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
    backgroundColor:
      "rgba(0,0,0,0.62)",
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
    backgroundColor:
      "rgba(0,0,0,0.98)",
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
    backgroundColor:
      "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
});