import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const C = {
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  blue: "#2F80ED",
  green: "#4CD964",
};

export default function ChatHeader({
  title,
  subtitle,
  hasContactName,
  goBack,
  openVoiceCall,
  openVideoCall,
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack}>
        <Ionicons name="chevron-back" size={32} color={C.blue} />
      </TouchableOpacity>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{title.charAt(0)}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{title}</Text>

        {hasContactName ? (
          <>
            <Text style={styles.nodeId}>{subtitle}</Text>
            <Text style={styles.online}>● Online</Text>
          </>
        ) : (
          <Text style={styles.online}>{subtitle}</Text>
        )}
      </View>

      <TouchableOpacity onPress={openVoiceCall}>
        <Feather name="phone" size={22} color={C.blue} />
      </TouchableOpacity>

      <TouchableOpacity onPress={openVideoCall}>
        <Feather name="video" size={23} color={C.blue} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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

  avatarText: {
    color: C.blue,
    fontWeight: "900",
    fontSize: 18,
  },

  name: {
    color: C.text,
    fontSize: 18,
    fontWeight: "900",
  },

  nodeId: {
    color: C.blue,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  online: {
    color: C.green,
    fontSize: 12,
    marginTop: 2,
  },
});