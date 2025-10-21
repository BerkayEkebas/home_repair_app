import { images } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, logout } = useAuth();
  const [roomData, setRoomData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    fetchRoomStatus();
  }, [user]);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("user_id");
      const userRole = await AsyncStorage.getItem("role");

      if (!userId) {
        setError("Kullanıcı ID bulunamadı (AsyncStorage boş)");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://home-repair-api.onrender.com/api/room/getRoomStatus/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Veri alınamadı");
      }

      setRoomData(data);
    } catch (err: any) {
      console.error("Fetch hatası:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchRoomStatus}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Try Again</Text>
        </TouchableOpacity>
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (<>
    <View style={styles.container}>
      <Image source={images.bg} style={styles.bg} />

      {/* Çıkış Butonu */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>Dorm Environment Status</Text>

        {roomData.map((room, index) => (
          <View key={index} style={styles.mainCard}>

            {/* Smart Outlet Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Smart outlet</Text>
              <Text style={styles.powerLimit}>(MAX 3KW)</Text>
              <View style={styles.powerUsageContainer}>
                <Text style={styles.powerLabel}>Power Usage:</Text>
                <Text style={styles.powerValue}>{room.power_consumption}W</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Windows open AC On Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Windows open AC On</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>온도:</Text>
                  <Text style={styles.statusValue}>{room.temperature}°C</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>AC:</Text>
                  <Text style={[styles.statusValue,
                  room.ac_status === 'ON' ? styles.statusOn : styles.statusOff]}>
                    {room.ac_status}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>습도:</Text>
                  <Text style={styles.statusValue}>{room.humidity}%</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>WD:</Text>
                  <Text style={styles.statusValue}>{room.window_status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Room Vacant Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Room Vacant (30Min limit)</Text>
              <View style={styles.vacancyTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Detect</Text>
                  <Text style={styles.tableHeaderText}>left</Text>
                  <Text style={styles.tableHeaderText}>Power</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>12:10</Text>
                  <Text style={styles.tableCell}>20</Text>
                  <Text style={[styles.tableCell, styles.powerOn]}>ON</Text>
                </View>
              </View>
            </View>

            {/* Last Updated */}
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(room.last_updated).toLocaleString('en-US')}
            </Text>

          </View>
        ))}
      </ScrollView>
    </View>
  </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  bg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
    opacity: 0.2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1120",
    padding: 20,
  },
  retryBtn: {
    marginTop: 15,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  logoutContainer: {
    alignItems: "flex-end",
    marginTop: 40,
    marginRight: 24,
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  scrollContent: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  mainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  powerLimit: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 10,
  },
  powerUsageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  powerLabel: {
    color: "#9ca3af",
    fontSize: 16,
  },
  powerValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  statusLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
  },
  statusValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusOn: {
    color: "#22c55e",
  },
  statusOff: {
    color: "#ef4444",
  },
  vacancyTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableHeaderText: {
    flex: 1,
    color: "#9ca3af",
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tableCell: {
    flex: 1,
    color: "#fff",
    textAlign: 'center',
    fontWeight: 'bold',
  },
  powerOn: {
    color: "#22c55e",
  },
  lastUpdated: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});