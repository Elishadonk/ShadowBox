import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
};

const CONTACTS = [
  { id: "SBX-1001", name: "Alpha-01", online: true },
  { id: "SBX-1002", name: "Bravo-02", online: false },
  { id: "SBX-1003", name: "Charlie-03", online: true },
  { id: "SBX-1004", name: "Delta-04", online: true },
];

export default function ContactsScreen({ goBack, openChat }) {
  const [search, setSearch] = useState("");

  const data = CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons
            name="chevron-back"
            size={30}
            color={COLORS.blue}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Contacts</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Search */}

      <View style={styles.search}>
        <Feather
          name="search"
          size={18}
          color={COLORS.muted}
        />

        <TextInput
          placeholder="Search name or Node ID..."
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contact}
            onPress={() => openChat(item.name)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.node}>
                {item.id}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: item.online
                    ? COLORS.green
                    : COLORS.muted,
                  fontSize: 12,
                }}
              >
                ● {item.online ? "Online" : "Offline"}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.muted}
                style={{ marginTop: 6 }}
              />
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 55,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },

  search: {
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    marginLeft: 10,
  },

  contact: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: COLORS.blue,
    fontWeight: "800",
    fontSize: 18,
  },

  name: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
  },

  node: {
    color: COLORS.muted,
    marginTop: 3,
    fontSize: 12,
  },
});