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
import { tokens } from "../../Tema";
import CustosTooltip from "../../Components/CustosTooltip";
import RendaTooltip from "../../Components/RendaTooltip";

const CalculoPFAdvogado = () => {
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
    setTimeout(() => setAlertVisible(false), 3000);
  };

  // Lógica de Cálculo IRPF 2026 para Advogados Autônomos [cite: 8, 12, 16]
  const calcularIRPF = (data) => {
    const rendaMensal = parseFloat(data.rendaMensal) || 0;
    const custosMensais = parseFloat(data.custosMensais) || 0;

    if (rendaMensal > LIMITE_RENDA) {
      showAlert(`Limite de cálculo nesta ferramenta: ${formatMoney(LIMITE_RENDA)}`, "error");
      return;
    }

    // 1. Base de Cálculo com Desconto Simplificado (R$ 607,20) [cite: 7, 20]
    const descontoSimplificado = 607.20;
    const deducaoBase = Math.max(custosMensais, descontoSimplificado);
    let baseCalculo = Math.max(0, rendaMensal - deducaoBase);

    // 2. Tabela Progressiva Mensal 2026 [cite: 12]
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

    // Imposto antes do redutor [cite: 21, 25]
    let impostoCalculado = (baseCalculo * aliquotaAplicada) - parcelaDedutivel;
    impostoCalculado = Math.max(0, impostoCalculado);

    // 3. Aplicação do Redutor 2026 para rendas até R$ 7.350 [cite: 16, 26]
    let redutor = 0;
    if (rendaMensal <= 5000) {
      redutor = 312.89; // Zera o imposto para quem ganha até 5k [cite: 6, 16]
    } else if (rendaMensal <= 7350) {
      redutor = 978.62 - (0.133145 * rendaMensal); // Redução gradual [cite: 16, 26]
    }

    const impostoFinal = Math.max(0, impostoCalculado - Math.max(0, redutor));

    setResultado({
      rendaMensal,
      custosMensais,
      baseCalculo,
      aliquota: aliquotaAplicada * 100,
      imposto: impostoFinal,
      redutorUtilizado: Math.min(impostoCalculado, redutor),
      rendaLiquida: rendaMensal - impostoFinal
    });

    showAlert("Cálculo realizado!", "success");
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" align="center" fontWeight="bold" gutterBottom sx={{ color: colors.blueAccent[400] }}>
        Simulador IRPF - Advogado Autônomo
      </Typography>

      <Box component="form" onSubmit={handleSubmit(calcularIRPF)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Honorários Mensais (Bruto)"
              type="number"
              fullWidth
              required
              {...register("rendaMensal", { required: true, min: 0, valueAsNumber: true })}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  endAdornment: <InputAdornment position="end"><RendaTooltip /></InputAdornment>,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Despesas de Escritório"
              type="number"
              fullWidth
              required
              {...register("custosMensais", { required: true, min: 0, valueAsNumber: true })}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  endAdornment: <InputAdornment position="end"><CustosTooltip /></InputAdornment>,
                },
              }}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isButtonDisabled}
          sx={{
            mt: 3,
            backgroundColor: isButtonDisabled ? colors.grey[600] : colors.redAccent[500],
            color: colors.grey[900],
            fontWeight: "bold",
          }}
        >
          Calcular Imposto de Renda
        </Button>
      </Box>

      {resultado && (
        <Grow in={!!resultado}>
          <Paper variant="outlined" sx={{ mt: 3, p: 2, backgroundColor: colors.primary[200], border: `1px solid ${colors.blueAccent[500]}` }}>
            <Typography variant="h6" fontWeight="bold">Detalhamento IRPF 2026:</Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={6}><Typography variant="body2">Base Tributável:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right">{formatMoney(resultado.baseCalculo)}</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="body2">Alíquota da Faixa:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right">{resultado.aliquota}%</Typography></Grid>
              
              <Grid item xs={6}><Typography variant="body2" color="secondary">Redutor 2026 aplicado:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" color="secondary">-{formatMoney(resultado.redutorUtilizado)}</Typography></Grid>
              
              <Grid item xs={12} sx={{ borderTop: '1px solid gray', mt: 1, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="bold" color="error">Imposto a Pagar:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">{formatMoney(resultado.imposto)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grow>
      )}

      <Box sx={{ mt: 2 }}>
        <Collapse in={alertVisible}>
          <Alert severity={alertSeverity}>{alertMessage}</Alert>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CalculoPFAdvogado;