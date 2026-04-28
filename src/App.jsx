import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./Tema";
import Home from "./Pages/Página Inicial/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import CalculoPF from "./Pages/Cálculos/CalculoPF";
import CalculoPJ from "./Pages/Cálculos/CalculoPJ";
import CalculadoraTributaria from "./Pages/Cálculos/CalculadoraTributaria";
import Explicacao from "./Pages/Explicação/Explicacao";
import PageLayout from "./Layout/PageLayout";
import Esqueci from "./Pages/Esqueci a senha/Esqueci";
import Contatos from "./Pages/Contatos";
import Error from "./Pages/Error";
import CircularProgress from '@mui/material/CircularProgress';
import AuthGuard from "./Components/AuthGuard";
import CalculoPJAdvogado from "./Pages/Cálculos/CalculoPJAdv";

function App() {
  // Hook personalizado para obter tema e função de alternância de modo
  const [theme, colorMode] = useMode();
  
  // Estado para controlar carregamento inicial da aplicação
  const [isLoading, setIsLoading] = React.useState(true);

  // Effect para garantir que o tema foi carregado antes de renderizar
  React.useEffect(() => {
    // Pequeno atraso para garantir que o tema foi carregado
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Exibe loading enquanto inicializa
  if (isLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="app">
            <main className="content">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login/forgot" element={<Esqueci />} />
                <Route path="*" element={<Error />} />
                <Route element={<PageLayout />}>
                  <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
                  <Route path="/calculadora" element={<AuthGuard><CalculadoraTributaria /></AuthGuard>} />
                  <Route path="/calculopf" element={<AuthGuard><CalculoPF /></AuthGuard>} />
                  <Route path="/calculopj" element={<AuthGuard><CalculoPJ /></AuthGuard>} />

                  <Route path="/calculopjadv" element={<AuthGuard><CalculoPJAdvogado /></AuthGuard>} />
                  <Route path="/tributacao" element={<AuthGuard><Explicacao /></AuthGuard>} />
                  <Route path="/contatos" element={<AuthGuard><Contatos /></AuthGuard>} />
                </Route>
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
