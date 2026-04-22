import { Button, useTheme } from "@mui/material";
import { tokens } from "../Tema";

// Componente reutilizável de botão com estilização personalizada
const ButtonUsage = ({ children, disabled = false, ...props }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    return (
        <Button
            {...props}
            disabled={disabled} 
            variant="contained"
            // ESTILIZAÇÃO DO BOTÃO
            sx={{
                width: "100%", // Ocupa toda a largura disponível
                backgroundColor: disabled 
                    ? colors.grey[600] // Cinza quando desabilitado
                    : colors.redAccent[500], // Vermelho quando ativo
                color: colors.grey[900], // Texto escuro
                paddingTop: "0.375rem", // Padding superior
                paddingBottom: "0.375rem", // Padding inferior
                marginTop: "0.5rem", // Margem superior
                borderRadius: "8px", // Bordas arredondadas
                transition: "all 0.2s ease-in-out", // Transição suave
                fontWeight: 600, // Fonte semi-negrito
                textTransform: "none", // Sem transformação de texto
                fontSize: "1rem", // Tamanho de fonte
                "&:hover": {
                    backgroundColor: disabled 
                      ? colors.grey[600] // Mantém cinza se desabilitado
                      : colors.blueAccent[600], // Azul no hover
                    transform: disabled ? "none" : "translateY(-1px)", // Levanta levemente
                },
                "&:active": {
                    transform: "translateY(0)", // Retorna ao normal ao clicar
                },
            }}
        >
            {children}
        </Button>
    )
}
export default ButtonUsage;