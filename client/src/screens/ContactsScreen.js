import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import {
  getContacts,
  saveContact,
  deleteContact,
} from "../database/contacts";

const COLORS = {
  bg: "#071018",
  card: "#111A23",
  border: "#1F2B36",
  text: "#F4F7FB",
  muted: "#8793A0",
  blue: "#2F80ED",
  green: "#4CD964",
  red: "#EF4444",
};

export default function ContactsScreen({ goBack, openChat }) {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newNodeId, setNewNodeId] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const savedContacts = await getContacts();
      setContacts(savedContacts);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  }

  function formatNodeId(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 6);
    return numbers ? `SBX-${numbers}` : "";
  }

  async function addContact() {
    const nodeId = formatNodeId(newNodeId);
    const name = newName.trim() || nodeId;

    if (nodeId.length !== 10) return;

    try {
      await saveContact({
        nodeId,
        name,
        online: false,
      });

      setNewNodeId("");
      setNewName("");
      setShowAdd(false);

      await loadContacts();
    } catch (err) {
      console.error("Failed to save contact:", err);
    }
  }

  async function removeContact(nodeId) {
    try {
      await deleteContact(nodeId);
      await loadContacts();
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  }

  const data = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={30} color={COLORS.blue} />
        </TouchableOpacity>

        <Text style={styles.title}>Contacts</Text>

        <TouchableOpacity onPress={() => setShowAdd(true)}>
          <Feather name="plus" size={26} color={COLORS.blue} />
        </TouchableOpacity>
      </View>

      <View style={styles.search}>
        <Feather name="search" size={18} color={COLORS.muted} />

        <TextInput
          placeholder="Search name or Node ID..."
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No contacts yet. Press + to add one.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contact}
            onPress={() => openChat(item.id)}
            onLongPress={() => removeContact(item.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.node}>{item.id}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: item.online ? COLORS.green : COLORS.muted,
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

      {showAdd && (
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>Add Contact</Text>

            <Text style={styles.label}>Node ID</Text>
            <TextInput
              placeholder="SBX-482731"
              placeholderTextColor={COLORS.muted}
              style={styles.field}
              value={newNodeId}
              onChangeText={(text) => setNewNodeId(formatNodeId(text))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Display Name</Text>
            <TextInput
              placeholder="Optional"
              placeholderTextColor={COLORS.muted}
              style={styles.field}
              value={newName}
              onChangeText={setNewName}
            />

            <TouchableOpacity style={styles.addBtn} onPress={addContact}>
              <Text style={styles.addBtnText}>Save Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAdd(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              Long press a contact to delete it.
            </Text>
          </Pressable>
        </Pressable>
      )}
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

  empty: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 40,
    lineHeight: 22,
  },

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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },

  handle: {
    width: 46,
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.muted,
    opacity: 0.6,
    alignSelf: "center",
    marginBottom: 16,
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 18,
  },

  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  field: {
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  addBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  addBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  cancelBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "700",
  },

  hint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});