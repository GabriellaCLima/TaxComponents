import { Box, Typography, useTheme } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email";
import { tokens } from "../Tema";

const Footer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      component="footer"
      // ESTILIZAÇÃO DO FOOTER
      sx={{
        display: "flex", // Layout flex
        flexDirection: "column", // Direção vertical
        justifyContent: "center", // Centraliza verticalmente
        alignItems: "center", // Centraliza horizontalmente
        width: "100%", // Ocupa toda a largura
        p: 2, // Padding de 2
        gap: 1, // Espaçamento entre elementos
        borderTop: "1px solid gray", // Borda superior cinza
        mt: "auto", // Importante para funcionar com flexbox
      }}
    >
      {/* COPYRIGHT */}
      <Typography
        variant="body2"
        sx={{
          color: colors.grey[100], // Texto claro
          display: "flex",
          alignItems: "center",
          gap: 1, // Espaçamento entre símbolo e texto
        }}
      >
        {"© "}
        NAF - Núcleo de Apoio Fiscal da Unichristus {new Date().getFullYear()}
        {"."}
      </Typography>
      
      {/* E-MAIL DE CONTATO */}
      <Typography
        variant="body1"
        sx={{
          color: colors.grey[100], // Texto claro
          display: "flex",
          alignItems: "center",
          gap: 1, // Espaçamento entre ícone e texto
        }}
      >
        <EmailIcon />
        naf01.dl@unichristus.edu.br
      </Typography>
    </Box>
  );
};
export default Footer;
