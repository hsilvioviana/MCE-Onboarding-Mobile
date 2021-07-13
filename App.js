import React from 'react';
import AppLoading from "expo-app-loading";
import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { Routes } from "./src/routes"
import { OpenSans_700Bold, OpenSans_600SemiBold, OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { AuthProvider } from './src/contexts/AuthContext';


export default function App() {

  const [fontsLoaded] = useFonts({
    OpenSans_700Bold,
    OpenSans_600SemiBold,
    OpenSans_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
  })

  if (!fontsLoaded) { return <AppLoading/>}

  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes/>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </NavigationContainer>
    </AuthProvider>
  );
}
