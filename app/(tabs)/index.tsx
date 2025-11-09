import { images } from "@/constants/images";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

// Type Definitions
interface RoomData {
  danger_status_ai: number;
  power_consumption: number;
  temperature: number;
  ac_status: string;
  humidity: number;
  window_status: string;
  building_name: string;
  floor_number: number;
  room_number: string;
  room_capacity: number;
  occupant_count: number;
  occupants?: string;
  last_updated: string;
}

interface Translations {
  [key: string]: {
    title: string;
    environmentStatus: string;
    roomInfo: string;
    occupantInfo: string;
    loading: string;
    error: string;
    retry: string;
    logout: string;
    smartOutlet: string;
    powerUsage: string;
    windowAc: string;
    temperature: string;
    ac: string;
    humidity: string;
    window: string;
    roomVacancy: string;
    detect: string;
    timeLeft: string;
    power: string;
    buildingName: string;
    location: string;
    roomInfoDetail: string;
    roomNumber: string;
    capacity: string;
    currentOccupants: string;
    lastUpdate: string;
    totalOccupants: string;
    currentStudents: string;
    noStudents: string;
    noData: string;
    floor: string;
    people: string;
    on: string;
    off: string;
    open: string;
    closed: string;
    korean: string;
    english: string;
    selectLanguage: string;
  };
}

