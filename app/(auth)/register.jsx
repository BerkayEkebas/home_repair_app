import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("https://home-repair-api.onrender.com/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      Alert.alert("Kayıt Başarılı", "Hesabınız başarıyla oluşturuldu!");
      router.push("/login");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data || "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      {/* Rol seçimi */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "customer" && styles.selectedRole]}
          onPress={() => setRole("customer")}
        >
          <Text style={[styles.roleText, role === "customer" && styles.selectedRoleText]}>
            회원가입
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "expert" && styles.selectedRole]}
          onPress={() => setRole("expert")}
        >
          <Text style={[styles.roleText, role === "expert" && styles.selectedRoleText]}>
            전문가 가입
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="성명"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>등록</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Zaten üye misiniz? Giriş Yapın</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#23c0e9",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "red", marginBottom: 12, textAlign: "center" },
  link: { textAlign: "center", marginTop: 16, color: "#23c0e9" },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#23c0e9",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#23c0e9",
  },
  roleText: {
    color: "#23c0e9",
    fontWeight: "500",
  },
  selectedRoleText: {
    color: "#fff",
  },
});
