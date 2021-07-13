import React, { useState } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/core";
import * as Yup from "yup";
import jwt_decode from "jwt-decode"
import { validateCPF } from "validations-br";

import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

import { useAuth } from "../../hooks/useAuth";

import { Container, Title, BackButtonText } from "./styles";
import { api } from "../../services/api";
import { Keyboard } from "react-native";

export function EditProfile() {

  const { user } = useAuth();
  const [id, setId] = useState(jwt_decode(user).id);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [nickname, setNickname] = useState("");
  const [cpf, setCpf] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const navigation = useNavigation();

  async function handleUpdateUser() {

    try {

      setValidationErrors({});

      const schema = Yup.object().shape({
        nome: Yup.string()
          .required("Nome obrigatório")
          .min(3, "Nome muito curto"),
        email: Yup.string()
          .required("Email obrigatório")
          .email("O email precisa ser válido"),
        nickname: Yup.string()
        .required("Apelido obrigatório")
        .min(3, "Apelido muito curto"),
        cpf: Yup.string()
            .required("CPF obrigatório")
            .test("isCpf", "CPF inválido", (value) => validateCPF(String(value))),
      });

      let data = { nome, email, nickname, cpf };

      await schema.validate(data, { abortEarly: false });

      const headers = { headers: { Authorization: user } }

      await api.put(`/users/edit/info/${id}`, {...data, name: nome}, headers);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Perfil atualizado!",
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
        text2: "Não foi possivel atualizar o perfil",
      });
    }
  }

  return (
    <Container>
      <Title>Editar perfil</Title>

      <Input
        placeholder="E-mail"
        keyboardType="email-address"
        selectTextOnFocus
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCompleteType="email"
        error={!!validationErrors["email"]}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <Input
        placeholder="Nome"
        selectTextOnFocus
        textContentType="name"
        autoCapitalize="words"
        autoCompleteType="name"
        error={!!validationErrors["nome"]}
        value={nome}
        onChangeText={(text) => setNome(text)}
      />

      <Input
        placeholder="Apelido"
        selectTextOnFocus
        textContentType="name"
        autoCapitalize="words"
        autoCompleteType="name"
        error={!!validationErrors["Nickname"]}
        value={nickname}
        onChangeText={(text) => setNickname(text)}
      />

    <Input
        placeholder="CPF"
        keyboardType="numeric"
        selectTextOnFocus
        autoCapitalize="none"
        error={!!validationErrors["cpf"]}
        value={cpf}
        onChangeText={(text) => setCpf(text)}
      />


      <Button onPress={handleUpdateUser}>Salvar</Button>

      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <BackButtonText>Voltar</BackButtonText>
      </TouchableWithoutFeedback>
    </Container>
  );
}