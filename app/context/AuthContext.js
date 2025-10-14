import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uygulama açıldığında localdeki kullanıcıyı yükle
  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "https://home-repair-api.onrender.com/api/auth/login",
        { email, password }
      );

      const { user, role, user_id } = res.data;

      // Local kaydet
      await AsyncStorage.setItem("user_id", JSON.stringify(user_id));
      await AsyncStorage.setItem("role", JSON.stringify(role));
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      // Rol bazlı yönlendirme
      if (role === "customer") {
        router.replace("/(tabs)");
      } else if (role === "expert") {
        router.replace("/(tabs)");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.log("Giriş hatası:", error.response?.data || error.message);
      throw new Error("Giriş başarısız. Bilgileri kontrol ediniz.");
    }
  };

  const logout = async () => {
    try {
      await axios.post("https://home-repair-api.onrender.com/api/auth/logout");

      await AsyncStorage.multiRemove(["role", "user", "user_id"]);

      setUser(null);
      router.replace("/login");
    } catch (err) {
      console.log("Çıkış hatası:", err);
    }
  };

  if (loading) {
    // Burada isterseniz bir loading spinner gösterebilirsiniz
    return null;
  }
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
