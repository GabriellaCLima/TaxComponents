import { useTheme, Box, Typography, Paper, Stack } from "@mui/material";
import { tokens } from "../../Tema";
import TabelaTributacao from "../../Components/TabelaTributacao";

// Página de explicações sobre tributação e como funcionam os cálculos
const Explicacao = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box py={6}>
      <Typography variant="h1" fontWeight="bold" align="center" gutterBottom>
        Sobre a tributação:
      </Typography>
      <Typography variant="h6" px={6} py={3} align="center">
        A tributação serve primariamente para financiar o Estado e suas
        atividades essenciais, como saúde, educação, segurança, infraestrutura e
        outros serviços públicos. Além disso, ela funciona como uma ferramenta
        de redistribuição de renda, na qual os cidadãos e empresas de maior
        renda contribuem proporcionalmente mais, ajudando a reduzir
        desigualdades sociais. Os tributos também podem ser utilizados para
        regular a economia, estimulando ou desestimulando setores e
        comportamentos, como o consumo de produtos nocivos ou a poluição
        ambiental. Em essência, a tributação é o mecanismo que viabiliza o
        funcionamento do Estado e a promoção do bem-estar coletivo.{" "}
      </Typography>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        py={4}
        mx={3}
        justifyContent="center"
      >
        <Paper
          variant="outlined"
          elevation={4}
          sx={{ p: 3, minWidth: 280, backgroundColor: colors.primary[200] }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Renda Mensal:
          </Typography>
          <Typography>
            "É o valor que você espera receber por mês com o seu trabalho. No
            caso da psicologia, pode ser o total recebido das consultas,
            atendimentos ou serviços prestados, antes de descontar as despesas."
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 3, minWidth: 280, backgroundColor: colors.primary[200] }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Custos Mensais:
          </Typography>
          <Typography>
            "São os gastos mensais necessários para o seu trabalho acontecer,
            escritório, entre outros. Essas despesas podem ser usadas para
            reduzir a base de cálculo do imposto (no caso da pessoa física)."
          </Typography>
        </Paper>
      </Stack>
      <Box>
        <Typography variant="h5" fontWeight="bold" align="center" py={2}>
          Tabela mensal do Imposto de Renda
        </Typography>
        <Typography variant="h6" align="center" py={1}>
          Tabela Progressiva Mensal
        </Typography>
        < TabelaTributacao />
      </Box>
      <Box>
        <Typography variant="h5" fontWeight="bold" align="center" py={2}>
          Como são realizadas as contas?
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mx: { xs: 0, md: 6 },
            my: 3,
            backgroundColor: colors.primary[200],
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            align="center"
          >
            Para Pessoa Física:
          </Typography>
          <Box px={2}>
            <Typography mb={2}>
              Vamos entender por meio de um exemplo:
            </Typography>

            <Typography fontWeight="bold" gutterBottom>
              Dados de entrada exemplo:
            </Typography>
            <Typography>• Renda mensal: R$ 3.000,00</Typography>
            <Typography>• Custos mensais: R$ 750,00</Typography>

            <Typography fontWeight="bold" gutterBottom mt={2}>
              Cálculos realizados:
            </Typography>

            <Box component="ul" pl={2}>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Base de cálculo:
                  </Box>{" "}
                  Renda mensal - Custos mensais
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Consulta na tabela:
                  </Box>{" "}
                  Verificar em qual faixa se enquadra a base
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Cálculo do imposto:
                  </Box>{" "}
                  (Base × Alíquota) - Parcela a deduzir
                </Typography>
              </Box>
            </Box>

            <Typography fontWeight="bold" gutterBottom mt={2}>
              Exemplo prático com R$ 3.000,00 de renda e R$ 750,00 de custos:
            </Typography>

            <Box component="ul" pl={2}>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Base de cálculo:
                  </Box>{" "}
                  R$ 3.000,00 - R$ 750,00 ={" "}
                  <Box component="span" fontWeight="bold">
                    R$ 2.250,00
                  </Box>
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Consulta na tabela:
                  </Box>{" "}
                  Base de R$ 2.250,00 se enquadra na faixa "Até 2.428,80"
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Resultado:
                  </Box>{" "}
                  <Box
                    component="span"
                    fontWeight="bold"
                    sx={{ color: colors.greenAccent[500] }}
                  >
                    ISENTO de Imposto de Renda
                  </Box>
                </Typography>
              </Box>
            </Box>

            <Typography fontWeight="bold" gutterBottom mt={2}>
              Exemplo com base tributável de R$ 3.000,00:
            </Typography>

            <Box component="ul" pl={2}>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Base de cálculo:
                  </Box>{" "}
                  R$ 3.000,00
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Faixa enquadrada:
                  </Box>{" "}
                  "De 2.826,66 até 3.751,05"
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Alíquota:
                  </Box>{" "}
                  15%
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Parcela a deduzir:
                  </Box>{" "}
                  R$ 394,16
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Cálculo:
                  </Box>{" "}
                  (R$ 3.000,00 × 15%) - R$ 394,16
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box
                    component="span"
                    fontWeight="bold"
                    sx={{ color: colors.greenAccent[500] }}
                  >
                    Total a pagar:
                  </Box>{" "}
                  R$ 450,00 - R$ 394,16 ={" "}
                  <Box component="span" fontWeight="bold">
                    R$ 55,84
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mx: { xs: 0, md: 6 },
            my: 3,
            backgroundColor: colors.primary[200],
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            align="center"
          >
            Para Pessoa Jurídica:
          </Typography>
          <Box px={2}>
            <Typography mb={2}>
              <Box
                component="span"
                fontWeight="bold"
                sx={{ color: colors.blueAccent[100] }}
              >
                Observação:
              </Box>{" "}
              Nesse cenário, vamos apresentar o cálculo com menor carga
              tributária para o limite de R$ 180.000 anual (por isso o limite de
              R$ 15.000 mensal).
            </Typography>

            <Typography fontWeight="bold" gutterBottom>
              Dados de entrada exemplo:
            </Typography>
            <Typography>• Renda mensal: R$ 3.000,00</Typography>

            <Typography fontWeight="bold" gutterBottom mt={2}>
              Cálculos realizados:
            </Typography>

            <Box component="ul" pl={2}>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Alíquota Simples Nacional (Anexo III):
                  </Box>{" "}
                  6% sobre a renda
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    INSS Pró-labore:
                  </Box>{" "}
                  11% sobre o salário
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Valor do Salário (pró-labore):
                  </Box>{" "}
                  28% da renda mensal ou salário mínimo quando 28% for menor que
                  R$ 1.518,00
                </Typography>
              </Box>
            </Box>

            <Typography fontWeight="bold" gutterBottom mt={2}>
              Exemplo prático com R$ 3.000,00:
            </Typography>

            <Box component="ul" pl={2}>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Renda mensal:
                  </Box>{" "}
                  R$ 3.000,00
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    28% da Renda:
                  </Box>{" "}
                  R$ 840,00
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Salário mínimo (pró-labore):
                  </Box>{" "}
                  R$ 1.518,00 (utilizado pois 28% do faturamento foi inferior)
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    Simples Nacional (6%):
                  </Box>{" "}
                  R$ 180,00
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box component="span" fontWeight="bold">
                    INSS pró-labore (11%):
                  </Box>{" "}
                  R$ 166,98 (11% sobre o salário mínimo)
                </Typography>
              </Box>
              <Box component="li" mb={1}>
                <Typography>
                  <Box
                    component="span"
                    fontWeight="bold"
                    sx={{ color: colors.greenAccent[500] }}
                  >
                    Total a pagar:
                  </Box>{" "}
                  R$ 180,00 + R$ 166,98 ={" "}
                  <Box component="span" fontWeight="bold">
                    R$ 346,98
                  </Box>
                </Typography>
              </Box>
            </Box>

            <Typography mt={2} fontStyle="italic">
              <Box component="span" fontWeight="bold">
                Conclusão:
              </Box>{" "}
              Se um psicólogo espera iniciar a carreira com uma renda de R$
              3.000,00, é mais vantajoso permanecer como pessoa física. Além
              disso, a PJ terá outros custos como a contabilidade (obrigatória)
              que não estão incluídos neste cálculo.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Explicacao;
