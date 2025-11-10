import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./globals.css";

function RootLayoutNav() {
  const { user } = useAuth();
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        {!user ? (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}