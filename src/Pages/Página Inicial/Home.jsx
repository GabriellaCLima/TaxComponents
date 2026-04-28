import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack, Paper } from "@mui/material";
import ModalCalculoPF from "../../Components/Modals/ModalCalculoPF";
import ModalCalculoPJ from "../../Components/Modals/ModalCalculoPJ";
import ModalComparacao from "../../Components/Modals/ModalComparacao";
import ModalCalculoPFAdv from "../../Components/Modals/ModalCalculoPFAdv";
import ModalCalculoPJAdv from "../../Components/Modals/ModalCalculoPJAdv";
import ModalComparacaoAdv from "../../Components/Modals/ModalComparacaoAdv";
import ModalExplicacoes from "../../Components/Modals/ModalExplicacoes";
import { tokens } from "../../Tema";
import { useTheme } from "@mui/material/styles";

const Home = () => {
  // Obtém nome do usuário do store global
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("useEffect esta rodando")
    const userData = localStorage.getItem('user');

    console.log('userData: ', userData);
    
    console.log("Usuario autenticado!")
    if (userData) {
      setUser(JSON.parse(userData));
    }

  }, [navigate]);

  const displayName = user?.username || "Visitante";
  const profissao = user?.profissao || "";

  // Lógica para definir qual botão de Comparação mostrar com base na profissão
  const renderBotaoComparacao = () => {
    if (profissao === "Advogado") {
      return <ModalComparacaoAdv />;
    }
    // Para Psicólogos, Arquitetos ou outros
    return <ModalComparacao />;
  };

  // Lógica para definir qual botão PF mostrar com base na profissão
  const renderBotaoPF = () => {
    if (profissao === "Advogado") {
      return <ModalCalculoPFAdv />;
    }
    // Para Psicólogos, Arquitetos ou outros
    return <ModalCalculoPF />;
  };

  // Lógica para definir qual botão PJ mostrar com base na profissão
  const renderBotaoPJ = () => {
    if (profissao === "Advogado") {
      return <ModalCalculoPJAdv />;
    }
    // Para Psicólogos, Arquitetos ou outros
    return <ModalCalculoPJ />;
  };

  return (
    <Box
      // ESTILIZAÇÃO DO CONTAINER PRINCIPAL
      sx={{
        mx: "auto", // margin inline auto
        px: 4, // Padding horizontal de 4
        textAlign: "center", // Centraliza texto
      }}
    >
      {/* TÍTULO DE BOAS-VINDAS */}
      <Typography
        variant="h3"
        component="h1"
        fontWeight="bold"
        gutterBottom
      >
        Bem-vindo(a), {displayName}, à sua Calculadora de Tributação
      </Typography>

      {/* SUBTÍTULO DESCRITIVO */}
      <Typography variant="body1" sx={{ mb: 4, fontSize: "18px" }}>
        Compare a tributação entre Pessoa Física e Pessoa Jurídica para profissionais de {profissao ? profissao.toLowerCase() : "sua área"}
      </Typography>

      {/* SEÇÃO DA CALCULADORA COMPARATIVA */}
      <Box sx={{ mb: 5 }}>
        {renderBotaoComparacao()}
        <Typography
          sx={{
            mt: 3,
            fontSize: "18px" // Tamanho de fonte
          }}
        >
          Calcule e compare PF x PJ em uma única página
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 4, backgroundColor: colors.primary[400], borderRadius: 4 }}>
        {/* SEÇÃO DE CALCULADORAS INDIVIDUAIS */}
        <Typography variant="body1" sx={{ mb: 3, fontSize: "18px", fontWeight: 'bold' }}>
          Ou escolha uma modalidade específica para detalhamento:
        </Typography>
        
        {/* STACK VERTICAL COM OPÇÕES */}
        <Stack
          direction="column" // Disposição vertical
          spacing={3} // Espaçamento entre elementos
          alignItems="center" // Alinha ao centro
          justifyContent="center"
        >
          {/* STACK HORIZONTAL COM BOTÕES PF E PJ */}
          <Stack
            direction="row" // Disposição horizontal
            spacing={4} // Espaçamento entre botões
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={2}
          >
            {/* Renderização dinâmica dos botões conforme a profissão do usuário */}
            {renderBotaoPF()}
            {renderBotaoPJ()}
          </Stack>
          
          {/* TEXTO DE DÚVIDAS */}
          <Typography sx={{ pt: 5, fontSize: "18px" }}>
            Dúvidas sobre como os cálculos de {profissao ? profissao.toLowerCase() : "sua área"} são feitos?
          </Typography>
          
          {/* BOTÃO DE EXPLICAÇÕES */}
          <ModalExplicacoes />
        </Stack>
      </Paper>
    </Box>
  );
};

export default Home;