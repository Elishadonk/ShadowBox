import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Colors from "../theme/colors";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⬢</Text>

      <Text style={styles.title}>SHADOW BOX</Text>

      <Text style={styles.subtitle}>
        Secure Mesh Network
      </Text>

      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{ marginTop: 40 }}
      />

      <Text style={styles.loading}>
        Initializing...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    fontSize: 80,
    color: Colors.primary,
    marginBottom: 15,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: 2,
  },

  subtitle: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 16,
  },

  loading: {
    marginTop: 20,
    color: Colors.muted,
    fontSize: 14,
  },
});