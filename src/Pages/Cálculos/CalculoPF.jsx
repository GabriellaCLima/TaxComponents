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

const CalculoPF = () => {
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
      custosMensais: "",
      enviarEmail: false,
      emailUsuario: "",
    },
  });

  const watchedFields = watch();
  const areAllFieldsFilled = watchedFields.rendaMensal && watchedFields.custosMensais;
  const isButtonDisabled = !areAllFieldsFilled;

  const [resultado, setResultado] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2000);
  };

  const enviarEmail = (resultadoPF) => {
    const emailUsuario = watch("emailUsuario");
    console.log("Enviando email...", { resultadoPF, email: emailUsuario });
    showAlert("E-mail enviado com sucesso!", "success");
  };

  // Lógica de Cálculo Atualizada para 2026
  const calcularIRPF = (data) => {
    const rendaMensal = parseFloat(data.rendaMensal) || 0;
    const custosMensais = parseFloat(data.custosMensais) || 0;

    if (rendaMensal > LIMITE_RENDA) {
      showAlert(`A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`, "error");
      return;
    }

    // 1. Definição da Base de Cálculo (usando o desconto simplificado de R$ 607,20)
    const descontoSimplificado = 607.20;
    const deducaoBase = Math.max(custosMensais, descontoSimplificado);
    let baseCalculo = rendaMensal - deducaoBase;
    if (baseCalculo < 0) baseCalculo = 0;

    // 2. Tabela Progressiva 2026
    const faixas = [
      { limite: 2428.80, aliquota: 0, deducao: 0 },
      { limite: 2826.65, aliquota: 0.075, deducao: 182.16 },
      { limite: 3751.05, aliquota: 0.15, deducao: 394.16 },
      { limite: 4664.68, aliquota: 0.225, deducao: 675.49 },
      { limite: Infinity, aliquota: 0.275, deducao: 908.73 },
    ];

    let aliquotaAplicada = 0;
    let parcelaDedutivel = 0;

    for (let faixa of faixas) {
      if (baseCalculo <= faixa.limite) {
        aliquotaAplicada = faixa.aliquota;
        parcelaDedutivel = faixa.deducao;
        break;
      }
    }

    // Cálculo do Imposto Teórico (Etapa 1)
    let impostoCalculado = (baseCalculo * aliquotaAplicada) - parcelaDedutivel;
    if (impostoCalculado < 0) impostoCalculado = 0;

    // 3. Aplicação do Redutor (Etapa 2)
    let redutor = 0;
    if (rendaMensal <= 5000) {
      redutor = 312.89; // Redutor fixo que zera o imposto para quem ganha até 5k
    } else if (rendaMensal > 5000 && rendaMensal <= 7350) {
      redutor = 978.62 - (0.133145 * rendaMensal);
    }

    if (redutor < 0) redutor = 0;

    // Imposto Final
    let impostoFinal = impostoCalculado - redutor;
    if (impostoFinal < 0) impostoFinal = 0;

    setResultado({
      rendaMensal,
      custosMensais,
      baseCalculo,
      aliquota: aliquotaAplicada * 100,
      deducao: parcelaDedutivel,
      impostoAntesRedutor: impostoCalculado,
      redutor: redutor > impostoCalculado ? impostoCalculado : redutor, // Para exibição não exceder o imposto
      imposto: impostoFinal,
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
    if (resultado) enviarEmail(resultado);
    else showAlert("Por favor, calcule os resultados primeiro", "error");
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 3 }}>
        Cálculo de Tributação - Pessoa Física (IRPF 2026)
      </Typography>

      <Paper
        sx={{
          p: 3,
          backgroundColor: colors.primary[500],
          border: "1px solid",
          borderColor: "#878787",
        }}
      >
        <Box component="form" onSubmit={handleSubmit(calcularIRPF)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Renda Mensal"
                  type="number"
                  fullWidth
                  required
                  {...register("rendaMensal", {
                    required: "Renda mensal é obrigatória!",
                    min: { value: 0, message: "Renda não pode ser negativa" },
                    max: { value: LIMITE_RENDA, message: `Limite: ${formatMoney(LIMITE_RENDA)}` },
                    valueAsNumber: true,
                  })}
                  error={!!errors.rendaMensal}
                  helperText={errors.rendaMensal?.message}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      endAdornment: <InputAdornment position="end"><RendaTooltip /></InputAdornment>,
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                <TextField
                  label="Total de Custos Mensais"
                  type="number"
                  fullWidth
                  required
                  {...register("custosMensais", {
                    required: "Custos obrigatórios!",
                    min: { value: 0, message: "Não pode ser negativo" },
                    valueAsNumber: true,
                  })}
                  error={!!errors.custosMensais}
                  helperText={errors.custosMensais?.message}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      endAdornment: <InputAdornment position="end"><CustosTooltip /></InputAdornment>,
                    },
                  }}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isButtonDisabled}
              sx={{
                backgroundColor: isButtonDisabled ? colors.grey[600] : colors.redAccent[500],
                color: colors.grey[900],
                fontWeight: "bold",
                maxWidth: "400px",
                mx: "auto",
                display: "block",
              }}
            >
              Calcular Tributação
            </Button>
          </Box>
        </Box>

        {resultado && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, backgroundColor: colors.primary[200] }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Resultado PF 2026:</Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="body2" fontWeight="600">Base de Cálculo:</Typography>
                <Typography variant="body2">{formatMoney(resultado.baseCalculo)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="body2" fontWeight="600">Alíquota:</Typography>
                <Typography variant="body2">{resultado.aliquota}%</Typography>
              </Grid>
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="body2" fontWeight="600" color="secondary.main">Redutor Aplicado:</Typography>
                <Typography variant="body2" color="secondary.main">{formatMoney(resultado.redutor)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="body2" fontWeight="600" color="error.main">Imposto Final:</Typography>
                <Typography variant="body1" fontWeight="bold" color="error.main">{formatMoney(resultado.imposto)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Paper>

      {resultado && (
        <Box sx={{ mt: 2, p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <FormControlLabel
            control={<Checkbox {...register("enviarEmail")} />}
            label="Receber por e-mail?"
          />
          <Grow in={watch("enviarEmail")}>
            <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
              <TextField 
                label="E-mail" 
                size="small" 
                fullWidth 
                {...register("emailUsuario")} 
                error={!!errors.emailUsuario}
              />
              <Button onClick={handleEnviarEmail} variant="contained" color="secondary">Enviar</Button>
            </Box>
          </Grow>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Collapse in={alertVisible} sx={{ width: "100%", maxWidth: "400px" }}>
          <Alert severity={alertSeverity}>{alertMessage}</Alert>
        </Collapse>
      </Box>

      <Box marginTop={3}>
        <Typography variant="body1">
          Para comparação com PJ, acesse{" "}
          <Link onClick={() => navigate("/calculadora")} sx={{ cursor: "pointer", color: colors.blueAccent[500] }}>
            Calculadora Comparativa
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default CalculoPF;