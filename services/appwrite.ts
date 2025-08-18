import { Client, Databases, ID } from "react-native-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68a22031001c9325eb21");

const databases = new Databases(client);

const databaseId = "68a26a86000587406155"; 
const collectionId = "68a26acf0025bba6af00"; 




export async function getHomeValues() {
  try {
    const response = await fetch(
      "https://fra.cloud.appwrite.io/v1/databases/68a26a86000587406155/collections/68a26acf0025bba6af00/documents",
      {
        method: "GET",
        headers: {
          "X-Appwrite-Project": "68a22031001c9325eb21", // Project ID
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Appwrite GET response:", data);
    return data.documents;
  } catch (error) {
    console.error("❌ getHomeValues hata:", error);
    throw error;
  }
}


export async function createHomeValues(temp:any, humidity:any) {
  try {
    console.log("📌 Yeni değer ekleniyor:", { temp, humidity });

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // otomatik benzersiz ID
      {
        temp: temp,
        humidity: humidity,
      }
    );

    console.log("✅ New values added", response);
    return response;
  } catch (error) {
    console.error("❌ createHomeValues error:", error);
    throw error;
  }
}
