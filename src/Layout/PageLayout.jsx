import { Outlet } from "react-router-dom";
import Topbar from "../Components/Topbar";
import Footer from "../Components/Footer";

// Layout padrão para páginas protegidas da aplicação
const PageLayout = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // altura total da tela
      }}
    >
      {/* Barra de navegação superior */}
      <Topbar />
      {/* Conteúdo da página renderizado pelo router */}
      <div style={{ flex: 1 }}> {/* ocupa o espaço restante */}
        <Outlet />
      </div>
      {/* Rodapé da aplicação */}
      <Footer />
    </div>
  );
};

export default PageLayout;
