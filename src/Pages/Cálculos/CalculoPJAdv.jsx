import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  InputAdornment,
  Grow,
  Collapse,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  Tooltip,
  IconButton
} from "@mui/material";
import Info from "@mui/icons-material/Info";
import RendaTooltip from "../../Components/RendaTooltip";
import { tokens } from "../../Tema";

// Componente de cálculo de tributação para Pessoa Jurídica (Advocacia - Anexo IV)
const CalculoPJAdvogado = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const LIMITE_RENDA = 15000.0;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rendaMensal: "",
      salarioMinimo: "1621.0", // Salário mínimo projetado para 2026
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  const watchedFields = watch();
  const areAllFieldsFilled = watchedFields.rendaMensal && watchedFields.salarioMinimo;
  const isButtonDisabled = !areAllFieldsFilled;

  const [resultado, setResultado] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2000);
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const enviarEmail = (resultadoPJ) => {
    const emailUsuario = watch("emailUsuario");
    console.log("Enviando email...", { resultadoPJ, email: emailUsuario });
    showAlert("E-mail enviado com sucesso!", "success");
  };

  // CÁLCULO ESPECÍFICO PARA ADVOGADOS (ANEXO IV)
  const calcularPJAdvogado = (data) => {
    const renda = parseFloat(data.rendaMensal) || 0;
    const salarioMinimo = parseFloat(data.salarioMinimo) || 1621.0;

    if (renda > LIMITE_RENDA) {
      showAlert(
        `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
        "error"
      );
      return;
    }

    // Na advocacia, NÃO HÁ exigência do Fator R (28%).
    // Otimiza-se retirando apenas o salário mínimo como pró-labore.
    const proLabore = salarioMinimo;

    // Simples Nacional (Anexo IV): 4,5% sobre a renda mensal
    const simples = renda * 0.045;

    // INSS retido do sócio (11% sobre o pró-labore)
    const inss = proLabore * 0.11;

    // CPP Patronal (20% sobre o pró-labore) - Diferencial da Advocacia
    const cpp = proLabore * 0.20;

    // IR sobre pró-labore (Tabela Progressiva PF)
    let irProLabore = 0;
    if (proLabore <= 2428.8) {
      irProLabore = 0;
    } else if (proLabore <= 2826.65) {
      irProLabore = proLabore * 0.075 - 182.16;
    } else if (proLabore <= 3751.05) {
      irProLabore = proLabore * 0.15 - 394.16;
    } else if (proLabore <= 4664.68) {
      irProLabore = proLabore * 0.225 - 675.49;
    } else {
      irProLabore = proLabore * 0.275 - 908.73;
    }
    irProLabore = Math.max(0, irProLabore);

    // Total de tributos PJ (Simples + INSS + CPP + IR)
    const totalPJ = simples + inss + cpp + irProLabore;

    setResultado({
      renda,
      proLabore,
      simples,
      inss,
      cpp,
      irProLabore,
      totalPJ,
      rendaLiquidaPJ: renda - totalPJ,
    });
    
    showAlert("Cálculo realizado com sucesso!", "success");
  };

  const handleEnviarEmail = () => {
    const emailValue = watch("emailUsuario");
    if (!emailValue || emailValue.trim() === "") {
      showAlert("Por favor, informe seu e-mail", "error");
      return;
    }
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(emailValue)) {
      showAlert("Por favor, informe um e-mail válido", "error");
      return;
    }
    if (resultado) {
      enviarEmail(resultado);
    } else {
      showAlert("Por favor, calcule os resultados primeiro", "error");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 3 }}>
        Cálculo de Tributação - PJ (Advocacia)
      </Typography>

      <Paper sx={{ p: 3, backgroundColor: colors.primary[500], border: "1px solid", borderColor: "#878787" }}>
        <Box component="form" onSubmit={handleSubmit(calcularPJAdvogado)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", justifyContent: "space-between", flexWrap: { xs: "wrap", md: "nowrap" } }}>
              
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Renda Mensal"
                  type="number"
                  fullWidth
                  required
                  {...register("rendaMensal", {
                    required: "Renda mensal é obrigatória!",
                    min: { value: 0, message: "Renda não pode ser negativa" },
                    max: { value: LIMITE_RENDA, message: `Renda não pode exceder ${formatMoney(LIMITE_RENDA)}` },
                    valueAsNumber: true,
                  })}
                  error={!!errors.rendaMensal}
                  helperText={errors.rendaMensal?.message || `Limite máximo: ${formatMoney(LIMITE_RENDA)}`}
                  slotProps={{
                    htmlInput: { min: 0, max: LIMITE_RENDA, step: "0.01" },
                    input: {
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <RendaTooltip />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: colors.primary[500],
                      "& fieldset": { borderColor: colors.grey[300] },
                      "&:hover fieldset": { borderColor: colors.blueAccent[500] },
                      "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                    },
                    "& .MuiInputLabel-root": {
                      color: colors.grey[300],
                      "&.Mui-focused": { color: colors.blueAccent[500] },
                    },
                    "& .MuiOutlinedInput-input": { color: colors.grey[100] },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Pró-labore (Salário)"
                  type="number"
                  fullWidth
                  required
                  {...register("salarioMinimo", {
                    required: "Pró-labore é obrigatório!",
                    min: { value: 0, message: "Não pode ser negativo" },
                    valueAsNumber: true,
                  })}
                  error={!!errors.salarioMinimo}
                  helperText={errors.salarioMinimo?.message || "Sugerido: Salário Mínimo"}
                  slotProps={{
                    htmlInput: { min: 0, step: "0.01" },
                    input: {
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Diferente da psicologia, na advocacia não há obrigatoriedade do Fator R (28%). Recomenda-se retirar 1 salário mínimo." arrow placement="right">
                            <IconButton size="small"><Info fontSize="small" /></IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: colors.primary[500],
                      "& fieldset": { borderColor: colors.grey[300] },
                      "&:hover fieldset": { borderColor: colors.blueAccent[500] },
                      "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                    },
                    "& .MuiInputLabel-root": { color: colors.grey[300], "&.Mui-focused": { color: colors.blueAccent[500] } },
                    "& .MuiOutlinedInput-input": { color: colors.grey[100] },
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isButtonDisabled}
                sx={{
                  backgroundColor: isButtonDisabled ? colors.grey[600] : colors.blueAccent[500],
                  color: colors.grey[900],
                  fontWeight: "bold",
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: isButtonDisabled ? colors.grey[600] : colors.blueAccent[600],
                  },
                  maxWidth: "400px",
                  mx: "auto",
                  display: "block",
                }}
              >
                Calcular PJ Advocacia
              </Button>
            </Box>
          </Box>
        </Box>

        {resultado && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, backgroundColor: colors.primary[200] }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Resultado PJ (Advocacia):
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">Simples Nacional (4,5%):</Typography>
                  <Typography variant="body2">{formatMoney(resultado.simples)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">INSS Retido (11%):</Typography>
                  <Typography variant="body2">{formatMoney(resultado.inss)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600" color="warning.main">CPP Patronal (20%):</Typography>
                  <Typography variant="body2" color="warning.main">{formatMoney(resultado.cpp)}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2} justifyContent="center" sx={{ gap: 5 }}>
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600" color="error.main">
                    Total Tributos:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {formatMoney(resultado.totalPJ)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600" color="success.main">
                    Renda Líquida aprox.:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {formatMoney(resultado.rendaLiquidaPJ)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Paper>

      {/* Seção de Alertas e Emails */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Collapse in={alertVisible} sx={{ width: "100%", maxWidth: "400px" }}>
          <Alert severity={alertSeverity}>{alertMessage}</Alert>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CalculoPJAdvogado;