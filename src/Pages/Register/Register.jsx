import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  useTheme,
  Box,
  Typography,
  TextField,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Link,
  CircularProgress,
} from "@mui/material";
import {
  LightModeOutlined,
  DarkModeOutlined,
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
  const navigate = useNavigate();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTADOS LOCAIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailCadastradoError, setEmailCadastradoError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURAÇÃO DO REACT-HOOK-FORM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBSERVAÇÃO DE CAMPOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const watchedFields = watch();
  const watchedEmail = watch("email");

  useEffect(() => {
    setEmailCadastradoError("");
  }, [watchedEmail]);

  useEffect(() => {
    if (
      watchedFields.confirmPassword &&
      watchedFields.password === watchedFields.confirmPassword
    ) {
      setConfirmPasswordError("");
    }
  }, [watchedFields.password, watchedFields.confirmPassword]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDAÇÕES E CONTROLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const areAllFieldsFilled =
    watchedFields.username &&
    watchedFields.profissao &&
    watchedFields.email &&
    watchedFields.password &&
    watchedFields.confirmPassword;

  const isButtonDisabled = !areAllFieldsFilled || isLoading;

  const errorName = errors.username?.message || "";
  const errorProfissao = errors.profissao?.message || "";
  const hasErrorName = !!errors.username;
  const hasErrorProfissao = !!errors.profissao;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLER PROFISSÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleProfissaoChange = (event) => {
    setValue("profissao", event.target.value, { shouldValidate: true });
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUBMISSÃO DO FORMULÁRIO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem!");
      return;
    }

    setConfirmPasswordError("");
    setEmailCadastradoError("");
    setIsLoading(true);

    try {
      const response = await userService.addUser({
        name: data.username,
        profession: data.profissao,
        email: data.email,
        password: data.password,
      });

      console.log("✅ Usuário cadastrado:", response);

      if (response?.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/home");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("❌ Erro ao cadastrar:", error);

      if (error.message?.includes("já cadastrado")) {
        setEmailCadastradoError("E-mail já cadastrado!");
      } else if (error.message?.includes("inválido")) {
        setEmailCadastradoError("Formato de e-mail inválido.");
      } else {
        setEmailCadastradoError("Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ESTILOS CORRIGIDOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const getTextFieldStyles = (hasFieldError) => ({
    width: "100%",
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.primary[500],
      "& fieldset": {
        borderColor: hasFieldError
          ? colors.redAccent[400]
          : colors.grey[300],
      },
      "&:hover fieldset": {
        borderColor: hasFieldError
          ? colors.redAccent[400]
          : colors.blueAccent[500],
      },
      "&.Mui-focused fieldset": {
        borderColor: hasFieldError
          ? colors.redAccent[400]
          : colors.blueAccent[500],
      },
    },                                        // ✅ fecha MuiOutlinedInput-root
    "& .MuiInputLabel-root": {               // ✅ fora do MuiOutlinedInput-root
      color: hasFieldError
        ? colors.redAccent[400]
        : colors.grey[300],
      "&.Mui-focused": {
        color: hasFieldError
          ? colors.redAccent[400]
          : colors.blueAccent[500],
      },
    },                                        // ✅ fecha MuiInputLabel-root
    "& .MuiOutlinedInput-input": {           // ✅ fora do MuiOutlinedInput-root
      color: colors.grey[100],
    },
  });                                         // ✅ fecha o objeto principal

  const selectStyles = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: hasErrorProfissao
        ? colors.redAccent[400]
        : colors.grey[300],
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: hasErrorProfissao
        ? colors.redAccent[400]
        : colors.blueAccent[500],
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: hasErrorProfissao
        ? colors.redAccent[400]
        : colors.blueAccent[500],
    },
    "& .MuiSelect-select": {
      color: colors.grey[100],
    },
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
          color: colors.grey[100],
        }}
      >
        {theme.palette.mode === "dark" ? (
          <LightModeOutlined />
        ) : (
          <DarkModeOutlined />
        )}
      </IconButton>

      {/* CONTAINER DO FORMULÁRIO */}
      <Box
        sx={{
          mx: "auto",
          my: "auto",
          px: 4,
          py: 7,
          backgroundColor: colors.primary[500],
          borderRadius: 2,
          borderColor: "#878787",
          borderWidth: 1,
          borderStyle: "solid",
          boxShadow: 3,
          marginBottom: "25px",
          width: { xs: "90%", sm: "420px" },
        }}
      >
        {/* TÍTULO */}
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

        {/* FORMULÁRIO */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* CAMPO NOME */}
          <Box>
            <TextField
              label="Nome"
              variant="outlined"
              size="small"
              error={hasErrorName}
              sx={getTextFieldStyles(hasErrorName)}
              {...register("username", {
                required: "Nome é obrigatório",
                minLength: {
                  value: 2,
                  message: "Nome deve ter no mínimo 2 caracteres",
                },
              })}
            />
            <Typography
              variant="caption"
              sx={{
                minHeight: "10px",
                fontWeight: "bold",
                color: colors.redAccent[100],
                visibility: hasErrorName ? "visible" : "hidden",
                marginTop: "1px",
                display: "block",
              }}
            >
              {errorName || " "}
            </Typography>
          </Box>

          {/* CAMPO PROFISSÃO */}
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel
                id="profissao-label"
                sx={{
                  color: hasErrorProfissao
                    ? colors.redAccent[400]
                    : colors.grey[300],
                  "&.Mui-focused": {
                    color: hasErrorProfissao
                      ? colors.redAccent[400]
                      : colors.blueAccent[500],
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
                sx={selectStyles}
              >
                <MenuItem value="Psicólogo">Psicólogo(a)</MenuItem>
                <MenuItem value="Arquiteto">Arquiteto(a)</MenuItem>
                <MenuItem value="Advogado">Advogado(a)</MenuItem>
                <MenuItem value="Médico">Médico(a)</MenuItem>
                <MenuItem value="Engenheiro">Engenheiro(a)</MenuItem>
                <MenuItem value="Contador">Contador(a)</MenuItem>
                <MenuItem value="Dentista">Dentista(a)</MenuItem>
                <MenuItem value="Nutricionista">Nutricionista</MenuItem>
                <MenuItem value="Fisioterapeuta">Fisioterapeuta</MenuItem>
                <MenuItem value="Outro">Outro</MenuItem>
              </Select>
            </FormControl>
            <Typography
              variant="caption"
              sx={{
                minHeight: "10px",
                fontWeight: "bold",
                color: colors.redAccent[100],
                visibility: hasErrorProfissao ? "visible" : "hidden",
                marginTop: "1px",
                display: "block",
              }}
            >
              {errorProfissao || " "}
            </Typography>
          </Box>

          {/* CAMPO EMAIL */}
          <Box>
            <EmailInput
              register={register}
              errors={errors}
              colors={colors}
            />
            {emailCadastradoError && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: colors.redAccent[100],
                  marginTop: "4px",
                  display: "block",
                }}
              >
                ⚠️ {emailCadastradoError}
              </Typography>
            )}
          </Box>

          {/* CAMPO SENHA */}
          <PasswordInput
            register={register}
            errors={errors}
            colors={colors}
            name="password"
            label="Senha"
            rules={{
              required: "Senha é obrigatória",
              minLength: {
                value: 6,
                message: "Senha deve ter no mínimo 6 caracteres",
              },
            }}
          />

          {/* CAMPO CONFIRMAR SENHA */}
          <Box>
            <PasswordInput
              register={register}
              errors={errors}
              colors={colors}
              name="confirmPassword"
              label="Confirmar Senha"
              rules={{ required: "Confirmação de senha é obrigatória" }}
            />
            {confirmPasswordError && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: colors.redAccent[100],
                  marginTop: "4px",
                  display: "block",
                }}
              >
                ⚠️ {confirmPasswordError}
              </Typography>
            )}
          </Box>

          {/* BOTÃO DE CADASTRO */}
          <ButtonUsage
            type="submit"
            disabled={isButtonDisabled}
            sx={{ mt: 1 }}
          >
            {isLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Cadastrando...
              </Box>
            ) : (
              "Cadastrar"
            )}
          </ButtonUsage>

          {/* LINK PARA LOGIN */}
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 1, color: colors.grey[300] }}
          >
            Já tem uma conta?{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: colors.blueAccent[400],
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Entrar
            </Link>
          </Typography>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default Register;