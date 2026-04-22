import { Tooltip, IconButton, useTheme } from "@mui/material";
import Info from "@mui/icons-material/Info";
import { tokens } from "../Tema";

// Componente de tooltip explicativo sobre Custos Mensais
const CustosTooltip = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Tooltip
      title="É o valor que você espera receber por mês com o seu trabalho.
                No caso da psicologia, pode ser o total recebido das consultas,
                atendimentos ou serviços prestados, antes de descontar as
                despesas."
      arrow
      placement="right"
      // ESTILIZAÇÃO DO TOOLTIP
      sx={{
        "& .MuiTooltip-tooltip": {
          fontSize: "0.875rem", // Tamanho de fonte
          maxWidth: 350, // Largura máxima
          backgroundColor: colors.primary[400], // Fundo
          color: colors.grey[100], // Texto
          padding: 2, // Padding interno
        },
      }}
    >
      <IconButton size="small">
        <Info fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default CustosTooltip;
