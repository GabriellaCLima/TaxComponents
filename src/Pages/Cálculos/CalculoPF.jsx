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
} from "@mui/material";
import { tokens } from "../../Tema";
import CustosTooltip from "../../Components/CustosTooltip";
import RendaTooltip from "../../Components/RendaTooltip";

// Componente de cálculo de tributação para Pessoa Física (IRPF)
const CalculoPF = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const LIMITE_RENDA = 15000.0;

  const navigate = useNavigate();

  // Configuração do formulário com react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rendaMensal: "",
      custosMensais: "",
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  // Watch dos campos para validação do botão
  const watchedFields = watch();
  const areAllFieldsFilled =
    watchedFields.rendaMensal && watchedFields.custosMensais;

  const isButtonDisabled = !areAllFieldsFilled;

  // Estados de resultados e alertas
  const [resultado, setResultado] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Função para formatar valores monetários em Real brasileiro
  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para exibir alertas de feedback ao usuário
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    // Auto-esconde o alerta após 2 segundos
    setTimeout(() => {
      setAlertVisible(false);
    }, 2000);
  };

  // Função para simular envio de e-mail com resultados
  const enviarEmail = (resultadoPF) => {
    const emailUsuario = watch("emailUsuario");
    console.log("Enviando email...", { resultadoPF, email: emailUsuario });
    showAlert("E-mail enviado com sucesso!", "success");
  };

  // Função principal de cálculo do Imposto de Renda para Pessoa Física
  const calcularIRPF = (data) => {
    const rendaMensal = parseFloat(data.rendaMensal) || 0;
    const custosMensais = parseFloat(data.custosMensais) || 0;

    // Validação adicional do limite de renda
    if (rendaMensal > LIMITE_RENDA) {
      showAlert(
        `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
        "error"
      );
      return;
    }

    // Base de cálculo = Renda bruta - despesas dedutíveis
    const baseCalculo = rendaMensal - custosMensais;

    // Tabela Progressiva do IRPF mensal 2025
    const faixas = [
      { limite: 2428.8, aliquota: 0, deducao: 0 }, // ISENTO
      { limite: 2826.65, aliquota: 0.075, deducao: 182.16 }, // 7,5%
      { limite: 3751.05, aliquota: 0.15, deducao: 394.16 }, // 15%
      { limite: 4664.68, aliquota: 0.225, deducao: 675.49 }, // 22,5%
      { limite: Infinity, aliquota: 0.275, deducao: 908.73 }, // 27,5%
    ];

    let aliquota = 0;
    let deducao = 0;

    // Identifica a faixa de tributação baseada no valor da base de cálculo
    for (let faixa of faixas) {
      if (baseCalculo <= faixa.limite) {
        aliquota = faixa.aliquota;
        deducao = faixa.deducao;
        break;
      }
    }

    // Cálculo do imposto: (Base × Alíquota) - Parcela a Deduzir
    let imposto = baseCalculo * aliquota - deducao;
    if (imposto < 0) imposto = 0; // Garante que imposto nunca seja negativo

    // Armazena resultados no estado
    setResultado({
      rendaMensal,
      custosMensais,
      baseCalculo,
      aliquota: aliquota * 100, // Converte para porcentagem
      deducao,
      imposto,
    });
    showAlert("Cálculo realizado com sucesso!", "success");
  };

  // Handler de envio de email com validações
  const handleEnviarEmail = () => {
    const emailValue = watch("emailUsuario");

    // Validação de email preenchido
    if (!emailValue || emailValue.trim() === "") {
      showAlert("Por favor, informe seu e-mail", "error");
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(emailValue)) {
      showAlert("Por favor, informe um e-mail válido", "error");
      return;
    }

    // Validação de existência de resultados
    if (resultado) {
      enviarEmail(resultado);
    } else {
      showAlert("Por favor, calcule os resultados primeiro", "error");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 3 }}>
        Cálculo de Tributação - Pessoa Física (IRPF)
      </Typography>

      {/* Formulário */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: colors.primary[500],
          border: "1px solid",
          borderColor: "#878787",
        }}
      >
        <Box component="form" onSubmit={handleSubmit(calcularIRPF)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              {/* Renda Mensal */}
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Renda Mensal"
                  type="number"
                  fullWidth
                  required
                  {...register("rendaMensal", {
                    required: "Renda mensal é obrigatória!",
                    min: { value: 0, message: "Renda não pode ser negativa" },
                    max: {
                      value: LIMITE_RENDA,
                      message: `Renda não pode exceder ${formatMoney(
                        LIMITE_RENDA
                      )}`,
                    },
                    valueAsNumber: true,
                  })}
                  error={!!errors.rendaMensal}
                  helperText={
                    errors.rendaMensal?.message ||
                    `Limite máximo: ${formatMoney(LIMITE_RENDA)}`
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: LIMITE_RENDA,
                      step: "0.01",
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
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
                      "&:hover fieldset": {
                        borderColor: colors.blueAccent[500],
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.blueAccent[500],
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: colors.grey[300],
                      "&.Mui-focused": { color: colors.blueAccent[500] },
                    },
                    "& .MuiOutlinedInput-input": { color: colors.grey[100] },
                    "& .MuiFormHelperText-root": {
                      color: errors.rendaMensal
                        ? colors.redAccent[400]
                        : theme.palette.mode === "dark"
                        ? colors.grey[500]
                        : colors.grey[600],
                    },
                  }}
                />
              </Box>

              {/* Custos Mensais */}
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Total de Custos Mensais"
                  type="number"
                  fullWidth
                  required
                  {...register("custosMensais", {
                    required: "Custos mensais são obrigatórios!",
                    min: {
                      value: 0,
                      message: "Custos não podem ser negativos",
                    },
                    valueAsNumber: true,
                  })}
                  error={!!errors.custosMensais}
                  helperText={errors.custosMensais?.message}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "0.01",
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <CustosTooltip />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
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
                    "& .MuiInputLabel-root": {
                      color: colors.grey[300],
                      "&.Mui-focused": { color: colors.blueAccent[500] },
                    },
                    "& .MuiOutlinedInput-input": { color: colors.grey[100] },
                    "& .MuiFormHelperText-root": {
                      color: errors.custosMensais
                        ? colors.redAccent[400]
                        : theme.palette.mode === "dark"
                        ? colors.grey[500]
                        : colors.grey[600],
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Botão Calcular */}
            <Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isButtonDisabled}
                sx={{
                  backgroundColor: isButtonDisabled
                    ? colors.grey[600]
                    : colors.redAccent[500],
                  color: colors.grey[900],
                  fontWeight: "bold",
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: isButtonDisabled
                      ? colors.grey[600]
                      : colors.redAccent[600],
                    color: colors.grey[900],
                    transform: isButtonDisabled ? "none" : "translateY(-2px)",
                    boxShadow: isButtonDisabled ? "none" : 3,
                  },
                  transition: "all 0.3s ease",
                  maxWidth: "400px",
                  mx: "auto",
                  display: "block",
                }}
              >
                Calcular Tributação
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Exibição dos resultados */}
        {resultado && (
          <Paper
            variant="outlined"
            sx={{ mt: 3, p: 2, backgroundColor: colors.primary[200] }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Resultado PF:
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Grid container spacing={2} justifyContent="center">
                <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Renda Mensal:
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.rendaMensal)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Custos Mensais:
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.custosMensais)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Base de Cálculo:
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.baseCalculo)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Alíquota:
                  </Typography>
                  <Typography variant="body2">{resultado.aliquota}%</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2} justifyContent="center">
                <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Parcela Dedutível:
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.deducao)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="error.main"
                  >
                    Imposto Devido:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="error.main"
                  >
                    {formatMoney(resultado.imposto)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Paper>

      {/* Seção de email*/}
      {resultado && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: { xs: "wrap", md: "nowrap" },
            mt: 2,
            p: 2,
            borderRadius: 2,
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register("enviarEmail")}
                  sx={{
                    color: colors.grey[300],
                    "&.Mui-checked": {
                      color: colors.blueAccent[500],
                    },
                  }}
                />
              }
              label="Deseja receber os cálculos por e-mail?"
              sx={{ color: colors.grey[100] }}
            />
          </Box>

          <Grow in={watch("enviarEmail")}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
                flex: 2,
                minWidth: { xs: "100%", md: "auto" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextField
                  label="E-mail"
                  size="small"
                  type="email"
                  fullWidth
                  {...register("emailUsuario", {
                    required: watch("enviarEmail")
                      ? "E-mail é obrigatório"
                      : false,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "E-mail inválido",
                    },
                  })}
                  error={!!errors.emailUsuario}
                  sx={{
                    flex: 2,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: colors.primary[500],
                      "& fieldset": {
                        borderColor: errors.emailUsuario
                          ? colors.redAccent[400]
                          : colors.grey[300],
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
                      "&.Mui-focused": { color: colors.blueAccent[500] },
                    },
                    "& .MuiOutlinedInput-input": { color: colors.grey[100] },
                  }}
                />
                <Button
                  onClick={handleEnviarEmail}
                  sx={{
                    flex: 1,
                    minWidth: "140px",
                    height: "40px",
                    backgroundColor: colors.redAccent[500],
                    color: colors.grey[900],
                    borderRadius: "8px",
                    transition: "all 0.2s ease-in-out",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: colors.redAccent[600],
                      color: colors.grey[900],
                      transform: "translateY(-1px)",
                      boxShadow: `0 4px 8px ${colors.blueAccent[500]}40`,
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Enviar resultados
                </Button>
              </Box>
            </Box>
          </Grow>
        </Box>
      )}

      {/* Alert */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Collapse in={alertVisible} sx={{ width: "100%", maxWidth: "400px" }}>
          <Alert
            severity={alertSeverity}
            onClose={() => setAlertVisible(false)}
            sx={{
              backgroundColor:
                alertSeverity === "success"
                  ? colors.greenAccent[100]
                  : colors.redAccent[100],
                color: colors.grey[900],
              "& .MuiAlert-icon": {
                color: colors.grey[900],
              },
            }}
          >
            {alertMessage}
          </Alert>
        </Collapse>
      </Box>
      <Box marginTop={3}>
        <Typography variant="body1" sx={{ color: colors.grey[100] }}>
          Para fazer a comparação entre PF e PJ, acesse{" "}
          <Link
            sx={{
              color: colors.blueAccent[500],
              "&:hover": {
                color: colors.blueAccent[600],
              },
              cursor: "pointer",
            }}
            onClick={() => navigate("/calculadora")}
          >
            Calculadora Comparativa
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default CalculoPF;
