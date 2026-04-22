import { create } from "zustand";
import { persist } from "zustand/middleware";

// Utiliza persistência no localStorage para manter a preferência do usuário 
const useThemeStore = create(
  persist(
    (set) => ({
      // Estado inicial do tema
      mode: "dark",
      
      // Action para definir o modo específico (light ou dark)
      setMode: (mode) => set({ mode }),
      
      // Action para alternar entre light e dark mode
      toggleMode: () =>
        set((state) => ({ 
          mode: state.mode === "light" ? "dark" : "light" 
        })),
    }),
    {
      // Nome da chave no localStorage onde os dados serão persistidos
      name: "theme-storage",
    }
  )
);

export default useThemeStore;