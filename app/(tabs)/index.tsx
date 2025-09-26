import { icons } from "@/constants/icons"
import { images } from "@/constants/images"
import { getHomeValues } from "@/services/appwrite"
import useFetch from "@/services/useFetch"
import React from "react"
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native"

type HomeValue = {
  temp: number;
  humidity: number;
  $updatedAt: string;
};

interface Props {
  homeValues: HomeValue[];
}

export default function Index() {
  const { data: homeValues, loading, error } = useFetch(getHomeValues)

  const sortedValues = (homeValues ?? []).sort(
    (a:any, b:any) => new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime()
  );

  return (
    <View className="flex-1 bg-primary">
      {/* Background */}
      <Image source={images.bg} className="absolute w-full z-0" />

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
              🌡️ Home Values Ahmet

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
                  <Text className="text-white text-sm text-gray-300">
                    🕒 Updated At: {new Date(item.$updatedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  )
}
