import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { tokens } from "../../Tema";

// ✅ Agora recebe name, label e rules como props
const PasswordInput = ({
  register,
  errors,
  name = "password",       // ← prop para o nome do campo
  label = "Senha",         // ← prop para o label
  rules = {                // ← prop para as regras de validação
    required: "Senha é obrigatória",
    minLength: {
      value: 6,
      message: "Senha deve ter ao menos 6 caracteres",
    },
  },
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [show, setShow] = useState(false);

  // ✅ Usa o name dinâmico para buscar o erro correto
  const hasError = !!errors?.[name];
  const errorMessage = errors?.[name]?.message || "";

  // ✅ Registra com o name e rules dinâmicos
  const registeredProps = register(name, rules);

  return (
    <Box>
      <TextField
        label={label}
        variant="outlined"
        size="small"
        fullWidth
        // ✅ Alterna entre texto e senha
        type={show ? "text" : "password"}
        error={hasError}
        sx={{
          width: "100%",
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
          "& .MuiInputLabel-root": {
            color: hasError ? colors.redAccent[400] : colors.grey[300],
            "&.Mui-focused": {
              color: hasError
                ? colors.redAccent[400]
                : colors.blueAccent[500],
            },
          },
          "& .MuiOutlinedInput-input": {
            color: colors.grey[100],
          },
        }}
        // ✅ InputProps para o ícone — sem interferir no register
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShow((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()} // ✅ evita perda de foco
                edge="end"
                tabIndex={-1} // ✅ não atrapalha navegação por TAB
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                sx={{ color: colors.grey[300] }}
              >
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        // ✅ Spread por último — garante que register não é sobrescrito
        {...registeredProps}
      />

      {/* MENSAGEM DE ERRO */}
      <Typography
        variant="caption"
        sx={{
          minHeight: "20px",
          fontWeight: "bold",
          color: colors.redAccent[100],
          visibility: hasError ? "visible" : "hidden",
          marginTop: "4px",
          display: "block",
          fontSize: "12px",
        }}
      >
        {errorMessage || " "}
      </Typography>
    </Box>
  );
};

export default PasswordInput;