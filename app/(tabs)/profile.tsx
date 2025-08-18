import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const PROJECT_ID = "68a22031001c9325eb21"
const ENDPOINT = "https://fra.cloud.appwrite.io/v1"

const Profile: React.FC = () => {
  const handlePing = async () => {
    try {
      const response = await fetch(`${ENDPOINT}/health/ping`, {
        method: "GET",
        headers: {
          "X-Appwrite-Project": PROJECT_ID,
        },
      })

      if (response.ok) {
        Alert.alert("✅ Ping başarılı")
      } else {
        Alert.alert("❌ Ping başarısız", `Status: ${response.status}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata"
      Alert.alert("⚠️ Hata", errorMessage)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePing} style={styles.button}>
        <Text style={styles.buttonText}>Ping Appwrite</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b", // bg-primary yerine koydum
  },
  button: {
    backgroundColor: "#3b82f6", // Tailwind'de bg-blue-500
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
