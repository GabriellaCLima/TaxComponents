import { useState } from "react";
import { useForm } from "react-hook-form";
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
} from "@mui/material";
import RendaTooltip from "../../Components/RendaTooltip";
import { tokens } from "../../Tema";

const CalculoPJArq = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const LIMITE_RENDA = 15000.0;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rendaMensal: "",
      salarioMinimo: "1621.0",
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  const watchedFields = watch();

  const areAllFieldsFilled =
    watchedFields.rendaMensal && watchedFields.salarioMinimo;

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
    console.log("Enviando email...", {
      resultadoPJ,
      email: watch("emailUsuario"),
    });

    showAlert("E-mail enviado com sucesso!", "success");
  };

  // CÁLCULO ESPECÍFICO PARA ARQUITETURA (ANEXO III - IGUAL PSICOLOGIA)
  const calcularPJArq = (data) => {
    const renda = parseFloat(data.rendaMensal) || 0;
    const salarioMinimo = parseFloat(data.salarioMinimo) || 1621.0;

    if (renda > LIMITE_RENDA) {
      showAlert(
        `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
        "error"
      );
      return;
    }

    // Pró-labore no Anexo III exige o Fator R de 28%
    const proLabore = Math.max(renda * 0.28, salarioMinimo);

    // Simples Nacional (Anexo III): 6%
    const simples = renda * 0.06;

    // INSS retido do sócio (11% sobre o pró-labore)
    const inss = proLabore * 0.11;

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

    // Diferente da Advocacia, Arquitetos NÃO pagam CPP separado (já está no DAS)
    const totalPJ = simples + inss + irProLabore;

    setResultado({
      renda,
      proLabore,
      simples,
      inss,
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

    if (resultado) {
      enviarEmail(resultado);
    } else {
      showAlert("Por favor, calcule os resultados primeiro", "error");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 3 }}>
        Cálculo de Tributação - PJ (Arquitetura)
      </Typography>

      <Paper
        sx={{
          p: 3,
          backgroundColor: colors.primary[500],
          border: "1px solid",
          borderColor: "#878787",
        }}
      >
        <Box component="form" onSubmit={handleSubmit(calcularPJArq)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Renda Mensal"
                  type="number"
                  fullWidth
                  required
                  {...register("rendaMensal", {
                    required: "Renda mensal é obrigatória!",
                    min: {
                      value: 0,
                      message: "Renda não pode ser negativa",
                    },
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
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Salário Mínimo Vigente"
                  type="number"
                  fullWidth
                  required
                  {...register("salarioMinimo", {
                    required: "Obrigatório!",
                    min: {
                      value: 0,
                      message: "Não pode ser negativo",
                    },
                    valueAsNumber: true,
                  })}
                  error={!!errors.salarioMinimo}
                  helperText={errors.salarioMinimo?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                    },
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
                  backgroundColor: isButtonDisabled
                    ? colors.grey[600]
                    : colors.blueAccent[500],
                  color: colors.grey[900],
                  fontWeight: "bold",
                  py: 1.5,
                  maxWidth: "400px",
                  mx: "auto",
                  display: "block",
                }}
              >
                Calcular PJ Arquitetura
              </Button>
            </Box>
          </Box>
        </Box>

        {resultado && (
          <Paper
            variant="outlined"
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: colors.primary[200],
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Resultado PJ (Arquitetura):
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
                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Simples Nacional (6%):
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.simples)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    Pró-labore (Fator R 28%):
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.proLabore)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    INSS Retido (11%):
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.inss)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600">
                    IR sobre Pró-labore:
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(resultado.irProLabore)}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2} justifyContent="center" sx={{ gap: 5 }}>
                <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" fontWeight="600" color="error.main">
                    Total Tributos (Simples + INSS + IR):
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {formatMoney(resultado.totalPJ)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="success.main"
                  >
                    Renda Líquida aprox.:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {formatMoney(resultado.rendaLiquidaPJ)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Paper>

      {resultado && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
            p: 2,
          }}
        >
          <FormControlLabel
            control={<Checkbox {...register("enviarEmail")} />}
            label="Receber por e-mail?"
          />

          <Grow in={watch("enviarEmail")}>
            <Box sx={{ display: "flex", gap: 1, flex: 2 }}>
              <TextField
                label="E-mail"
                size="small"
                type="email"
                fullWidth
                {...register("emailUsuario")}
              />

              <Button
                onClick={handleEnviarEmail}
                sx={{
                  backgroundColor: colors.redAccent[500],
                  color: colors.grey[900],
                }}
              >
                Enviar
              </Button>
            </Box>
          </Grow>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Collapse in={alertVisible} sx={{ width: "100%", maxWidth: "400px" }}>
          <Alert severity={alertSeverity} onClose={() => setAlertVisible(false)}>
            {alertMessage}
          </Alert>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CalculoPJArq;