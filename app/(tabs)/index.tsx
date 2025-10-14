import { icons } from "@/constants/icons"
import { images } from "@/constants/images"
import { getHomeValues } from "@/services/appwrite"
import useFetch from "@/services/useFetch"
import { router } from "expo-router"
import React, { useEffect } from "react"
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native"
import { useAuth } from "../context/AuthContext"

type HomeValue = {
  temp: number;
  humidity: number;
  $updatedAt: string;
};

interface Props {
  homeValues: HomeValue[];
}


export default function Index() {
  const { user, logout } = useAuth();
  const { data: homeValues, loading, error } = useFetch(getHomeValues)

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [user]);

  const sortedValues = (homeValues ?? []).sort(
    (a:any, b:any) => new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime()
  );

  return (
    <View className="flex-1 bg-primary">
      {/* Background */}
      <Image source={images.bg} className="absolute w-full z-0" />

      {/* Korece Çıkış Yap Butonu */}
      <View style={{ alignItems: "flex-end", marginTop: 40, marginRight: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#ef4444",
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 20,
          }}
          onPress={logout}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
            로그아웃
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-5">
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : error ? (
          <Text className="text-red-500 mt-5 text-center">
            ❌ Hata: {error.message}
          </Text>
        ) : (
          <View className=" flex-1  mt-10">
            <Text className="text-lg text-white font-bold mb-5 text-center">
              🌡️ Home Values
            </Text>

            <FlatList
              data={sortedValues}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="bg-white/10 rounded-xl p-4 mb-3">
                  <Text className="text-white text-base">
                    🌡️ Temp: {item.temp}
                  </Text>
                  <Text className="text-white text-base">
                    💧 Humidity: {item.humidity} %
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    🕒 Updated At: {new Date(item.$updatedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Korece Üye Olun Butonu */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#23c0e9",
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 24,
            marginTop: 8,
          }}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            회원가입
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
