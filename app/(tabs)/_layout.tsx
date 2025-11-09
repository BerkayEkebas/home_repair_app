import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Text, View } from 'react-native';

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden">
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-4">{title}</Text>
      </ImageBackground>
    );
  } else {
    return (
      <View className="size-full justify-center items-center mt-4 rounded-full">
        <Image source={icon} tintColor="#A8B5DB" className="size-5" />
      </View>
    );
  }
};

const _layout = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const role = await AsyncStorage.getItem("role");
        setUserRole(role?.replace(/"/g, "") || null);
      } catch (err) {
        console.error("Rol alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  // Eğer hala loading ise veya rol bilgisi yoksa boş screen döndür
  if (loading) {
    return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarItemStyle: {
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarStyle: {
            backgroundColor: "#0f0D23",
            borderRadius: 50,
            marginHorizontal: 20,
            marginBottom: 36,
            height: 52,
            position: "absolute",
            overflow: "hidden",
            borderColor: "#0f0D23",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarButton: () => null, // Gizle
          }}
        />
        <Tabs.Screen
          name="adminDashboard"
          options={{
            title: "Admin",
            headerShown: false,
            tabBarButton: () => null, // Gizle
          }}
        />
        <Tabs.Screen
          name="mypage"
          options={{
            title: "My Page",
            headerShown: false,
            tabBarButton: () => null, // Gizle
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderColor: "#0f0D23",
        },
      }}
    >
      {/* Her zaman gösterilecek tab'lar */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      {/* Sadece admin kullanıcılar için Admin Dashboard */}
      {userRole === "admin" && (
        <Tabs.Screen
          name="adminDashboard"
          options={{
            title: "Admin",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.star} title="Admin" />
            ),
          }}
        />
      )}

      {/* Her zaman gösterilecek tab'lar */}
      <Tabs.Screen
        name="mypage"
        options={{
          title: "My Page",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="My Page" />
          ),
        }}
      />

      {/* Admin değilse adminDashboard'u tamamen gizle */}
      {userRole !== "admin" && (
        <Tabs.Screen
          name="adminDashboard"
          options={{
            title: "Admin",
            headerShown: false,
            tabBarButton: () => null, // Tab bar'da gösterme
          }}
        />
      )}
    </Tabs>
  );
};

export default _layout;