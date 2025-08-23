import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { createHomeValues } from "@/services/appwrite";
import React, { useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const HomeValuesInput = () => {
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!temp.trim() || !humidity.trim()) {
      Alert.alert("⚠️ Error ");
      return;
    }

    setLoading(true);
    try {
      const response = await createHomeValues(Number(temp), Number(humidity));
      Alert.alert("✅ Success", `New values added successfully!\nTemp: ${temp}, Humidity: ${humidity}`);
      console.log("📌 Values:", response);

      setTemp("");
      setHumidity("");
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary px-5">
      {/* Background */}
      <Image source={images.bg} className="absolute w-full h-full" resizeMode="cover" />

      {/* Logo */}
      <View className="items-center mt-20 mb-10">
        <Image source={icons.logo} className="w-16 h-14" />
      </View>

      {/* Title */}
      <Text className="text-white text-xl font-bold text-center mb-8">
        Enter Home Values
      </Text>

      {/* Temp Input */}
      <TextInput
        placeholder="Temperature"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={temp}
        onChangeText={setTemp}
        className="bg-white/10 text-white rounded-xl p-4 mb-5"
      />

      {/* Humidity Input */}
      <TextInput
        placeholder="Humidity"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={humidity}
        onChangeText={setHumidity}
        className="bg-white/10 text-white rounded-xl p-4 mb-5"
      />

      {/* Send Button */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={loading}
        className="bg-blue-500 rounded-xl py-4 mt-5"
      >
        <Text className="text-center text-white text-lg font-semibold">
          {loading ? "Sending..." : "Send"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeValuesInput;
