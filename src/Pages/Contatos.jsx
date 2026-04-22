import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTheme, Box, Typography, Alert, Collapse, Skeleton, TextField } from "@mui/material"
import { tokens } from "../Tema";
import EmailInput from "../Components/Inputs/EmailInput";
import ButtonUsage from "../Components/ButtonUsage";
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';

const Contatos = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // useForm do react-hook-form para controlar o formulário
    const {
        register,
        handleSubmit,
        watch,
        reset, // Adiciona reset para limpar o formulário após o envio
        formState: { errors },
    } = useForm();

    // Watch monitora os campos para validação em tempo real
    const watchedFields = watch();

    // Verifica se todos os campos principais estão preenchidos
    const areAllFIeldsFilled =
        watchedFields.email &&
        watchedFields.name &&
        watchedFields.message &&
        watchedFields.subject;

    // Desabilita o botão se algum campo estiver vazio
    const isButtonDisabled = !areAllFIeldsFilled;

    // Extrai mensagens de erro para cada campo ou string vazia se não houver erro
    const errorName = errors.name ? errors.name.message : "";
    const errorSubject = errors.subject ? errors.subject.message : "";
    const errorMessage = errors.message ? errors.message.message : "";

    // ESTADOS DA APLICAÇÃO
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState(""); // Estado para mensagem do alerta
    const [alertSeverity, setAlertSeverity] = useState("success"); // Estado para tipo de alerta
    const [isLoading, setIsLoading] = useState(false); // Estado para loading durante o envio
    const [mapLoaded, setMapLoaded] = useState(false);

    // Define um timeout para mostrar o skeleton loading por 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            setMapLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // HANDLER DE CARREGAMENTO DO MAPA
    const handleMapLoaded = () => {
        setMapLoaded(true);
    }

    // SUBMISSÃO DO FORMULÁRIO - MODIFICADA
    const onSubmit = async (data) => {
        setIsLoading(true); // Inicia o loading
        
        try {
            const response = await fetch("http://localhost:3000/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // Sucesso
                setAlertMessage("Mensagem enviada com sucesso! Entraremos em contato em breve.");
                setAlertSeverity("success");
                setAlertVisible(true);
                reset(); // Limpa o formulário após envio bem-sucedido
            } else {
                // Erro do servidor
                setAlertMessage(result.error || "Erro ao enviar mensagem. Tente novamente.");
                setAlertSeverity("error");
                setAlertVisible(true);
            }
        } catch (error) {
            // Erro de rede
            console.error("Erro ao enviar formulário:", error);
            setAlertMessage("Erro de conexão. Verifique sua internet e tente novamente.");
            setAlertSeverity("error");
            setAlertVisible(true);
        } finally {
            setIsLoading(false); // Finaliza o loading
            // Auto-esconde o alerta após 5 segundos
            setTimeout(() => {
                setAlertVisible(false);
            }, 5000);
        }
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "25vh",
            }}>
            {/* CABEÇALHO DA PÁGINA */}
            <Typography variant="h1" align="center" sx={{  fontWeight: "bold" }}>
                Nos contate!
            </Typography>

            {/* DESCRIÇÃO DA PÁGINA */}
            <Typography variant="body1" align="center" sx={{ p: 2 }}>
                Perguntas? Dúvidas? Estamos aqui para ajudar! Entre em contato conosco:
            </Typography>

            {/* CONTAINER PRINCIPAL DO CONTEÚDO */}
            <Box
                sx={{
                    mx: "auto",
                    px: 4,
                    py: 7,
                    backgroundColor: colors.primary[500],
                    borderRadius: 2,
                    borderColor: "#878787",
                    borderWidth: 1,
                    boxShadow: 3,
                    width: { xs: '92vw', sm: '90vw', md: '95vw', lg: 1200 },
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 4,
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}>

                {/* FORMULÁRIO DE CONTATO (lado esquerdo) */}
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: { xs: "100%", md: "50%" },
                        flexShrink: 0
                    }}
                >
                    {/* INPUT NOME */}
                    <Box>
                        <TextField
                            label="Nome"
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "100%",
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.primary[500],
                                    '& fieldset': {
                                        borderColor: colors.grey[300],
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.blueAccent[500],
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.blueAccent[500],
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.grey[300],
                                    '&.Mui-focused': {
                                        color: colors.blueAccent[500],
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: colors.grey[100],
                                },
                            }}
                            {...register("name", { required: "Nome é obrigatório!" })}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                minHeight: "20px",
                                fontWeight: "bold",
                                color: errors.name ? colors.redAccent[100] : "transparent",
                                visibility: errors.name ? "visible" : "hidden",
                                marginTop: "4px",
                                display: "block",
                                fontSize: "12px"
                            }}
                        >
                            {errorName}
                        </Typography>
                    </Box>

                    {/* COMPONENTE EMAIL INPUT REUTILIZÁVEL */}
                    <EmailInput register={register} errors={errors} />

                    {/* INPUT ASSUNTO */}
                    <Box>
                        <TextField
                            label="Assunto"
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "100%",
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.primary[500],
                                    '& fieldset': {
                                        borderColor: colors.grey[300],
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.blueAccent[500],
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.blueAccent[500],
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.grey[300],
                                    '&.Mui-focused': {
                                        color: colors.blueAccent[500],
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: colors.grey[100],
                                },
                            }}
                            {...register("subject", {
                                required: "Assunto é obrigatório!",
                            })}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                minHeight: "20px",
                                fontWeight: "bold",
                                color: errors.subject ? colors.redAccent[100] : "transparent",
                                visibility: errors.subject ? "visible" : "hidden",
                                marginTop: "4px",
                                display: "block",
                                fontSize: "12px"
                            }}
                        >
                            {errorSubject}
                        </Typography>
                    </Box>

                    {/* INPUT MENSAGEM (Textarea) */}
                    <Box>
                        <TextField
                            label="Mensagem"
                            variant="outlined"
                            size="small"
                            multiline
                            minRows={4}
                            sx={{
                                width: "100%",
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.primary[500],
                                    '& fieldset': {
                                        borderColor: colors.grey[300],
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.blueAccent[500],
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.blueAccent[500],
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.grey[300],
                                    '&.Mui-focused': {
                                        color: colors.blueAccent[500],
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: colors.grey[100],
                                },
                            }}
                            {...register("message", { required: "Mensagem é obrigatória!" })}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                minHeight: "20px",
                                fontWeight: "bold",
                                color: errors.message ? colors.redAccent[100] : "transparent",
                                visibility: errors.message ? "visible" : "hidden",
                                marginTop: "4px",
                                display: "block",
                                fontSize: "12px"
                            }}
                        >
                            {errorMessage}
                        </Typography>
                    </Box>

                    {/* BOTÃO DE ENVIAR REUTILIZÁVEL */}
                    <ButtonUsage
                        type="submit"
                        disabled={isButtonDisabled || isLoading} // Desabilita durante o loading
                    >
                        {isLoading ? "Enviando..." : "Enviar"}
                    </ButtonUsage>

                    {/* INFORMAÇÕES DE CONTATO ALTERNATIVAS */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            mt: 2,
                            gap: 5
                        }}
                    >
                        <Typography variant="body1" sx={{
                            color: colors.grey[100],
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                        >
                            < EmailIcon />
                            naf01.dl@unichristus.edu.br
                        </Typography>
                        
                        <Typography variant="body1" sx={{
                            color: colors.grey[100],
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                        >
                            < InstagramIcon />
                            @naf.unichristus
                        </Typography>
                    </Box>
                </Box>

                {/* MAPA DE LOCALIZAÇÃO (lado direito) */}
                <Box
                    sx={{
                        width: { xs: "100%", md: "50%" },
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    {mapLoaded ? (
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.344439541306!2d-38.4933941!3d-3.7349014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c7487d0c53520f%3A0xd568fa9590e225b9!2sR.%20Cel.%20Linhares%2C%20771%20-%20Meireles%2C%20Fortaleza%20-%20CE%2C%2060170-075!5e0!3m2!1spt-BR!2sbr"
                            width="100%"
                            height="470"
                            style={{ border: 0, borderRadius: 8 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Localização do NAF"
                            onLoad={handleMapLoaded}
                        ></iframe>
                    ) : (
                        <Skeleton variant="rectangular"
                            sx={{
                                width: "100%",
                                height: 470,
                                borderRadius: 2,
                            }} />
                    )}
                </Box>
            </Box>

            {/* ALERTA DINÂMICO (Sucesso ou Erro) */}
            <Box
                sx={{
                    display: "block",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: { xs: '92vw', sm: '90vw', md: '95vw', lg: 1200 },
                    mx: "auto",
                    mt: 2,
                    mb: 2,
                    px: 4,
                }}
            >
                <Collapse in={alertVisible}>
                    <Alert
                        severity={alertSeverity}
                        onClose={() => setAlertVisible(false)}
                        sx={{
                            backgroundColor: alertSeverity === "success" 
                                ? colors.greenAccent[100] 
                                : colors.redAccent[100],
                            color: alertSeverity === "success" 
                                ? colors.greenAccent[900] 
                                : colors.redAccent[900],
                            width: "100%",
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            '& .MuiAlert-icon': {
                                color: alertSeverity === "success" 
                                    ? colors.greenAccent[500] 
                                    : colors.redAccent[500],
                                fontSize: 'inherit',
                            },
                            '& .MuiAlert-message': {
                                fontSize: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                textAlign: 'center',
                            },
                        }}
                    >
                        {alertMessage}
                    </Alert>
                </Collapse>
            </Box>
        </Box>
    )
}

export default Contatos;