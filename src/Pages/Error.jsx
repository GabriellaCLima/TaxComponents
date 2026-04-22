import { Box, Typography } from "@mui/material";

// Página de erro 404 para rotas não encontradas
const Error = () => {
    return (
        <Box>
            <Typography variant="h4" align="center" sx={{ p: 2, mt: 4 }}>
                ERROR 404 - Página não encontrada!
            </Typography>
        </Box>
    )
}
export default Error;