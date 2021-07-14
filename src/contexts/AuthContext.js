import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { api } from "../services/api";
import jwt_decode from "jwt-decode"


export const AuthContext = createContext({
    user: {},
    setUser({ email, name, nickname, cpf }) {},
    token: "",
    loading: false,
    signIn({ email, senha }) {},
    signOut() {},
  });

  export function AuthProvider({ children }) {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");
  
    useEffect(() => {
      async function loadStoragedData() {
        const [storagedUser, storagedToken] = await AsyncStorage.multiGet([
          "@Mindeducation:user",
          "@Mindeducation:token",
        ]);
  
        if (storagedToken[1] && storagedUser[1]) {
          api.defaults.headers.authorization = `Bearer ${storagedToken[1]}`;
          setUser(JSON.parse(storagedUser[1]));
        }
  
        setLoading(false);
      }
      loadStoragedData();
    }, []);
  
    const signIn = useCallback(async ({ email, senha }) => {

      const response = await api.post("/users/login", { email, password: senha });
  
      api.defaults.headers.authorization = `Bearer ${response.data.token}`;

      setToken(response.data.token);

      const headers = { headers: { Authorization: response.data.token } }

      const profile = await api.get(`/users/profile/${jwt_decode(response.data.token).id}`, headers)
      
      setUser(profile.data.user);
      try {
        await AsyncStorage.setItem(
          "@Mindeducation:user",
          JSON.stringify(profile.data.user)
        );
        await AsyncStorage.setItem(
          "@Mindeducation:token",
          JSON.stringify(response.data.token)
        );
      } catch {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Erro",
          text2:
            "Não foi possível salvar alguma informação, tente relogar no app.",
        });
      }
      return response.data.token;
    }, []);
  
    const signOut = useCallback(async () => {

      try {
        await AsyncStorage.removeItem("@Mindeducation:user");
        await AsyncStorage.removeItem("@Mindeducation:token");
  
        setUser();
      } catch {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Erro",
          text2: "Não foi possível remover alguma informação.",
        });
      }
    }, []);
  
    return (
      <AuthContext.Provider
        value={{ user, token, loading, signIn, signOut, setUser }}
      >
        {children}
      </AuthContext.Provider>
    );
  }