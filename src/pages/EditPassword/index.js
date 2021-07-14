import React, { useState } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/core";
import { Ionicons } from "@expo/vector-icons";
import * as Yup from "yup";
import jwt_decode from "jwt-decode"

import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

import { useAuth } from "../../hooks/useAuth";

import { Container, Title, BackButtonText } from "./styles";
import { api } from "../../services/api";
import { Keyboard } from "react-native";

export function EditPassword() {
    
  const { user } = useAuth();

  const [antigaSenha, setAntigaSenha] = useState("");
  const [id, setId] = useState(jwt_decode(user).id);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigation = useNavigation();

  async function handleUpdateUser() {

    try {
      setValidationErrors({});

      const schema = Yup.object().shape({
        antigaSenha: Yup.string(),
        senha: Yup.string(),
        confirmarSenha: Yup.string()
          .when("senha", {
            is: (value) => !!value.length,
            then: Yup.string().required("Confirmação da senha é obrigatória"),
            otherwise: Yup.string(),
          })
          .oneOf(
            [Yup.ref("senha"), undefined],
            "As senhas precisam ser iguais"
          ),
      });

      let data = { antigaSenha, senha, confirmarSenha };

      await schema.validate(data, { abortEarly: false });

      const headers = { headers: { Authorization: user } }
      
      await api.put(`/users/edit/password/${id}`, 
      {...data, password: antigaSenha, newPassword: senha}, headers);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Senha atualizada!",
      });

      Keyboard.dismiss();
      navigation.goBack();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          setValidationErrors((state) => {
            return {
              ...state,
              [error.path || ""]: error.message,
            };
          });
        });

        return Toast.show({
          type: "error",
          text1: "Erro",
          text2: err.inner[0].message,
        });
      }

      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possivel atualizar a senha",
      });
    }
  }

  return (
    <Container>
      <Title>Editar senha</Title>

      <Input
        placeholder="Senha Antiga"
        textContentType="password"
        selectTextOnFocus
        secureTextEntry={!showOldPassword}
        error={!!validationErrors["antigaSenha"]}
        value={antigaSenha}
        onChangeText={(text) => setAntigaSenha(text)}
      >
        <TouchableWithoutFeedback
          onPress={() => setShowOldPassword((state) => !state)}
        >
          {showOldPassword ? (
            <Ionicons name="eye-off" color="rgba(3, 1, 76, 0.2)" size={24} />
          ) : (
            <Ionicons name="eye" color="rgba(3, 1, 76, 0.2)" size={24} />
          )}
        </TouchableWithoutFeedback>
      </Input>

      <Input
        placeholder="Nova Senha"
        textContentType="password"
        selectTextOnFocus
        secureTextEntry={!showPassword}
        error={!!validationErrors["senha"]}
        value={senha}
        onChangeText={(text) => setSenha(text)}
      >
        <TouchableWithoutFeedback
          onPress={() => setShowPassword((state) => !state)}
        >
          {showPassword ? (
            <Ionicons name="eye-off" color="rgba(3, 1, 76, 0.2)" size={24} />
          ) : (
            <Ionicons name="eye" color="rgba(3, 1, 76, 0.2)" size={24} />
          )}
        </TouchableWithoutFeedback>
      </Input>

      <Input
        placeholder="Confirmar Nova Senha"
        textContentType="password"
        selectTextOnFocus
        secureTextEntry={!showPasswordConfirmation}
        error={!!validationErrors["confirmarSenha"]}
        value={confirmarSenha}
        onChangeText={(text) => setConfirmarSenha(text)}
      >
        <TouchableWithoutFeedback
          onPress={() => setShowPasswordConfirmation((state) => !state)}
        >
          {showPasswordConfirmation ? (
            <Ionicons name="eye-off" color="rgba(3, 1, 76, 0.2)" size={24} />
          ) : (
            <Ionicons name="eye" color="rgba(3, 1, 76, 0.2)" size={24} />
          )}
        </TouchableWithoutFeedback>
      </Input>

      <Button onPress={handleUpdateUser}>Salvar</Button>

      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <BackButtonText>Voltar</BackButtonText>
      </TouchableWithoutFeedback>
    </Container>
  );
}