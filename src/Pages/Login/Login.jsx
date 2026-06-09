import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
  Link,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import PasswordInput from "../../Components/Inputs/PasswordInput";
import EmailInput from "../../Components/Inputs/EmailInput";
import ButtonUsage from "../../Components/ButtonUsage";
import Footer from "../../Components/Footer";
import { tokens, ColorModeContext } from "../../Tema";
import { userService } from "../../services/api";

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const watchedFields = watch();
  const areAllFieldsFilled = watchedFields.email && watchedFields.password;
  const isButtonDisabled = !areAllFieldsFilled;

  const onSubmit = async (data) => {
    setLoginError("");

    try {
      console.log("Enviando dados para login:", {
        email: data.email,
        password: data.password,
      });

      // ✅ Chama o método correto do userService
      const result = await userService.login({
        email: data.email,
        password: data.password,
      });

      // ✅ Login bem-sucedido (token e user já salvos automaticamente no api.js)
      console.log("Login bem-sucedido:", result.user);
      navigate("/home");

    } catch (error) {
      // ✅ Captura erros do backend
      setLoginError(error.message || "Email ou senha incorretos");
      console.error("Erro no login:", error);
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
      {/* Botão de alternar tema */}
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
          <LightModeOutlined />
        ) : (
          <DarkModeOutlined />
        )}
      </IconButton>

      {/* Box para armazenar o form */}
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
          boxShadow: 3,
        }}
      >
        {/* Título */}
        <Typography
          variant="h1"
          sx={{
            textAlign: "center",
            mb: 8,
            color: colors.grey[100],
            fontWeight: "bold",
          }}
        >
          Login
        </Typography>

        {/* Formulário */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box>
            <EmailInput register={register} errors={errors} />
            <PasswordInput register={register} errors={errors} />

            {/* Mensagem de erro do login */}
            <Typography
              variant="caption"
              sx={{
                minHeight: "20px",
                fontWeight: "bold",
                color: loginError ? colors.redAccent[100] : "transparent",
                visibility: loginError ? "visible" : "hidden",
                marginTop: "1px",
                display: "block",
                textAlign: "center",
              }}
            >
              {loginError}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControlLabel
              label="Lembrar de mim?"
              control={
                <Checkbox
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    color: colors.grey[300],
                    "&.Mui-checked": {
                      color: colors.blueAccent[500],
                    },
                  }}
                />
              }
              sx={{
                "& .MuiFormControlLabel-label": {
                  color: colors.grey[100],
                },
              }}
            />

            <Box
              sx={{
                textAlign: { xs: "center", sm: "right" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                <Link
                  onClick={() => navigate("/login/forgot")}
                  sx={{
                    cursor: "pointer",
                    color: colors.blueAccent[500],
                    "&:hover": {
                      color: colors.blueAccent[600],
                    },
                    textDecoration: "underline",
                  }}
                >
                  Esqueceu a senha?
                </Link>
              </Typography>
            </Box>

            <ButtonUsage type="submit" disabled={isButtonDisabled}>
              Entrar
            </ButtonUsage>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: colors.grey[100] }}>
                Não possui uma conta?
              </Typography>
              <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                <Link
                  onClick={() => navigate("/Register")}
                  sx={{
                    cursor: "pointer",
                    color: colors.blueAccent[500],
                    "&:hover": {
                      color: colors.blueAccent[600],
                    },
                    textDecoration: "underline",
                  }}
                >
                  Registre-se
                </Link>
              </Typography>
            </Box>

            <Footer />

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;