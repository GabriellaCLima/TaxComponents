import { tokens } from "../Tema";

// Estilos padronizados para inputs do formulário
export const getInputStyles = (theme) => {
  const t = tokens(theme.palette.mode);
  const c = {
    input: {
      background: t.primary[500],
      border: t.grey[300] || t.grey[500],
      borderHover: t.blueAccent?.[500] || t.blueAccent[400],
      borderFocus: t.blueAccent?.[500] || t.blueAccent[400],
      text: theme.palette.mode === "dark" ? t.grey[100] : t.grey[900],
      label: t.grey[500],
      labelFocus: t.blueAccent?.[500],
      helper: t.grey[500],
    },
  };
  return {
    "& .MuiOutlinedInput-root": {
      backgroundColor: c.input.background,
      "& fieldset": {
        borderColor: c.input.border
      },
      "&:hover fieldset": {
        borderColor: c.input.borderHover
      },
      "&.Mui-focused fieldset": {
        borderColor: c.input.borderFocus
      }
    },
    "& .MuiInputLabel-root": {
      color: c.input.label,
      "&.Mui-focused": {
        color: c.input.labelFocus
      }
    },
    "& .MuiOutlinedInput-input": {
      color: c.input.text
    },
    "& .MuiFormHelperText-root": {
      color: c.input.helper
    }
  };
};

export const getSelectStyles = (theme) => {
  const t = tokens(theme.palette.mode);
  const c = {
    input: {
      background: t.primary[500],
      border: t.grey[300] || t.grey[500],
      borderHover: t.blueAccent?.[500] || t.blueAccent[400],
      borderFocus: t.blueAccent?.[500] || t.blueAccent[400],
      text: theme.palette.mode === "dark" ? t.grey[100] : t.grey[900],
    },
  };
  return {
    backgroundColor: c.input.background,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: c.input.border
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: c.input.borderHover
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: c.input.borderFocus
    },
    "& .MuiSelect-select": {
      color: c.input.text
    }
  };
};

export const getPaperStyles = (theme) => {
  const t = tokens(theme.palette.mode);
  const c = {
    paper: {
      background: t.primary[500],
      border: t.grey[300] || t.grey[400],
    },
  };
  return {
    backgroundColor: c.paper.background,
    border: "1px solid",
    borderColor: c.paper.border,
    borderRadius: 2,
  };
};

export const getButtonStyles = (theme, variant = "primary") => {
  const t = tokens(theme.palette.mode);
  const btnMap = {
    primary: {
      background: t.blueAccent?.[500],
      backgroundHover: t.blueAccent?.[600] || t.blueAccent?.[400],
      text: "#ffffff",
    },
    secondary: {
      background: t.greenAccent?.[500],
      backgroundHover: t.greenAccent?.[600] || t.greenAccent?.[400],
      text: "#ffffff",
    },
    danger: {
      background: t.redAccent?.[400] || "#ef4444",
      backgroundHover: t.redAccent?.[600] || "#dc2626",
      text: "#ffffff",
    },
  };

  const btnColors = btnMap[variant] || btnMap.primary;

  return {
    bgcolor: btnColors.background,
    color: btnColors.text,
    fontWeight: "600",
    py: 1.5,
    "&:hover": {
      bgcolor: btnColors.backgroundHover,
      transform: "translateY(-1px)",
      boxShadow: 2,
    },
    transition: "all 0.2s ease",
  };
};

export const getTabsStyles = (theme) => {
  const t = tokens(theme.palette.mode);
  const c = {
    tabs: {
      text: t.grey[500],
      textActive: t.blueAccent?.[500],
      indicator: t.blueAccent?.[500],
    },
  };
  return {
    "& .MuiTab-root": {
      color: c.tabs.text,
      fontWeight: "600",
      fontSize: "0.95rem",
      textTransform: "none",
    },
    "& .Mui-selected": {
      color: c.tabs.textActive,
    },
    "& .MuiTabs-indicator": {
      backgroundColor: c.tabs.indicator,
      height: 3,
    },
  };
};
