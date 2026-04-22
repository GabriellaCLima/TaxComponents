import { useState } from "react";
import { Box, Button, Modal, Typography, Backdrop, Link, Paper, Grow, useTheme } from "@mui/material"
import { tokens } from "../../Tema";
import { useNavigate } from "react-router-dom";
import ModalTabelaTributacao from "./ModalTabelaTributacao";
import GoBack from "../GoBack";
import HelpIcon from '@mui/icons-material/Help';

const ModalExplicacoes = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // CONTROLE DE ESTADO DO MODAL
  const [open, setOpen] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  const navigate = useNavigate();

  // HANDLER PARA ABRIR O MODAL
  const handleOpen = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // CALCULA ORIGEM DA ANIMAÇÃO BASEADA NA POSIÇÃO DO BOTÃO
    const origin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    setTransformOrigin(origin);
    setOpen(true);
  };

  // HANDLER PARA FECHAR O MODAL
  const handleClose = () => setOpen(false);

  // ESTILOS DO MODAL
  const style = {
    width: { xs: "90vw", md: 800 }, // Responsivo: 90% da viewport no mobile, 800px no desktop
    bgcolor: colors.primary[500], // Cor de fundo do tema
    border: `2px solid ${colors.blueAccent[500]}`, // Borda azul de destaque
    boxShadow: 24, // Sombra elevada
    p: 4, // Padding interno
    borderRadius: 2, // Bordas arredondadas
    maxHeight: "80vh", // Altura máxima de 80% da viewport
    maxWidth: "90vw", // Largura máxima de 90% da viewport
    overflowY: "auto", // Scroll vertical se necessário
    zIndex: 1300, // Z-index alto para sobrepor outros elementos
    position: "relative", // Posição relativa para elementos filhos absolutos
  };

  return (
    <div>
      {/* BOTÃO QUE ABRE O MODAL EXPLICATIVO */}
      <Button
        onClick={handleOpen}
        size="large"
        startIcon={<HelpIcon />} // Ícone de ajuda/interrogação
        sx={{
          color: colors.grey[900], // Texto escuro para contraste
          backgroundColor: colors.redAccent[500], // Fundo vermelho
          fontSize: "1.1rem", // Tamanho de fonte aumentado
          px: 2, // Padding horizontal
          py: 1, // Padding vertical
          // ANIMAÇÕES E TRANSITIONS
          transition: "all 0.3s ease-in-out", // Transição suave para todas as propriedades
          transitionDelay: "30ms", // Pequeno delay para suavidade
          // ESTILO NORMAL
          transform: "translateY(0) scale(1)", // Posição e escala normais
          // EFEITO HOVER
          "&:hover": {
            backgroundColor: colors.redAccent[600], // Tom mais escuro no hover
            transform: "translateY(-4px) scale(1.02)", // Levanta e aumenta levemente
            boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3)`, // Sombra mais pronunciada
          },
        }}
      >
        Como são feitos os cálculos
      </Button>

      {/* MODAL PRINCIPAL */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition // Fecha após a transição terminar
        slots={{ backdrop: Backdrop }} // Usa Backdrop padrão do Material-UI
        slotProps={{
          backdrop: {
            timeout: 300, // Timeout para animação do backdrop
            sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" }, // Backdrop escuro semi-transparente
          },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // Centraliza o modal na tela
        }}
      >
        {/* ANIMAÇÃO GROW */}
        <Grow in={open} timeout={400} style={{ transformOrigin }}>
          <Box sx={style}>
            {/* TÍTULO DO MODAL */}
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: colors.grey[100], // Texto claro
                fontWeight: 600, // Negrito
                mb: 2 // Margem inferior
              }}
            >
              Como são feitos os cálculos?
            </Typography>
            
            {/* BOTÃO FECHAR MODAL */}
            <Button
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 16,
                right: 16, // Canto superior direito
                ml: 1,
                bgcolor: "transparent", // Fundo transparente
                "&:hover svg": {
                  color: colors.redAccent[400], // Cor vermelha no hover do ícone
                },
              }}
            >
              <GoBack /> {/* Componente de ícone de voltar/fechar */}
            </Button>

            {/* SEÇÃO DE RESUMO DOS CÁLCULOS */}
            <Box sx={{ mb: 4 }}>
              <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.primary[500] }}>
                {/* TÍTULO DA SEÇÃO */}
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: colors.greenAccent[400] }} // Verde para destaque positivo
                >
                   Resumo dos Cálculos
                </Typography>

                {/* SEÇÃO PESSOA FÍSICA */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: colors.blueAccent[300] }} // Azul para PF
                  >
                    PESSOA FÍSICA (PF)
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}> {/* Lista não ordenada */}
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          Base de Cálculo:
                        </Box>{" "}
                        Renda Mensal - Custos Mensais
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap", // Quebra de linha em telas pequenas
                          gap: 0.5, // Espaço entre elementos
                        }}
                      >
                        <Typography component="span" fontWeight="bold">
                          Consulta na
                        </Typography>
                        {/* MODAL DA TABELA DE TRIBUTAÇÃO (EMBUTIDO) */}
                        <ModalTabelaTributacao />
                        <Typography component="span">
                          para identificar a faixa correspondente
                        </Typography>
                      </Box>
                    </Box>
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          Fórmula:
                        </Box>{" "}
                        (Base de Cálculo × Alíquota) - Parcela a Deduzir
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* SEÇÃO PESSOA JURÍDICA */}
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: colors.blueAccent[300] }} // Azul para PJ também
                  >
                    PESSOA JURÍDICA (PJ)
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          Pró-labore:
                        </Box>{" "}
                        MAIOR valor entre (28% da Renda) e (Salário Mínimo)
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          Simples Nacional:
                        </Box>{" "}
                        6% sobre a Renda Mensal total
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          INSS:
                        </Box>{" "}
                        11% sobre o valor do pró-labore
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          IR sobre pró-labore:
                        </Box>{" "}
                        Aplica tabela da PF (se houver tributação)
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography>
                        <Box component="span" fontWeight="bold">
                          Total PJ:
                        </Box>{" "}
                        Simples Nacional + INSS + IR (se aplicável)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* SEÇÃO DE NAVEGAÇÃO PARA MAIS INFORMAÇÕES */}
            <Box
              id="descricao"
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            >
              <Typography variant="body1" sx={{ color: colors.grey[100] }}>
                Para mais informações, acesse a página de{" "}
                <Link
                  onClick={() => navigate("/detalhes")} // Navega para página de detalhes
                  sx={{
                    cursor: "pointer",
                    color: colors.blueAccent[500],
                    "&:hover": { color: colors.blueAccent[600] },
                    textDecoration: "underline",
                  }}
                >
                  Detalhes
                </Link>{" "}
                ou{" "}
                <Link
                  onClick={() => navigate("/contatos")} // Navega para página de contatos
                  sx={{
                    cursor: "pointer",
                    color: colors.blueAccent[500],
                    "&:hover": { color: colors.blueAccent[600] },
                    textDecoration: "underline",
                  }}
                >
                  entre em contato conosco
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grow>
      </Modal>
    </div>
  );
};

export default ModalExplicacoes;