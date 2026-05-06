import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useReactToPrint } from "react-to-print";
import {
  Box,
  Modal,
  useTheme,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Alert,
  Collapse,
  Grow,
  Backdrop,
  IconButton,
  Tooltip,
} from "@mui/material";
import { tokens } from "../../Tema";
import GoBack from "../GoBack";
import CalculateIcon from "@mui/icons-material/Calculate";
import Info from "@mui/icons-material/Info";

const ModalComparacaoAdv = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Resultado_Calculadora_Tributaria_Advocacia",
  });

  // CONTROLE DE ESTADO DO MODAL
  const [open, setOpen] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  const handleOpen = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const origin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    setTransformOrigin(origin);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const style = {
    width: { xs: "90vw", md: 800 },
    bgcolor: colors.primary[500],
    border: `2px solid ${colors.blueAccent[500]}`,
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "80vh",
    maxWidth: "90vw",
    overflowY: "auto",
    zIndex: 1300,
    position: "relative",
  };

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
  const areAllFieldsFilled = watchedFields.rendaMensal && watchedFields.custosMensais;
  const isButtonDisabled = !areAllFieldsFilled;

  const [resultadoPF, setResultadoPF] = useState(null);
  const [resultadoPJ, setResultadoPJ] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const SALARIO_MINIMO = 1621.0;
  const LIMITE_RENDA = 15000.0;

  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertVisible(true);
    setTimeout(() => { setAlertVisible(false); }, 3000);
  };

  const enviarEmail = (pf, pj) => {
    const emailUsuario = watch("emailUsuario");
    console.log("Enviando e-mail para", emailUsuario);
    console.log("Resultados PF:", pf);
    console.log("Resultados PJ:", pj);
    showAlert("Resultados enviados para seu email.", "success");
  };

  const calcularPF = (renda, custos) => {
    const descontoSimplificado = 607.20;
    const deducaoBase = Math.max(custos, descontoSimplificado);
    let baseCalculo = Math.max(0, renda - deducaoBase);
    
    let aliquota = 0;
    let parcelaADeduzir = 0;

    if (baseCalculo <= 2428.8) {
      aliquota = 0; parcelaADeduzir = 0;
    } else if (baseCalculo <= 2826.65) {
      aliquota = 7.5; parcelaADeduzir = 182.16;
    } else if (baseCalculo <= 3751.05) {
      aliquota = 15; parcelaADeduzir = 394.16;
    } else if (baseCalculo <= 4664.68) {
      aliquota = 22.5; parcelaADeduzir = 675.49;
    } else {
      aliquota = 27.5; parcelaADeduzir = 908.73;
    }

    let impostoCalculado = Math.max(0, (baseCalculo * (aliquota / 100)) - parcelaADeduzir);

    let redutor = 0;
    if (renda <= 5000) {
      redutor = 312.89;
    } else if (renda <= 7350) {
      redutor = 978.62 - (0.133145 * renda);
    }
    redutor = Math.max(0, redutor);

    let impostoFinal = Math.max(0, impostoCalculado - redutor);

    return {
      renda,
      custos,
      imposto: impostoFinal,
      rendaLiquida: renda - impostoFinal,
      aliquotaEfetiva: renda > 0 ? (impostoFinal / renda) * 100 : 0,
    };
  };

  const calcularPJ = (renda) => {
    const proLabore = SALARIO_MINIMO;
    const simplesNacional = renda * 0.045; // Anexo IV
    const inss = proLabore * 0.11;
    const cpp = proLabore * 0.20; // CPP Patronal da Advocacia

    let irProLabore = 0;
    if (proLabore > 2428.8) {
      irProLabore = proLabore * 0.075 - 182.16;
    }
    irProLabore = Math.max(0, irProLabore);

    const totalPJ = simplesNacional + inss + cpp + irProLabore;

    return {
      renda,
      proLabore,
      simplesNacional,
      inss,
      cpp,
      irProLabore,
      totalPJ,
      rendaLiquida: renda - totalPJ,
    };
  };

  const calcular = (data) => {
    const renda = parseFloat(data.rendaMensal) || 0;
    const custos = parseFloat(data.custosMensais) || 0;

    if (renda > LIMITE_RENDA) {
      showAlert(`A Renda Mensal não pode exceder ${formatMoney(LIMITE_RENDA)}`, "error");
      return;
    }

    setResultadoPF(calcularPF(renda, custos));
    setResultadoPJ(calcularPJ(renda));
    setMostrarResultados(true);
    showAlert("Cálculos realizados com sucesso!", "success");
  };

  return (
    <div>
      <Button
        onClick={handleOpen}
        size="large"
        startIcon={<CalculateIcon />}
        sx={{
          color: colors.grey[900],
          backgroundColor: colors.redAccent[500],
          fontSize: "1.1rem",
          px: 2,
          py: 1,
          transition: "all 0.3s ease-in-out",
          transform: "translateY(0) scale(1)",
          "&:hover": {
            backgroundColor: colors.redAccent[600],
            transform: "translateY(-4px) scale(1.02)",
            boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3)`,
          },
        }}
      >
        Calculadora Comparativa
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300, sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" } } }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Grow in={open} timeout={400} style={{ transformOrigin }}>
          <Box sx={style}>
            <Typography variant="h5" component="h2" sx={{ color: colors.grey[100], fontWeight: 600, mb: 2 }}>
              Comparação PF x PJ (Advocacia)
            </Typography>

            <IconButton onClick={handleClose} sx={{ position: "absolute", top: 16, right: 16, ml: 1, "&:hover svg": { color: colors.redAccent[400] } }}>
              <GoBack />
            </IconButton>

            <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
              <Paper sx={{ p: 3, backgroundColor: colors.primary[500], mb: 2 }}>
                <Box component="form" onSubmit={handleSubmit(calcular)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <TextField
                      label="Honorários Mensais"
                      type="number"
                      fullWidth
                      required
                      {...register("rendaMensal", { required: "Renda obrigatória!", min: 0, max: LIMITE_RENDA, valueAsNumber: true })}
                      error={!!errors.rendaMensal}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> } }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Despesas de Escritório"
                      type="number"
                      fullWidth
                      required
                      {...register("custosMensais", { required: "Custos obrigatórios!", min: 0, valueAsNumber: true })}
                      error={!!errors.custosMensais}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> } }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isButtonDisabled}
                    sx={{
                      backgroundColor: isButtonDisabled ? colors.grey[600] : colors.redAccent[500],
                      color: colors.grey[900],
                      fontWeight: "bold",
                      py: 1.5,
                      "&:hover": { backgroundColor: isButtonDisabled ? colors.grey[600] : colors.redAccent[600] }
                    }}
                  >
                    Calcular Comparação
                  </Button>
                </Box>
              </Paper>

              {mostrarResultados && resultadoPF && resultadoPJ && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      type="button"
                      onClick={handlePrint}
                      sx={{
                        backgroundColor: colors.blueAccent[500],
                        color: "#fff",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        "&:hover": {
                          backgroundColor: colors.blueAccent[600],
                        },
                      }}
                    >
                      Imprimir resultado em PDF
                    </Button>
                  </Box>

                  <Box ref={componentRef} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 2, backgroundColor: colors.primary[200], border: `2px solid ${colors.blueAccent[500]}`, textAlign: "center", height: "100%" }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: colors.blueAccent[400] }}>Pessoa Física (PF)</Typography>
                        <Typography variant="body2">Tributos: <strong style={{ color: colors.redAccent[400] }}>{formatMoney(resultadoPF.imposto)}</strong></Typography>
                        <Typography variant="body2">Líquido: <strong style={{ color: colors.greenAccent[400] }}>{formatMoney(resultadoPF.rendaLiquida)}</strong></Typography>
                        <Typography variant="body2">Efetiva: <strong>{resultadoPF.aliquotaEfetiva.toFixed(2)}%</strong></Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 2, backgroundColor: colors.primary[200], border: `2px solid ${colors.greenAccent[500]}`, textAlign: "center", height: "100%" }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: colors.greenAccent[400] }}>Pessoa Jurídica (PJ)</Typography>
                        <Typography variant="body2">Tributos: <strong style={{ color: colors.redAccent[400] }}>{formatMoney(resultadoPJ.totalPJ)}</strong></Typography>
                        <Typography variant="body2">Líquido: <strong style={{ color: colors.greenAccent[400] }}>{formatMoney(resultadoPJ.rendaLiquida)}</strong></Typography>
                        <Typography variant="body2">Alíquota: <strong>{((resultadoPJ.totalPJ / resultadoPJ.renda) * 100).toFixed(2)}%</strong></Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper sx={{ p: 2, textAlign: "center", backgroundColor: resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida ? colors.blueAccent[800] : colors.greenAccent[800], border: `3px solid ${resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida ? colors.blueAccent[500] : colors.greenAccent[500]}` }}>
                    <Typography variant="h6" fontWeight="bold">Recomendação</Typography>
                    <Typography variant="body1">
                      {resultadoPF.rendaLiquida > resultadoPJ.rendaLiquida ? "Pessoa Física (PF) é mais vantajosa!" : "Pessoa Jurídica (PJ) é mais vantajosa!"}
                    </Typography>
                    <Typography variant="body2">
                      Economia de: <strong>{formatMoney(Math.abs(resultadoPF.rendaLiquida - resultadoPJ.rendaLiquida))}</strong> por mês
                    </Typography>
                  </Paper>
                  </Box>

                  <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center", flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <FormControlLabel
                      control={<Checkbox {...register("enviarEmail")} />}
                      label="Receber por e-mail?"
                    />

                    <Grow in={watch("enviarEmail")}>
                      <Box sx={{ display: "flex", gap: 1, flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
                        <TextField
                          size="small"
                          label="E-mail"
                          type="email"
                          fullWidth
                          {...register("emailUsuario", {
                            required: watch("enviarEmail") ? "E-mail é obrigatório" : false,
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "E-mail inválido",
                            },
                          })}
                          error={!!errors.emailUsuario}
                        />
                        <Button
                          variant="contained"
                          onClick={() => {
                            const emailValue = watch("emailUsuario");
                            if (!emailValue || emailValue.trim() === "") {
                              showAlert("Por favor, informe seu e-mail", "error");
                              return;
                            }
                            if (errors.emailUsuario) {
                              showAlert("Por favor, informe um e-mail válido", "error");
                              return;
                            }
                            enviarEmail(resultadoPF, resultadoPJ);
                          }}
                          sx={{ bgcolor: colors.redAccent[500], whiteSpace: "nowrap" }}
                        >
                          Enviar
                        </Button>
                      </Box>
                    </Grow>
                  </Box>
                </Box>
              )}

              <Collapse in={alertVisible} sx={{ mt: 2 }}>
                <Alert severity={alertSeverity} onClose={() => setAlertVisible(false)}>{alertMessage}</Alert>
              </Collapse>
            </Box>
          </Box>
        </Grow>
      </Modal>
    </div>
  );
};

export default ModalComparacaoAdv;
