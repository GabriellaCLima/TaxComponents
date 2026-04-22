import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Link,
} from "@mui/material";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import EmailInput from "../../Components/Inputs/EmailInput";
import PasswordInput from "../../Components/Inputs/PasswordInput";
import ButtonUsage from "../../Components/ButtonUsage";
import Footer from "../../Components/Footer";
import { tokens, ColorModeContext } from "../../Tema";
import { userService } from "../../services/api";

const Register = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  // ESTADOS LOCAIS DO COMPONENTE
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailCadastradoError, setEmailCadastradoError] = useState("");
  // CONFIGURAÇÃO DO REACT-HOOK-FORM
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      profissao: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const navigate = useNavigate();

  // OBSERVAÇÃO DE CAMPOS ESPECÍFICOS
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // OBSERVAÇÃO DE TODOS OS CAMPOS PARA VALIDAÇÃO
  const watchedFields = watch();

  // VERIFICAÇÃO DE CAMPOS OBRIGATÓRIOS
  const areAllFieldsFilled =
    watchedFields.username &&
    watchedFields.profissao &&
    watchedFields.email &&
    watchedFields.password &&
    watchedFields.confirmPassword;

  const watchedEmail = watch("email");

  // Use useEffect para limpar o erro quando o email mudar
  useEffect(() => {
      setEmailCadastradoError("");  
  }, []);

  // CONTROLE DE ESTADO DO BOTÃO
  const isButtonDisabled = !areAllFieldsFilled;

  // MENSAGENS DE ERRO CONDICIONAIS
  const errorName = errors.username ? errors.username.message : "";
  const errorProfissao = errors.profissao ? errors.profissao.message : "";

  const hasError = !!errors.username;

  // HANDLER PARA MUDANÇA DE PROFISSÃO
  const handleProfissaoChange = (event) => {
    setValue("profissao", event.target.value, { shouldValidate: true });
  };

  // SUBMISSÃO DO FORMULÁRIO

 const onSubmit = async (data) => {
  // VALIDAÇÃO DE CONFIRMAÇÃO DE SENHA
  if (data.password !== data.confirmPassword) {
    setConfirmPasswordError("As senhas não coincidem!");
    return;
  }

  // PROCESSAMENTO DOS DADOS
  setConfirmPasswordError("");
  setEmailCadastradoError("");

  try {
    console.log("Enviando dados para registro:", data);

    const newUser = await userService.addUser({
      username: data.username,
      profissao: data.profissao,
      email: data.email,
      password: data.password 
    });

    console.log("Usuário cadastrado com sucesso:", newUser);
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
        
    if (token && user) {
      console.log("Redirecionando para home...");
      navigate("/home");
    } else {
      // Fallback: se algo der errado, vai para login
      console.log("Token não salvo, redirecionando para login");
      navigate("/login");
    }
    
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    
    // Verificar se o erro é de email já cadastrado
    if (error.message && error.message.includes('já cadastrado')) {
      setEmailCadastradoError("E-mail já cadastrado!");
    } else {
      setEmailCadastradoError("Erro ao cadastrar usuário. Tente novamente.");
    }
  }
};

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        paddingTop: "25px",
      }}
    >
      {/* BOTÃO DE ALTERNAR TEMA */}
      <IconButton
        onClick={colorMode.toggleColorMode}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          ml: 1,
          color: colors.grey[100],
        }}
      >
        {theme.palette.mode === "dark" ? (
          <LightModeOutlined /> //  Ícone de sol no modo escuro
        ) : (
          <DarkModeOutlined /> //  Ícone de lua no modo claro
        )}
      </IconButton>

      {/* CONTAINER PRINCIPAL DO FORMULÁRIO */}
      <Box
        sx={{
          mx: "auto", // centraliza a box horizontalmente
          my: "auto", // centraliza a box verticalmente
          px: 4, // padding na horizontal de 4
          py: 7, // padding na vertical de 7
          backgroundColor: colors.primary[500], // deixa o background da box com a mesma cor da página
          borderRadius: 2, // arredonda a borda da box
          borderColor: "#878787", // borda cinza
          borderWidth: 1, // coloca a grossura da borda
          boxShadow: 3, // adiciona uma sombra na box
          marginBottom: "25px",
        }}
      >
        {/* TÍTULO DA PÁGINA */}
        <Typography
          variant="h1"
          sx={{
            textAlign: "center",
            mb: 5,
            color: colors.grey[100],
            fontWeight: "bold",
          }}
        >
          Cadastrar
        </Typography>

        {/* FORMULÁRIO DE REGISTRO */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* CAMPO NOME COMPLETO */}
          <Box>
            <TextField
              label="Nome"
              variant="outlined"
              size="small"
              error={!!errors.username}
              sx={{
                width: "100%",
                // ESTILIZAÇÃO DO CONTAINER DO INPUT
                "& .MuiOutlinedInput-root": {
                  backgroundColor: colors.primary[500],
                  "& fieldset": {
                    borderColor: hasError
                      ? colors.redAccent[400]
                      : colors.grey[300],
                  },
                  "&:hover fieldset": {
                    borderColor: hasError
                      ? colors.redAccent[400]
                      : colors.blueAccent[500],
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: hasError
                      ? colors.redAccent[400]
                      : colors.blueAccent[500],
                  },
                },
                //  ESTILIZAÇÃO DO LABEL
                "& .MuiInputLabel-root": {
                  color: hasError ? colors.redAccent[400] : colors.grey[300],
                  "&.Mui-focused": {
                    color: hasError
                      ? colors.redAccent[400]
                      : colors.blueAccent[500],
                  },
                },
                // ESTILIZAÇÃO DO TEXTO DIGITADO
                "& .MuiOutlinedInput-input": {
                  color: colors.grey[100],
                },
              }}
              {...register("username", { required: "Nome é obrigatório" })}
            />
            {/* MENSAGEM DE ERRO DO NOME */}
            <Typography
              variant="caption"
              sx={{
                minHeight: "10px",
                fontWeight: "bold",
                color: errors.username ? colors.redAccent[100] : "transparent",
                visibility: errors.username ? "visible" : "hidden",
                marginTop: "1px",
                display: "block",
              }}
            >
              {errorName}
            </Typography>
          </Box>

          {/* CAMPO PROFISSÃO (SELECT) */}
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel
                id="profissao-label"
                sx={{
                  color: colors.grey[300],
                  "&.Mui-focused": {
                    color: colors.blueAccent[500],
                  },
                }}
              >
                Profissão
              </InputLabel>
              <Select
                labelId="profissao-label"
                id="profissao"
                label="Profissão"
                value={watch("profissao") || ""}
                onChange={handleProfissaoChange}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.grey[300],
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.blueAccent[500],
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.blueAccent[500],
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.primary[500],
                    "& fieldset": { borderColor: colors.grey[300] },
                    "&:hover fieldset": {
                      borderColor: colors.blueAccent[500],
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.blueAccent[500],
                    },
                  },
                  "& .MuiSelect-select": {
                    color: colors.grey[100],
                    display: "flex",
                    alignItems: "center",
                    minHeight: "auto",
                  },
                }}
              >
                <MenuItem value="Psicólogo">Psicólogo(a)</MenuItem>
              </Select>
            </FormControl>
            {/* MENSAGEM DE ERRO DA PROFISSÃO */}
            <Typography
              variant="caption"
              sx={{
                minHeight: "10px",
                fontWeight: "bold",
                color: errors.profissao ? colors.redAccent[100] : "transparent",
                visibility: errors.profissao ? "visible" : "hidden",
                marginTop: "1px",
                display: "block",
              }}
            >
              {errorProfissao}
            </Typography>
          </Box>

          {/* COMPONENTE DE EMAIL REUTILIZÁVEL */}
          <EmailInput
            register={register}
            errors={errors}
            customError={emailCadastradoError}
          />

          {/* COMPONENTE DE SENHA REUTILIZÁVEL */}
          <PasswordInput register={register} errors={errors} />

          {/* CAMPO CONFIRMAR SENHA */}
          <Box>
            <TextField
              label="Confirme a Senha"
              variant="outlined"
              size="small"
              type={showPassword ? "text" : "password"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Esconder senha" : "Mostrar senha"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: colors.grey[300] }}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: colors.primary[500],
                  "& fieldset": {
                    borderColor: colors.grey[300],
                  },
                  "&:hover fieldset": {
                    borderColor: colors.blueAccent[500],
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.blueAccent[500],
                  },
                },
                "& .MuiInputLabel-root": {
                  color: colors.grey[300],
                  "&.Mui-focused": {
                    color: colors.blueAccent[500],
                  },
                },
                "& .MuiOutlinedInput-input": {
                  color: colors.grey[100],
                },
              }}
              {...register("confirmPassword", {
                required: "Confirmação obrigatória",
              })}
            />
            {/* MENSAGEM DE ERRO DA CONFIRMAÇÃO DE SENHA */}
            <Typography
              variant="caption"
              sx={{
                minHeight: "10px",
                fontWeight: "bold",
                color: confirmPasswordError
                  ? colors.redAccent[100]
                  : "transparent",
                visibility: confirmPasswordError ? "visible" : "hidden",
                marginTop: "1px",
                display: "block",
              }}
            >
              {confirmPasswordError}
            </Typography>
          </Box>

          {/* BOTÃO DE REGISTRO */}
          <ButtonUsage type="submit" disabled={isButtonDisabled}>
              Cadastrar
          </ButtonUsage>

          {/* LINK PARA LOGIN */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: colors.grey[100] }}>
              Já possui uma conta?
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
              <Link
                onClick={() => navigate("/login")}
                sx={{
                  cursor: "pointer",
                  color: colors.blueAccent[500],
                  "&:hover": {
                    color: colors.blueAccent[600],
                  },
                  textDecoration: "underline",
                }}
              >
                Faça Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* FOOTER DA PÁGINA */}
      <Footer />
    </Box>
  );
};

export default Register;
