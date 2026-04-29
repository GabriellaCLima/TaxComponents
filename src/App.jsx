import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./Tema";
// Importações de Páginas Gerais
import Home from "./Pages/Página Inicial/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Esqueci from "./Pages/Esqueci a senha/Esqueci";
import Contatos from "./Pages/Contatos";
import Explicacao from "./Pages/Explicação/Explicacao";
import Error from "./Pages/Error";
// Importações dos Cálculos Padrão (Psicólogo)
import CalculoPF from "./Pages/Cálculos/CalculoPF";
import CalculoPJ from "./Pages/Cálculos/CalculoPJ";
import CalculadoraTributaria from "./Pages/Cálculos/CalculadoraTributaria";
// Importações dos Cálculos Específicos (Advogados)
import CalculoPFAdv from "./Pages/Cálculos/CalculoPFAdv";
import CalculoPJAdv from "./Pages/Cálculos/CalculoPJAdv";
import CalculadoraTributariaAdv from "./Pages/Cálculos/CalculadoraTributariaAdv";
// Importações dos Cálculos Específicos (Arquitetos)
import CalculoPFArq from "./Pages/Cálculos/CalculoPFArq";
import CalculoPJArq from "./Pages/Cálculos/CalculoPJArq";
import CalculadoraTributariaArq from "./Pages/Cálculos/CalculadoraTributariaArq";
import PageLayout from "./Layout/PageLayout";
import CircularProgress from "@mui/material/CircularProgress";
import AuthGuard from "./Components/AuthGuard";
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="app">
            <main className="content">
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login/forgot" element={<Esqueci />} />
                <Route path="*" element={<Error />} />
                {/* Rotas Privadas (dentro do PageLayout) */}
                <Route element={<PageLayout />}>
                  <Route
                    path="/home"
                    element={
                      <AuthGuard>
                        <Home />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/tributacao"
                    element={
                      <AuthGuard>
                        <Explicacao />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/contatos"
                    element={
                      <AuthGuard>
                        <Contatos />
                      </AuthGuard>
                    }
                  />
                  {/* Rotas de Cálculo Padrão (Psicólogos) */}
                  <Route
                    path="/calculadora"
                    element={
                      <AuthGuard>
                        <CalculadoraTributaria />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calculopf"
                    element={
                      <AuthGuard>
                        <CalculoPF />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calculopj"
                    element={
                      <AuthGuard>
                        <CalculoPJ />
                      </AuthGuard>
                    }
                  />
                  {/* Rotas de Cálculo Específicas (Advogados) */}
                  <Route
                    path="/calculadoraadv"
                    element={
                      <AuthGuard>
                        <CalculadoraTributariaAdv />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calculopfadv"
                    element={
                      <AuthGuard>
                        <CalculoPFAdv />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calculopjadv"
                    element={
                      <AuthGuard>
                        <CalculoPJAdv />
                      </AuthGuard>
                    }
                  />
                  {/* Rotas de Cálculo Específicas (Arquitetos) */}
                  <Route
                    path="/calculadoraarq"
                    element={
                      <AuthGuard>
                        <CalculadoraTributariaArq />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calculopfarq"
                    element={
                      <AuthGuard>
                        <CalculoPFArq />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calculopjarq"
                    element={
                      <AuthGuard>
                        <CalculoPJArq />
                      </AuthGuard>
                    }
                  />
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