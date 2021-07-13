import React, { useState } from "react"
import { TouchableWithoutFeedback } from "react-native"
import { Container, Title, SubTitle, ParagraphText, ParagraphLinkText } from "./styles";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import * as Yup from "yup";
import Toast from "react-native-toast-message";


export function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigation = useNavigation();

  const { signIn } = useAuth();

  async function handleSignIn() {

    try {

      setValidationErrors({});

      const schema = Yup.object().shape({
        email: Yup.string()
          .required("Email obrigatório")
          .email("O email precisa ser válido"),
        senha: Yup.string().required("Senha obrigatória"),
      });

      const data = { email, senha };

      await schema.validate(data, { abortEarly: false });

      await signIn(data);

      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err) {

      console.log(err.response.data)

      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          setValidationErrors((state) => {
            return { ...state, [error.path || ""]: error.message };
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
        text2: "Não foi possivel entrar na sua conta",
      });
    }
  }

  return (
  <Container>
      <Title>Entrar</Title>
      <SubTitle>O seu passaporte para o Futuro!</SubTitle>

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
      placeholder="Senha"
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

    <Button onPress={handleSignIn}>Login</Button>

      <ParagraphText>
      Esqueceu a senha?{" "}
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <ParagraphLinkText>Clique aqui</ParagraphLinkText>
      </TouchableWithoutFeedback>
    </ParagraphText>

    <ParagraphText>
      Não possui uma conta?{" "}
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate("Signup")}
      >
        <ParagraphLinkText>Registrar-se</ParagraphLinkText>
      </TouchableWithoutFeedback>
    </ParagraphText>
  </Container>
  )
}