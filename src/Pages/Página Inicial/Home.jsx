import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack } from "@mui/material";
import ModalCalculoPF from "../../Components/Modals/ModalCalculoPF";
import ModalCalculoPJ from "../../Components/Modals/ModalCalculoPJ";
import ModalExplicacoes from "../../Components/Modals/ModalExplicacoes";
import ModalComparacao from "../../Components/Modals/ModalComparacao";

const Home = () => {
  // Obtém nome do usuário do store global
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("useEffect esta rodando")
    const userData = localStorage.getItem('user');

    console.log('userData: ', userData);
    console.log('userData: ', userData);

    
    console.log("Usuario autenticado!")
    setUser(JSON.parse(userData));

  }, [navigate]);

  const displayName = user?.username || "Visitante";
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
        Compare a tributação entre Pessoa Física e Pessoa Jurídica para profissionais de psicologia
      </Typography>

      {/* SEÇÃO DA CALCULADORA COMPARATIVA */}
      <Box sx={{ mb: 5 }}>
        < ModalComparacao />
        <Typography
          sx={{
            mt: 3,
            fontSize: "18px" // Tamanho de fonte
          }}
        >
          Calcule e compare PF x PJ em uma única página
        </Typography>
      </Box>

      {/* SEÇÃO DE CALCULADORAS INDIVIDUAIS */}
      <Typography variant="body1" sx={{ mb: 2, fontSize: "18px" }}>
        Ou escolha uma modalidade específica:
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
        >
          <ModalCalculoPF />
          <ModalCalculoPJ />
        </Stack>
        
        {/* TEXTO DE DÚVIDAS */}
        <Typography sx={{ pt: 5, fontSize: "18px" }}>
          Dúvidas sobre os cálculos?
        </Typography>
        
        {/* BOTÃO DE EXPLICAÇÕES */}
        <ModalExplicacoes />
      </Stack>
    </Box>
  );
};

export default Home;
