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
  const isButtonDisabled =
    !watchedFields.rendaMensal || !watchedFields.custosMensais;

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

  // 🔥 FUNÇÃO ATUALIZADA 2026
  const calcularIRPF = (data) => {
    const rendaMensal = parseFloat(data.rendaMensal) || 0;

    if (rendaMensal > LIMITE_RENDA) {
      showAlert(
        `A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`,
        "error"
      );
      return;
    }

    const DESCONTO_SIMPLIFICADO = 607.2;

    let baseCalculo = rendaMensal - DESCONTO_SIMPLIFICADO;
    if (baseCalculo < 0) baseCalculo = 0;

    let aliquota = 0;
    let deducao = 0;

    if (baseCalculo <= 2428.8) {
      aliquota = 0;
      deducao = 0;
    } else if (baseCalculo <= 2826.65) {
      aliquota = 0.075;
      deducao = 182.16;
    } else if (baseCalculo <= 3751.05) {
      aliquota = 0.15;
      deducao = 394.16;
    } else if (baseCalculo <= 4664.68) {
      aliquota = 0.225;
      deducao = 675.49;
    } else {
      aliquota = 0.275;
      deducao = 908.73;
    }

    let imposto = baseCalculo * aliquota - deducao;
    if (imposto < 0) imposto = 0;

    // 🔥 REDUTOR 2026
    let redutor = 0;

    if (rendaMensal <= 5000) {
      redutor = Math.min(imposto, 312.89);
    } else if (rendaMensal <= 7350) {
      redutor = 978.62 - 0.133145 * rendaMensal;
      if (redutor < 0) redutor = 0;
    }

    const impostoFinal = Math.max(imposto - redutor, 0);

    setResultado({
      rendaMensal,
      baseCalculo,
      aliquota: aliquota * 100,
      deducao,
      impostoAntesRedutor: imposto,
      redutor,
      imposto: impostoFinal,
    });

    showAlert("Cálculo realizado com sucesso!", "success");
  };

  const handleEnviarEmail = () => {
    const emailValue = watch("emailUsuario");

    if (!emailValue) {
      showAlert("Informe seu e-mail", "error");
      return;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(emailValue)) {
      showAlert("E-mail inválido", "error");
      return;
    }

    if (resultado) {
      enviarEmail(resultado);
    } else {
      showAlert("Calcule primeiro", "error");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold">
        Cálculo IRPF 2026
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" onSubmit={handleSubmit(calcularIRPF)}>
          <TextField
            label="Renda Mensal"
            type="number"
            fullWidth
            {...register("rendaMensal", { required: true })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
              endAdornment: <RendaTooltip />,
            }}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isButtonDisabled}
          >
            Calcular
          </Button>
        </Box>

        {resultado && (
          <Box mt={3}>
            <Typography>Base: {formatMoney(resultado.baseCalculo)}</Typography>
            <Typography>Alíquota: {resultado.aliquota}%</Typography>
            <Typography>
              Imposto antes: {formatMoney(resultado.impostoAntesRedutor)}
            </Typography>
            <Typography>
              Redutor: {formatMoney(resultado.redutor)}
            </Typography>
            <Typography fontWeight="bold" color="error">
              Imposto Final: {formatMoney(resultado.imposto)}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box mt={2}>
        <FormControlLabel
          control={<Checkbox {...register("enviarEmail")} />}
          label="Enviar por e-mail"
        />

        {watch("enviarEmail") && (
          <>
            <TextField
              label="E-mail"
              fullWidth
              {...register("emailUsuario")}
              sx={{ mt: 1 }}
            />
            <Button onClick={handleEnviarEmail}>Enviar</Button>
          </>
        )}
      </Box>

      <Collapse in={alertVisible}>
        <Alert severity={alertSeverity}>{alertMessage}</Alert>
      </Collapse>

      <Box mt={3}>
        <Link onClick={() => navigate("/calculadora")}>
          Ir para comparação PF x PJ
        </Link>
      </Box>
    </Box>
  );
};

export default CalculoPF;