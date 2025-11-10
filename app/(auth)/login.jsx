import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("ko"); // "ko" or "en"

  const t = {
    ko: {
      systemTitle: "기숙사 관리 시스템",
      title: "로그인",
      email: "이메일",
      password: "비밀번호",
      login: "로그인",
      error: "로그인에 실패했습니다. 정보를 다시 확인해주세요.",
      switchLang: "English",
    },
    en: {
      systemTitle: "Dorm Management System",
      title: "Login",
      email: "Email",
      password: "Password",
      login: "Sign In",
      error: "Login failed. Please check your credentials.",
      switchLang: "한국어",
    },
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(t[language].error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.langSwitch}
        onPress={() => setLanguage(language === "ko" ? "en" : "ko")}
      >
        <Text style={styles.switch}>{t[language].switchLang}</Text>
      </TouchableOpacity>

      <Text style={styles.systemTitle}>{t[language].systemTitle}</Text>
      <Text style={styles.title}>{t[language].title}</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder={t[language].email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder={t[language].password}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t[language].login}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#f5f9fc" },
  langSwitch: { alignSelf: "flex-end", marginBottom: 16 },
  switch: { fontSize: 14, color: "#23c0e9" },
  systemTitle: { fontSize: 28, fontWeight: "700", color: "#1a1a1a", marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "500", color: "#444", marginBottom: 24 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#23c0e9",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
});
