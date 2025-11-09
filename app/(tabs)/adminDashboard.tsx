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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [allRoomsData, setAllRoomsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    fetchAllRoomsStatus();
  }, [user]);

  const fetchAllRoomsStatus = async () => {
    const userRole = await AsyncStorage.getItem("role");
    if (userRole === "admin") {
      setStatus(true);
    }else{
        setStatus(false);
    }
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        setError("Kullanıcı ID bulunamadı");
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

      setAllRoomsData(data);
    } catch (err: any) {
      console.error("Fetch hatası:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  const RoomCard = ({ room }: { room: any }) => (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => setSelectedRoom(room)}
    >
      <Text style={styles.roomNumber}>ROOM {room.room_id}</Text>
      
      <View style={styles.roomStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🌡️</Text>
          <Text style={styles.statValue}>{room.temperature}°C</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>💧</Text>
          <Text style={styles.statValue}>{room.humidity}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>⚡</Text>
          <Text style={styles.statValue}>{room.power_consumption}W</Text>
        </View>
      </View>

      <View style={styles.statusIndicators}>
        <View style={[
          styles.statusIndicator, 
          room.ac_status === 'ON' ? styles.statusOn : styles.statusOff
        ]}>
          <Text style={styles.statusText}>AC</Text>
        </View>
        <View style={[
          styles.statusIndicator, 
          room.window_status === 'OPEN' ? styles.statusOn : styles.statusOff
        ]}>
          <Text style={styles.statusText}>WD</Text>
        </View>
        <View style={[
          styles.statusIndicator, 
          room.room_occupancy === 'OCCUPIED' ? styles.occupied : styles.vacant
        ]}>
          <Text style={styles.statusText}>
            {room.room_occupancy === 'OCCUPIED' ? 'OCCUPIED' : 'VACIANT'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RoomDetailModal = ({ room, onClose }: { room: any, onClose: () => void }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>ODA {room.room_id} Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>

        {/* Student dashboard'daki detay tasarımını buraya kopyala */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart outlet</Text>
          <Text style={styles.powerLimit}>(MAX 3KW)</Text>
          <View style={styles.powerUsageContainer}>
            <Text style={styles.powerLabel}>Power Usage:</Text>
            <Text style={styles.powerValue}>{room.power_consumption}W</Text>
          </View>
        </View>

        <View style={styles.divider} />

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
              <Text style={[styles.tableCell]}>ON</Text>
            </View>
          </View>
        </View>

        <Text style={styles.lastUpdated}>
          Last updated: {new Date(room.last_updated).toLocaleString('en-US')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchAllRoomsStatus}>
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

  return (
    <View style={styles.container}>
      <Image source={images.bg} style={styles.bg} />

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>Admin Dashboard - All Rooms</Text>
        <Text style={styles.subTitle}>All {allRoomsData.length} rooms</Text>

        <View style={styles.roomsGrid}>
          {allRoomsData.map((room, index) => (
            <RoomCard key={index} room={room} />
          ))}
        </View>
      </ScrollView>

      {selectedRoom && (
        <RoomDetailModal 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
    </View>
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
    marginBottom: 5,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 20,
    textAlign: "center",
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
    width: '48%',
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  roomNumber: {
    fontSize: 16,
    color: "#60a5fa",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  roomStats: {
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  statValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusOn: {
    backgroundColor: "#22c55e",
  },
  statusOff: {
    backgroundColor: "#ef4444",
  },
  occupied: {
    backgroundColor: "#3b82f6",
  },
  vacant: {
    backgroundColor: "#6b7280",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ef4444",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Student dashboard'dan kopyalanan stiller
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
  lastUpdated: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});