export default function Index() {
  const { user, logout } = useAuth();
  const [roomData, setRoomData] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [language, setLanguage] = useState<'korean' | 'english'>('korean');
  const [languageModal, setLanguageModal] = useState<boolean>(false);

  // Dil çevirileri
  const translations: Translations = {
    korean: {
      title: '기숙사 환경 상태',
      environmentStatus: '환경 상태',
      roomInfo: '방 정보',
      occupantInfo: '거주자 정보',
      loading: '데이터 로딩 중...',
      error: '데이터를 가져올 수 없습니다',
      retry: '다시 시도',
      logout: '로그아웃',
      smartOutlet: '스마트 콘센트',
      powerUsage: '전력 사용량:',
      windowAc: '창문 열림 / 에어컨 켜짐',
      temperature: '온도:',
      ac: '에어컨:',
      humidity: '습도:',
      window: '창문:',
      roomVacancy: '빈 방 (30분 제한)',
      detect: '감지',
      timeLeft: '남은 시간',
      power: '전력',
      buildingName: '건물 이름',
      location: '위치 정보',
      roomInfoDetail: '방 정보',
      roomNumber: '방 번호',
      capacity: '정원',
      currentOccupants: '현재 거주 인원',
      lastUpdate: '마지막 업데이트',
      totalOccupants: '총 거주자 수',
      currentStudents: '현재 거주 중인 학생들:',
      noStudents: '현재 이 방에 거주 중인 학생이 없습니다.',
      noData: '표시할 방 데이터가 없습니다.',
      floor: '층',
      people: '명',
      on: 'ON',
      off: 'OFF',
      open: 'OPEN',
      closed: 'CLOSED',
      korean: '한국어',
      english: 'English',
      selectLanguage: '언어 선택'
    },
    english: {
      title: 'Dorm Environment Status',
      environmentStatus: 'Environment Status',
      roomInfo: 'Room Information',
      occupantInfo: 'Occupant Information',
      loading: 'Loading data...',
      error: 'Failed to fetch data',
      retry: 'Try Again',
      logout: 'Logout',
      smartOutlet: 'Smart Outlet',
      powerUsage: 'Power Usage:',
      windowAc: 'Windows Open / AC On',
      temperature: 'Temperature:',
      ac: 'AC:',
      humidity: 'Humidity:',
      window: 'Window:',
      roomVacancy: 'Room Vacant (30Min limit)',
      detect: 'Detect',
      timeLeft: 'Time Left',
      power: 'Power',
      buildingName: 'Building Name',
      location: 'Location',
      roomInfoDetail: 'Room Information',
      roomNumber: 'Room Number',
      capacity: 'Capacity',
      currentOccupants: 'Current Occupants',
      lastUpdate: 'Last Updated',
      totalOccupants: 'Total Occupants',
      currentStudents: 'Currently residing students:',
      noStudents: 'No students currently residing in this room.',
      noData: 'No room data to display.',
      floor: 'Floor',
      people: 'people',
      on: 'ON',
      off: 'OFF',
      open: 'OPEN',
      closed: 'CLOSED',
      korean: 'Korean',
      english: 'English',
      selectLanguage: 'Select Language'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    fetchRoomStatus();
  }, [user]);

  const fetchRoomStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        setError(t.error);
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
        throw new Error(data.message || t.error);
      }

      setRoomData(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      console.error("Fetch hatası:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (): void => {
    Alert.alert(
      t.logout,
      language === 'korean' ? '정말 로그아웃 하시겠습니까?' : 'Are you sure you want to logout?',
      [
        { text: language === 'korean' ? '취소' : 'Cancel', style: 'cancel' },
        { text: t.logout, onPress: logout, style: 'destructive' }
      ]
    );
  };

  const getDangerStyle = (room: RoomData, dangerType: number) => {
    if (room.danger_status_ai === dangerType) {
      return { backgroundColor: 'rgba(239, 68, 68, 0.3)' };
    }
    return {};
  };

  const renderTabContent = (room: RoomData): JSX.Element => {
    switch (tabValue) {
      case 0: // Environment Status
        return (
          <View>
            {/* AI Danger Status */}
            <View style={[styles.aiStatusContainer, getDangerStyle(room, 1)]}>
              <Text style={styles.aiStatusText}>AI 🤖</Text>
              <View style={[
                styles.dangerIndicator,
                room.danger_status_ai > 0 ? styles.dangerActive : styles.dangerInactive
              ]}>
                <Text style={styles.dangerText}>
                  {room.danger_status_ai > 0 ? '⚠️ DANGER' : '✅ SAFE'}
                </Text>
              </View>
            </View>

            {/* Smart Outlet Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="power" size={20} color="#fff" />
                <Text style={styles.sectionTitle}>{t.smartOutlet}</Text>
              </View>
              <Text style={styles.powerLimit}>(MAX 3KW)</Text>
              <View style={[styles.powerUsageContainer, getDangerStyle(room, 1)]}>
                <Text style={styles.powerLabel}>{t.powerUsage}</Text>
                <Text style={styles.powerValue}>{room.power_consumption || 0}W</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Environment Status Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="ac-unit" size={20} color="#fff" />
                <Text style={styles.sectionTitle}>{t.windowAc}</Text>
              </View>

              <View style={styles.statusGrid}>
                <View style={[styles.statusItem, getDangerStyle(room, 3)]}>
                  <Text style={styles.statusLabel}>{t.temperature}</Text>
                  <Text style={styles.statusValue}>{room.temperature || "N/A"}°C</Text>
                </View>
                <View style={[styles.statusItem, getDangerStyle(room, 2)]}>
                  <Text style={styles.statusLabel}>{t.ac}</Text>
                  <Text style={[
                    styles.statusValue,
                    room.ac_status === "ON" ? styles.statusOn : styles.statusOff
                  ]}>
                    {room.ac_status === "ON" ? t.on : t.off}
                  </Text>
                </View>
                <View style={[styles.statusItem, getDangerStyle(room, 3)]}>
                  <Text style={styles.statusLabel}>{t.humidity}</Text>
                  <Text style={styles.statusValue}>{room.humidity || "N/A"}%</Text>
                </View>
                <View style={[styles.statusItem, getDangerStyle(room, 2)]}>
                  <Text style={styles.statusLabel}>{t.window}</Text>
                  <View style={styles.windowStatus}>
                    <MaterialIcons name="window" size={16} color="#fff" />
                    <Text style={styles.statusValue}>
                      {room.window_status === "OPEN" ? t.open : t.closed}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Room Vacancy Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="schedule" size={20} color="#fff" />
                <Text style={styles.sectionTitle}>{t.roomVacancy}</Text>
              </View>

              <View style={[styles.vacancyTable, getDangerStyle(room, 4)]}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>{t.detect}</Text>
                  <Text style={styles.tableHeaderText}>{t.timeLeft}</Text>
                  <Text style={styles.tableHeaderText}>{t.power}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>12:10</Text>
                  <Text style={styles.tableCell}>20</Text>
                  <Text style={[styles.tableCell, styles.powerOn]}>{t.on}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 1: // Room Information
        return (
          <View>
            <Text style={styles.tabTitle}>{t.roomInfoDetail}</Text>

            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <MaterialIcons name="home" size={24} color="#00BFFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t.buildingName}</Text>
                  <Text style={styles.infoValue}>{room.building_name || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={24} color="#22c55e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t.location}</Text>
                  <Text style={styles.infoValue}>
                    {room.floor_number ? `${room.floor_number}${language === 'korean' ? '층' : ` ${t.floor}`}` : "N/A"} • {room.room_number || "N/A"}{language === 'korean' ? '호' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="numbers" size={24} color="#eab308" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t.roomInfoDetail}</Text>
                  <Text style={styles.infoValue}>
                    {t.roomNumber}: {room.room_number || "N/A"} • {t.capacity}: {room.room_capacity || "N/A"}{language === 'korean' ? '명' : ` ${t.people}`}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#8b5cf6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t.currentOccupants}</Text>
                  <Text style={styles.infoValue}>
                    {room.occupant_count || 0} / {room.room_capacity || "N/A"} {language === 'korean' ? '명' : t.people}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="update" size={24} color="#f97316" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t.lastUpdate}</Text>
                  <Text style={styles.infoValue}>
                    {room.last_updated ? new Date(room.last_updated).toLocaleString(language === 'korean' ? 'ko-KR' : 'en-US') : "Unknown"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 2: // Occupant Information
        return (
          <View>
            <Text style={styles.tabTitle}>{t.occupantInfo}</Text>

            {room.occupants ? (
              <View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#8b5cf6" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t.totalOccupants}</Text>
                    <Text style={styles.infoValue}>
                      {room.occupant_count || 0}{language === 'korean' ? '명' : ` ${t.people}`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.occupantsTitle}>{t.currentStudents}</Text>

                <View style={styles.occupantsContainer}>
                  {room.occupants.split(',').map((occupant: string, idx: number) => (
                    <View key={idx} style={styles.occupantChip}>
                      <Text style={styles.occupantText}>{occupant.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noOccupants}>
                <MaterialCommunityIcons name="account-group" size={48} color="#6b7280" />
                <Text style={styles.noOccupantsText}>{t.noStudents}</Text>
              </View>
            )}
          </View>
        );

      default:
        return <View />;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchRoomStatus}>
          <Text style={styles.retryText}>{t.retry}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={images.bg} style={styles.bg} />

      {/* Header with Language Selector */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setLanguageModal(true)}
        >
          <MaterialIcons name="language" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>{t.title}</Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[t.environmentStatus, t.roomInfo, t.occupantInfo].map((tab: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                tabValue === index && styles.activeTab
              ]}
              onPress={() => setTabValue(index)}
            >
              <Text style={[
                styles.tabText,
                tabValue === index && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {roomData.map((room: RoomData, index: number) => (
          <View key={index} style={styles.mainCard}>
            {renderTabContent(room)}

            {/* Last Updated */}
            <Text style={styles.lastUpdated}>
              {t.lastUpdate}: {room.last_updated ? new Date(room.last_updated).toLocaleString(language === 'korean' ? 'ko-KR' : 'en-US') : "Unknown"}
            </Text>
          </View>
        ))}

        {roomData.length === 0 && (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>{t.noData}</Text>
          </View>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
            {(['korean', 'english'] as const).map((lang: 'korean' | 'english') => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageOption,
                  language === lang && styles.selectedLanguage
                ]}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModal(false);
                }}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === lang && styles.selectedLanguageText
                ]}>
                  {t[lang]}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>
                {language === 'korean' ? '취소' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#00BFFF',
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeTabText: {
    color: '#fff',
  },
  mainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  aiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  aiStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dangerActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerInactive: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  dangerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
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
    justifyContent: 'space-between',
    width: '48%',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusLabel: {
    color: "#9ca3af",
    fontSize: 14,
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
  windowStatus: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingVertical: 12,
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
  tabTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  occupantsTitle: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  occupantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occupantChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  occupantText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noOccupants: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noOccupantsText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  lastUpdated: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  retryBtn: {
    marginTop: 15,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedLanguage: {
    backgroundColor: '#00BFFF',
  },
  languageOptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
  },
  modalClose: {
    marginTop: 10,
    paddingVertical: 12,
  },
  modalCloseText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 16,
  },
});