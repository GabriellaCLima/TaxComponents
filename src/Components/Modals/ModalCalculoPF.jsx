import { useState } from "react";
import { Box, Button, Modal, Typography, Backdrop, useTheme, Grow, IconButton } from "@mui/material"
import CalculoPF from "../../Pages/Cálculos/CalculoPF";
import { tokens } from "../../Tema";
import GoBack from "../GoBack";
import PersonIcon from '@mui/icons-material/Person';

// Modal que exibe calculadora de tributação para Pessoa Física
const ModalCalculoPF = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    // CONTROLE DE ESTADO DO MODAL
    const [open, setOpen] = useState(false);
    const [transformOrigin, setTransformOrigin] = useState('center center');

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
            {/* BOTÃO QUE ABRE O MODAL */}
            <Button
                onClick={handleOpen}
                size="large"
                startIcon={<PersonIcon />} // Ícone de pessoa
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
                    '&:hover': {
                        backgroundColor: colors.redAccent[600], // Tom mais escuro no hover
                        transform: "translateY(-4px) scale(1.02)", // Levanta e aumenta levemente
                        boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3)`, // Sombra mais pronunciada
                    },
                }}
            >
                Pessoa Física (PF)
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
                <Grow
                    in={open}
                    timeout={400} // Duração da animação
                    style={{ transformOrigin }} // Origem personalizada da animação
                >
                    <Box sx={style}>
                        {/* TÍTULO DO MODAL */}
                        <Typography
                            id="tituloModalPJ"
                            variant="h5"
                            component="h2"
                            sx={{
                                color: colors.grey[100], // Texto claro
                                fontWeight: 600, // Negrito
                                mb: 2 // Margem inferior
                            }}
                        >
                            Calcular Tributação de Pessoa Física
                        </Typography>
                        
                        {/* BOTÃO FECHAR MODAL */}
                        <IconButton
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
                        </IconButton>
                        
                        {/* COMPONENTE DE CÁLCULO PF */}
                        <CalculoPF />
                    </Box>
                </Grow>
            </Modal>
        </div>
    )
}

export default ModalCalculoPF;