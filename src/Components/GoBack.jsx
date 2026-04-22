import { IconButton, useTheme } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from "../Tema";

// Componente de ícone de fechar/voltar usado nos modais
const GoBack = () => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    return (
        <div>
                < CloseIcon 
                // ESTILIZAÇÃO DO ÍCONE
                sx={{
                    color: colors.grey[100], // Cor padrão
                    "&: hover": {
                        color:colors.redAccent[100], // Vermelho no hover
                    }
                }}/>
        </div>
    )
}
export default GoBack;