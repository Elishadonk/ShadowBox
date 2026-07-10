import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const C = {
  bg: "#121B24",
  border: "#1F2B36",
  text: "#F4F7FB",
  blue: "#2F80ED",
  muted: "#8793A0",
};

export default function AttachmentSheet({
  visible,
  onClose,
  onPickImage,
}) {
  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.sheet}>
        <View style={styles.handle} />

        <TouchableOpacity
          style={styles.item}
          onPress={onPickImage}
        >
          <View style={styles.icon}>
            <Feather
              name="image"
              size={18}
              color="white"
            />
          </View>

          <Text style={styles.title}>
            Upload Picture
          </Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,.55)",
    justifyContent: "flex-end",
  },

  sheet: {
    marginHorizontal: 14,
    marginBottom: 96,
    backgroundColor: C.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    paddingTop: 10,
  },

  handle: {
    width: 46,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.muted,
    alignSelf: "center",
    opacity: .6,
    marginBottom: 8,
  },

  item: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  title: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
  },
});