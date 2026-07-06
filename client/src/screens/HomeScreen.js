import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
  orange: "#F59E0B",
};

const chats = [
  { id: "Alpha-01", status: "Online", time: "12:45 PM" },
  { id: "Bravo-02", status: "Offline", time: "11:30 AM" },
  { id: "Charlie-03", status: "Online", time: "Yesterday" },
  { id: "Delta-04", status: "Online", time: "2 days ago" },
];

export default function HomeScreen({ openNewChat, openContacts, openChat }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SHADOW BOX</Text>
          <Text style={styles.sub}>Secure Mesh Network</Text>
        </View>
        <Text style={styles.online}>● Online</Text>
      </View>

      <View style={styles.search}>
        <Feather name="search" size={18} color={C.muted} />
        <TextInput
          placeholder="Search ID or contacts"
          placeholderTextColor={C.muted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Recent Chats</Text>
        <Text style={styles.onlineCount}>Online 3</Text>
      </View>

      {chats.map((chat) => (
        <TouchableOpacity key={chat.id} style={styles.chatRow} onPress={() => openChat(chat.id)}>
          <View>
            <Text style={styles.chatName}>{chat.id}</Text>
            <Text style={[styles.chatStatus, chat.status === "Offline" && styles.offline]}>
              ● {chat.status}
            </Text>
          </View>
          <Text style={styles.time}>{chat.time}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.plus} onPress={() => setOpen(true)}>
        <Feather name="plus" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Feather name="radio" size={20} color={C.blue} />
          <Text style={styles.navActive}>NETWORK</Text>
        </View>

        <View style={styles.navItem}>
          <Feather name="settings" size={20} color={C.muted} />
          <Text style={styles.navText}>SETTINGS</Text>
        </View>
      </View>

      {open && (
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />

            <Menu title="New Chat" color={C.blue} icon="message-circle" onPress={openNewChat} />
            <Menu title="Contacts" color={C.orange} icon="users" onPress={openContacts} />
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

function Menu({ title, color, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.menu} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Feather name={icon} size={16} color="white" />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg, paddingTop: 58, paddingHorizontal: 24 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { color: C.text, fontSize: 28, fontWeight: "900" },
  sub: { color: C.muted, marginTop: 5, fontSize: 14 },
  online: { color: C.green, fontWeight: "800", marginTop: 8 },
  search: {
    marginTop: 28,
    height: 48,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  sectionRow: {
    marginTop: 30,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: { color: C.text, fontSize: 15, fontWeight: "800" },
  onlineCount: { color: C.blue, fontSize: 13, fontWeight: "800" },
  chatRow: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatName: { color: C.text, fontSize: 16, fontWeight: "800" },
  chatStatus: { color: C.green, fontSize: 12, marginTop: 4 },
  offline: { color: C.muted },
  time: { color: C.muted, fontSize: 12 },
  plus: {
    position: "absolute",
    right: 30,
    bottom: 105,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNav: {
    position: "absolute",
    bottom: 24,
    left: 55,
    right: 55,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navItem: { alignItems: "center", gap: 4 },
  navActive: { color: C.blue, fontSize: 11, fontWeight: "900" },
  navText: { color: C.muted, fontSize: 11, fontWeight: "900" },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    marginHorizontal: 14,
    marginBottom: 24,
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
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { color: C.text, fontSize: 17, fontWeight: "800" },
});