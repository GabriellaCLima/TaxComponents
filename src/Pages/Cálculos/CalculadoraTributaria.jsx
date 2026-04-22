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
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Checkbox,
  InputAdornment,
  Alert,
  Collapse,
  Grow,
  Tooltip,
  IconButton,
} from "@mui/material";
import Info from "@mui/icons-material/Info";
import RendaTooltip from "../../Components/RendaTooltip";
import CustosTooltip from "../../Components/CustosTooltip";

// Componente de calculadora comparativa de tributação (PF x PJ)
const CalculadoraTributaria = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
      profissao: "",
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  // Watch dos campos para validação do botão
  const watchedFields = watch();
  const areAllFieldsFilled =
    watchedFields.rendaMensal &&
    watchedFields.custosMensais &&
    watchedFields.profissao;

  const isButtonDisabled = !areAllFieldsFilled;

  // Estado para controlar a aba ativa das tabs de resultados
  const [tabValue, setTabValue] = useState(0);

  // Estados de resultados
  const [resultadoPF, setResultadoPF] = useState(null);
  const [resultadoPJ, setResultadoPJ] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados de alerta para feedback ao usuário
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Constantes de limites e valores de referência
  const SALARIO_MINIMO = 1518.0;
  const LIMITE_RENDA = 15000.0;

  // Handler de mudança de aba (PF, PJ ou Comparação)
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Função para formatar valores monetários em Real brasileiro
  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para exibir alertas de feedback ao usuário
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    // Auto-esconde o alerta após 3 segundos
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  // Cálculo de tributação para Pessoa Física (IRPF)
  const calcularPF = (renda, custos) => {
    // Base de cálculo = Renda bruta - despesas dedutíveis
    const baseCalculo = renda - custos;
    let imposto = 0;
    let aliquota = 0;
    let parcelaADeduzir = 0;
    let faixa = "";

    // Tabela Progressiva do IRPF mensal 2025
    if (baseCalculo <= 2428.8) {
      imposto = 0;
      aliquota = 0;
      parcelaADeduzir = 0;
      faixa = "Até R$ 2.428,80";
    } else if (baseCalculo <= 2826.65) {
      aliquota = 7.5;
      parcelaADeduzir = 182.16;
      imposto = baseCalculo * 0.075 - parcelaADeduzir;
      faixa = "De R$ 2.428,81 até R$ 2.826,65";
    } else if (baseCalculo <= 3751.05) {
      aliquota = 15;
      parcelaADeduzir = 394.16;
      imposto = baseCalculo * 0.15 - parcelaADeduzir;
      faixa = "De R$ 2.826,66 até R$ 3.751,05";
    } else if (baseCalculo <= 4664.68) {
      aliquota = 22.5;
      parcelaADeduzir = 675.49;
      imposto = baseCalculo * 0.225 - parcelaADeduzir;
      faixa = "De R$ 3.751,06 até R$ 4.664,68";
    } else {
      // Faixa 27,5%
      aliquota = 27.5;
      parcelaADeduzir = 908.73;
      imposto = baseCalculo * 0.275 - parcelaADeduzir;
      faixa = "Acima de R$ 4.664,68";
    }

    // Calcula renda líquida e alíquota efetiva
    const rendaLiquida = renda - imposto;
    const aliquotaEfetiva = renda > 0 ? (imposto / renda) * 100 : 0;

    // Retorna todos os dados calculados
    return {
      renda,
      custos,
      baseCalculo,
      faixa,
      aliquota,
      parcelaADeduzir,
      imposto: Math.max(0, imposto), // Garante que imposto nunca seja negativo
      rendaLiquida,
      aliquotaEfetiva,
    };
  };

  // Cálculo de tributação para Pessoa Jurídica (PJ)
  const calcularPJ = (renda) => {
    // Simples Nacional (Anexo III): 6% sobre a renda mensal
    const simplesNacional = renda * 0.06;

    // Pró-labore: maior valor entre 28% da renda ou salário mínimo vigente
    const proLabore28 = renda * 0.28;
    const proLabore = Math.max(proLabore28, SALARIO_MINIMO);

    // INSS sobre pró-labore: 11% do valor do pró-labore
    const inss = proLabore * 0.11;

    // IR sobre pró-labore aplica a mesma tabela progressiva da PF
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

    irProLabore = Math.max(0, irProLabore); // Garante que IR nunca seja negativo

    // Total de tributos PJ (Simples Nacional + INSS + IR)
    const totalPJ = simplesNacional + inss + irProLabore;
    const rendaLiquida = renda - totalPJ;

    // Retorna todos os dados calculados
    return {
      renda,
      proLabore,
      simplesNacional,
      inss,
      irProLabore,
      totalPJ,
      rendaLiquida,
    };
  };

  // Função principal de cálculo que executa PF e PJ e exibe resultados
  const calcular = (data) => {
    const renda = parseFloat(data.rendaMensal) || 0;
    const custos = parseFloat(data.custosMensais) || 0;

    // Validação adicional do limite de renda
    if (renda > LIMITE_RENDA) {
      showAlert(
        `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
        "error"
      );
      return;
    }

    // Executa cálculos para Pessoa Física e Jurídica
    const pf = calcularPF(renda, custos);
    const pj = calcularPJ(renda);

    // Armazena resultados no estado e exibe na interface
    setResultadoPF(pf);
    setResultadoPJ(pj);
    setMostrarResultados(true);
    showAlert("Cálculos realizados com sucesso!", "success");
  };

  // Função para simular envio de e-mail com resultados de PF e PJ
  const enviarEmail = (pf, pj) => {
    const emailUsuario = watch("emailUsuario");
    console.log("Enviando e-mail para", emailUsuario);
    console.log("Resultados PF:", pf);
    console.log("Resultados PJ:", pj);

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
      <Typography
        variant="h4"
        align="center"
        fontWeight="600"
        sx={{
          mb: 1,
        }}
      >
        Calculadora de Tributação
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{
          mb: 4,
          color:
            theme.palette.mode === "dark" ? colors.grey[400] : colors.grey[600],
        }}
      >
        Para Profissionais de Psicologia - Comparação PF x PJ
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
        <Box
          component="form"
          onSubmit={handleSubmit(calcular)} 
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Primeira linha: Renda Mensal, Custos Mensais e Profissão */}
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
                    "&:hover fieldset": { borderColor: colors.blueAccent[500] },
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
                  min: { value: 0, message: "Custos não podem ser negativos" },
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
                    "&:hover fieldset": { borderColor: colors.blueAccent[500] },
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

            {/* Profissão*/}
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", md: "300px" },
                maxWidth: { md: "350px" },
              }}
            >
              <FormControl fullWidth>
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
                  label="Profissão"
                  {...register("profissao", {
                    required: "Profissão é obrigatória!",
                  })}
                  error={!!errors.profissao}
                  defaultValue=""
                  sx={{
                    minHeight: "56px",
                    backgroundColor: colors.primary[500],
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.profissao
                        ? colors.redAccent[400]
                        : colors.grey[300],
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.blueAccent[500],
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.blueAccent[500],
                    },
                    "& .MuiSelect-select": {
                      color: colors.grey[100],
                      padding: "16.5px 14px",
                      display: "flex",
                      alignItems: "center",
                      minHeight: "auto",
                    },
                  }}
                >
                  <MenuItem value="Psicólogo">Psicólogo(a)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Terceira linha: Botão Calcular */}
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
      </Paper>

      {/* Resultados */}
      {mostrarResultados && resultadoPF && resultadoPJ && (
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            align="center"
            sx={{ m: 3 }}
          >
            Comparação de Resultados
          </Typography>

          {/* Tabs para alternar entre PF e PJ */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
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
              <Tab label="Comparação" />
            </Tabs>
          </Box>

          {/* Conteúdo da aba Pessoa Física */}
          {tabValue === 0 && (
            <Paper sx={{ p: 3, backgroundColor: colors.primary[500] }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, color: colors.blueAccent[400] }}
              >
                Resultado Pessoa Física (IRPF)
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Grid container spacing={2}>
                  {/* Primeira linha - Dados da tributação */}
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        paddingBottom: 2,
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Renda Mensal:
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(resultadoPF.renda)}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Custos Mensais:
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(resultadoPF.custos)}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Base de Cálculo:
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(resultadoPF.baseCalculo)}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Faixa de Tributação:
                        </Typography>
                        <Typography variant="body1">
                          {resultadoPF.faixa}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Alíquota:
                        </Typography>
                        <Typography variant="body1">
                          {resultadoPF.aliquota}%
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Parcela a Deduzir:
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(resultadoPF.parcelaADeduzir)}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="600">
                          Alíquota Efetiva:
                        </Typography>
                        <Typography variant="body1">
                          {resultadoPF.aliquotaEfetiva.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Segunda linha */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ minWidth: 120 }}>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color="error.main"
                        >
                          Imposto de Renda (IR):
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="error.main"
                        >
                          {formatMoney(resultadoPF.imposto)}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 120 }}>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color="success.main"
                        >
                          Renda Líquida:
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {formatMoney(resultadoPF.rendaLiquida)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}

          {/* Conteúdo da aba Pessoa Jurídica */}
          {tabValue === 1 && (
            <Paper sx={{ p: 3, backgroundColor: colors.primary[500] }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, color: colors.greenAccent[400] }}
              >
                Resultado Pessoa Jurídica (PJ)
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <Grid container spacing={4}>
                  {/* Renda Mensal */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" fontWeight="600">
                      Renda Mensal:
                    </Typography>
                    <Typography variant="body1">
                      {formatMoney(resultadoPJ.renda)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight="600">
                        Pró-labore:
                      </Typography>
                      <Tooltip
                        title={
                          <span>
                            Maior entre 28% da renda (
                            {formatMoney(resultadoPJ.renda * 0.28)}) ou salário
                            mínimo ({formatMoney(SALARIO_MINIMO)})
                          </span>
                        }
                        arrow
                        placement="right"
                        sx={{
                          "& .MuiTooltip-tooltip": {
                            fontSize: "0.875rem",
                            maxWidth: 350,
                            backgroundColor: colors.primary[400],
                            color: colors.grey[100],
                            padding: 2,
                          },
                        }}
                      >
                        <IconButton size="small" sx={{ padding: 0 }}>
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body1">
                      {formatMoney(resultadoPJ.proLabore)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" fontWeight="600">
                      Simples Nacional (6%):
                    </Typography>
                    <Typography variant="body1">
                      {formatMoney(resultadoPJ.simplesNacional)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" fontWeight="600">
                      INSS (11% sobre pró-labore):
                    </Typography>
                    <Typography variant="body1">
                      {formatMoney(resultadoPJ.inss)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" fontWeight="600">
                      IR sobre pró-labore:
                    </Typography>
                    <Typography variant="body1">
                      {formatMoney(resultadoPJ.irProLabore)}
                    </Typography>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color="error.main"
                    >
                      Total de Tributos:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {formatMoney(resultadoPJ.totalPJ)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color="success.main"
                    >
                      Renda Líquida:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {formatMoney(resultadoPJ.rendaLiquida)}
                    </Typography>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Conteúdo da aba Comparação */}
          {tabValue === 2 && (
            <Box>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: colors.primary[500],
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* Primeira linha: Título */}
                <Box sx={{ width: "100%", textAlign: "center", mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Comparação PF x PJ
                  </Typography>
                </Box>

                {/* Segunda linha: Comparação PF, PJ e Recomendação */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Grid container spacing={2} sx={{ mb: 3, width: "100%" }}>
                    {/* Pessoa Física */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: colors.primary[200],
                          border: `2px solid ${colors.blueAccent[500]}`,
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{ mb: 2, color: colors.blueAccent[400] }}
                        >
                          Pessoa Física (PF)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Tributos Totais:{" "}
                          <strong style={{ color: colors.redAccent[400] }}>
                            {formatMoney(resultadoPF.imposto)}
                          </strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Renda Líquida:{" "}
                          <strong style={{ color: colors.greenAccent[400] }}>
                            {formatMoney(resultadoPF.rendaLiquida)}
                          </strong>
                        </Typography>
                        <Typography variant="body2">
                          Alíquota Efetiva:{" "}
                          <strong>
                            {resultadoPF.aliquotaEfetiva.toFixed(2)}%
                          </strong>
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Pessoa Jurídica */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: colors.primary[200],
                          border: `2px solid ${colors.greenAccent[500]}`,
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{ mb: 2, color: colors.greenAccent[400] }}
                        >
                          Pessoa Jurídica (PJ)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Tributos Totais:{" "}
                          <strong style={{ color: colors.redAccent[400] }}>
                            {formatMoney(resultadoPJ.totalPJ)}
                          </strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Renda Líquida:{" "}
                          <strong style={{ color: colors.greenAccent[400] }}>
                            {formatMoney(resultadoPJ.rendaLiquida)}
                          </strong>
                        </Typography>
                        <Typography variant="body2">
                          Alíquota Total:{" "}
                          <strong>
                            {(
                              (resultadoPJ.totalPJ / resultadoPJ.renda) *
                              100
                            ).toFixed(2)}
                            %
                          </strong>
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Recomendação */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor:
                            resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
                              ? colors.blueAccent[800]
                              : colors.greenAccent[800],
                          border: `3px solid ${
                            resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
                              ? colors.blueAccent[500]
                              : colors.greenAccent[500]
                          }`,
                          textAlign: "center",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          Recomendação
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida
                            ? `Pessoa Física (PF) é mais vantajosa!`
                            : `Pessoa Jurídica (PJ) é mais vantajosa!`}
                        </Typography>
                        <Typography variant="body2">
                          Economia de:{" "}
                          <strong>
                            {formatMoney(
                              Math.abs(
                                resultadoPF.rendaLiquida -
                                  resultadoPJ.rendaLiquida
                              )
                            )}
                          </strong>{" "}
                          por mês
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
                {/* Terceira linha: Observações */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: colors.primary[200],
                      border: "1px solid grey",
                      width: "100%",
                      maxWidth: "800px",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      Observações Importantes:
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Typography
                        variant="body2"
                        component="ul"
                        sx={{
                          textAlign: "left",
                          pl: 2,
                          margin: 0,
                        }}
                      >
                        <li>
                          Os cálculos são baseados na legislação atual (2025)
                        </li>
                        <li>
                          Pessoa Jurídica terá custos adicionais de
                          contabilidade
                        </li>
                        <li>Consulte um contador para análise personalizada</li>
                        <li>
                          Para dúvidas, entre em contato com o NAF:
                          naf01.dl@unichristus.edu.br
                        </li>
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Seção de email */}
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
            {/* Checkbox */}
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

            {/* Email Input e Button */}
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
                    onClick={() => {
                      const emailValue = watch("emailUsuario");
                      if (!emailValue || emailValue.trim() === "") {
                        showAlert("Por favor, informe seu e-mail", "error");
                        return;
                      }
                      if (errors.emailUsuario) {
                        showAlert(
                          "Por favor, informe um e-mail válido",
                          "error"
                        );
                        return;
                      }
                      if (resultadoPF && resultadoPJ) {
                        enviarEmail(resultadoPF, resultadoPJ);
                      } else {
                        showAlert(
                          "Por favor, calcule os resultados primeiro",
                          "error"
                        );
                      }
                    }}
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
        </Box>
      )}

      {/* ALERT */}
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
                color:
                  alertSeverity === "success"
                    ? colors.greenAccent[500]
                    : colors.redAccent[500],
              },
            }}
          >
            {alertMessage}
          </Alert>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CalculadoraTributaria;
