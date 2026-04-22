import { useState } from "react"; 
import {
  Backdrop,
  Box,
  Fade, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Button,
  Link,
  useTheme
} from "@mui/material";
import { tokens } from "../../Tema";
import GoBack from "../GoBack";

const ModalTabelaTributacao = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90vw", md: 800 },
    bgcolor: colors.primary[500],
    border: `2px solid ${colors.blueAccent[500]}`,
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "80vh",
    maxWidth: "90vw",
    overflowY: "auto",
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Link
        onClick={handleOpen} 
        sx={{
          color: colors.blueAccent[500],
          "&:hover": { color: colors.blueAccent[600] },
          textDecoration: "underline",
          cursor: "pointer", // Adicionado para melhor usabilidade
        }}
      >
        Tabela Progressiva de Tributação
      </Link>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 1000,
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: colors.grey[100],
                fontWeight: 600,
                mb: 3,
                textAlign: "center",
              }}
            >
              Tabela Progressiva de Tributação
            </Typography>
            <Button
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                ml: 1,
                bgcolor: "transparent",
                // quando passar o mouse, colore qualquer SVG dentro do Button (ícone do GoBack)
                "&:hover svg": {
                  color: colors.redAccent[400],
                },
              }}
            >
              <GoBack />
            </Button>
            <Box sx={{ mb: 4 }}>
              <TableContainer
                component={Paper}
                sx={{ maxWidth: 700, mx: "auto", my: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Base do Cálculo (R$)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Alíquota (%)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Parcela a Deduzir do IR (R$)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">Até 2.428,80</TableCell>
                      <TableCell align="center">0</TableCell>
                      <TableCell align="center">0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center">
                        De 2.428,81 até 2.826,65
                      </TableCell>
                      <TableCell align="center">7,5</TableCell>
                      <TableCell align="center">182,16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center">
                        De 2.826,66 até 3.751,05
                      </TableCell>
                      <TableCell align="center">15</TableCell>
                      <TableCell align="center">394,16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center">
                        De 3.751,06 até 4.664,68
                      </TableCell>
                      <TableCell align="center">22,5</TableCell>
                      <TableCell align="center">675,49</TableCell>
                    </TableRow>
                    <TableRow>
                      {" "}
                      {/* Juntado em um único TableBody */}
                      <TableCell align="center">Acima de 4.664,68</TableCell>
                      <TableCell align="center">27,5</TableCell>
                      <TableCell align="center">908,73</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default ModalTabelaTributacao;
