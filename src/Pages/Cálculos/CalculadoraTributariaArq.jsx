import { useState } from "react";
import { tokens } from "../../Tema";
import { useForm } from "react-hook-form";
import {
  Box,
  useTheme,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Alert,
  Collapse,
  Grow,
} from "@mui/material";
import RendaTooltip from "../../Components/RendaTooltip";
import CustosTooltip from "../../Components/CustosTooltip";

const CalculadoraTributariaArq = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rendaMensal: "",
      custosMensais: "",
      salarioMinimo: "1621.0",
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  const watchedFields = watch();
  const areAllFieldsFilled =
    watchedFields.rendaMensal && watchedFields.custosMensais;
  const isButtonDisabled = !areAllFieldsFilled;

  const [tabValue, setTabValue] = useState(0);
  const [resultadoPF, setResultadoPF] = useState(null);
  const [resultadoPJ, setResultadoPJ] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const SALARIO_MINIMO = 1621.0;
  const LIMITE_RENDA = 15000.0;

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 3000);
  };

  const calcularPF = (renda, custos) => {
    const descontoSimplificado = 607.2;
    const deducaoBase = Math.max(custos, descontoSimplificado);
    let baseCalculo = Math.max(0, renda - deducaoBase);

    let aliquota = 0;
    let parcelaADeduzir = 0;

    if (baseCalculo <= 2428.8) {
      aliquota = 0;
      parcelaADeduzir = 0;
    } else if (baseCalculo <= 2826.65) {
      aliquota = 7.5;
      parcelaADeduzir = 182.16;
    } else if (baseCalculo <= 3751.05) {
      aliquota = 15;
      parcelaADeduzir = 394.16;
    } else if (baseCalculo <= 4664.68) {
      aliquota = 22.5;
      parcelaADeduzir = 675.49;
    } else {
      aliquota = 27.5;
      parcelaADeduzir = 908.73;
    }

    let impostoCalculado = Math.max(
      0,
      baseCalculo * (aliquota / 100) - parcelaADeduzir
    );

    let redutor = 0;

    if (renda <= 5000) {
      redutor = 312.89;
    } else if (renda <= 7350) {
      redutor = 978.62 - 0.133145 * renda;
    }

    redutor = Math.max(0, redutor);

    let impostoFinal = Math.max(0, impostoCalculado - redutor);

    return {
      renda,
      custos,
      baseCalculo,
      aliquota,
      parcelaADeduzir,
      imposto: impostoFinal,
      rendaLiquida: renda - impostoFinal,
      aliquotaEfetiva: renda > 0 ? (impostoFinal / renda) * 100 : 0,
    };
  };

  const calcularPJ = (renda) => {
    // Arquitetura: Anexo III (6%) com Fator R (28%)
    const proLabore = Math.max(renda * 0.28, SALARIO_MINIMO);
    const simplesNacional = renda * 0.06;
    const inss = proLabore * 0.11;

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

    const totalPJ = simplesNacional + inss + irProLabore;

    return {
      renda,
      proLabore,
      simplesNacional,
      inss,
      irProLabore,
      totalPJ,
      rendaLiquida: renda - totalPJ,
    };
  };

  const calcular = (data) => {
    const renda = parseFloat(data.rendaMensal) || 0;
    const custos = parseFloat(data.custosMensais) || 0;

    if (renda > LIMITE_RENDA) {
      showAlert(
        `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
        "error"
      );
      return;
    }

    setResultadoPF(calcularPF(renda, custos));
    setResultadoPJ(calcularPJ(renda));
    setMostrarResultados(true);
    showAlert("Cálculos realizados com sucesso!", "success");
  };

  const enviarEmail = () => {
    showAlert("Resultados enviados para seu email.", "success");
  };

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        p: { xs: 2, md: 4 },
        minHeight: "70vh",
      }}
    >
      <Typography variant="h4" align="center" fontWeight="600" sx={{ mb: 1 }}>
        Calculadora Comparativa (Arquitetura)
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{
          mb: 4,
          color:
            theme.palette.mode === "dark"
              ? colors.grey[400]
              : colors.grey[600],
        }}
      >
        Simule e compare sua tributação entre PF e PJ
      </Typography>

      <Paper
        sx={{
          p: 3,
          backgroundColor: colors.primary[500],
          border: "1px solid",
          borderColor: "#878787",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(calcular)}
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
              justifyContent: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", md: "auto" },
                maxWidth: "400px",
              }}
            >
              <TextField
                label="Renda Mensal"
                type="number"
                fullWidth
                required
                {...register("rendaMensal", {
                  required: "Renda obrigatória!",
                  min: { value: 0, message: "Renda não pode ser negativa" },
                  max: {
                    value: LIMITE_RENDA,
                    message: `Limite: ${formatMoney(LIMITE_RENDA)}`,
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
                }}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", md: "auto" },
                maxWidth: "400px",
              }}
            >
              <TextField
                label="Despesas de Escritório"
                type="number"
                fullWidth
                required
                {...register("custosMensais", {
                  required: "Custos obrigatórios!",
                  min: 0,
                  valueAsNumber: true,
                })}
                error={!!errors.custosMensais}
                helperText={errors.custosMensais?.message}
                slotProps={{
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
                }}
              />
            </Box>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
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
              },
              maxWidth: "400px",
              mx: "auto",
              display: "block",
            }}
          >
            Calcular Comparação (Arquitetura)
          </Button>
        </Box>
      </Paper>

      {mostrarResultados && resultadoPF && resultadoPJ && (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2, mt: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              textColor="inherit"
              sx={{
                "& .MuiTab-root": {
                  color: theme.palette.text.secondary,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textTransform: "none",
                },
                "& .MuiTab-root.Mui-selected": {
                  color: colors.blueAccent[500],
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: colors.blueAccent[500],
                },
              }}
            >
              <Tab label="Pessoa Física (PF)" />
              <Tab label="Pessoa Jurídica (PJ)" />
              <Tab label="Comparação Final" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Paper sx={{ p: 3, backgroundColor: colors.primary[500] }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, color: colors.blueAccent[400] }}
              >
                Resultado PF (Arquitetura)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Base Tributável:</Typography>
                  <Typography>{formatMoney(resultadoPF.baseCalculo)}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Alíquota Máxima:</Typography>
                  <Typography>{resultadoPF.aliquota}%</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Imposto Devido:</Typography>
                  <Typography color="error" fontWeight="bold">
                    {formatMoney(resultadoPF.imposto)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Renda Líquida:</Typography>
                  <Typography color="success.main" fontWeight="bold">
                    {formatMoney(resultadoPF.rendaLiquida)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {tabValue === 1 && (
            <Paper sx={{ p: 3, backgroundColor: colors.primary[500] }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, color: colors.greenAccent[400] }}
              >
                Resultado PJ (Anexo III - Fator R)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Simples (6%):</Typography>
                  <Typography>
                    {formatMoney(resultadoPJ.simplesNacional)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">INSS Retido (11%):</Typography>
                  <Typography>{formatMoney(resultadoPJ.inss)}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Total de Impostos:</Typography>
                  <Typography color="error" fontWeight="bold">
                    {formatMoney(resultadoPJ.totalPJ)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Renda Líquida:</Typography>
                  <Typography color="success.main" fontWeight="bold">
                    {formatMoney(resultadoPJ.rendaLiquida)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {tabValue === 2 && (
            <Paper sx={{ p: 3, backgroundColor: colors.primary[500] }}>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={5}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: colors.primary[200],
                      border: `2px solid ${colors.blueAccent[500]}`,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color={colors.blueAccent[400]}
                      fontWeight="bold"
                    >
                      PF
                    </Typography>
                    <Typography>
                      Impostos: {formatMoney(resultadoPF.imposto)}
                    </Typography>
                    <Typography color="success.main" fontWeight="bold">
                      Líquido: {formatMoney(resultadoPF.rendaLiquida)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: colors.primary[200],
                      border: `2px solid ${colors.greenAccent[500]}`,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color={colors.greenAccent[400]}
                      fontWeight="bold"
                    >
                      PJ
                    </Typography>
                    <Typography>
                      Impostos: {formatMoney(resultadoPJ.totalPJ)}
                    </Typography>
                    <Typography color="success.main" fontWeight="bold">
                      Líquido: {formatMoney(resultadoPJ.rendaLiquida)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor:
                        resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
                          ? colors.blueAccent[800]
                          : colors.greenAccent[800],
                      border: `3px solid ${
                        resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
                          ? colors.blueAccent[500]
                          : colors.greenAccent[500]
                      }`,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Recomendação
                    </Typography>
                    <Typography>
                      {resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
                        ? "Pessoa Física (PF) é mais vantajosa!"
                        : "Pessoa Jurídica (PJ) é mais vantajosa!"}
                    </Typography>
                    <Typography>
                      Economia de:{" "}
                      <strong>
                        {formatMoney(
                          Math.abs(
                            resultadoPF.rendaLiquida -
                              resultadoPJ.rendaLiquida
                          )
                        )}
                      </strong>{" "}
                      / mês
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Box
            sx={{
              mt: 2,
              p: 2,
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <FormControlLabel
              control={<Checkbox {...register("enviarEmail")} />}
              label="Receber por e-mail?"
            />

            <Grow in={watch("enviarEmail")}>
              <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
                <TextField
                  size="small"
                  label="E-mail"
                  fullWidth
                  {...register("emailUsuario")}
                />
                <Button
                  onClick={enviarEmail}
                  variant="contained"
                  sx={{ bgcolor: colors.redAccent[500] }}
                >
                  Enviar
                </Button>
              </Box>
            </Grow>
          </Box>
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

export default CalculadoraTributariaArq;