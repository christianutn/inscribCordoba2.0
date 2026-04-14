import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import { styled } from "@mui/material/styles";
import { subirNotaDeAutorizacion } from "../../../services/notasDeAutorizacion.service";

const SUGGESTED_MAX_SIZE_MB = 2;
const INSTITUTIONAL_CYAN = "#009EE3";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ModalCargarNota = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState(() => {
    const saved = localStorage.getItem("lastNotaUploadTime");
    return saved ? parseInt(saved, 10) : null;
  });
  const fileInputRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setAlert({ open: false, message: "", severity: "success" });
      setIsDragOver(false);
    }
  }, [open]);

  const checkFileSize = (selectedFile) => {
    const sizeInMB = selectedFile.size / (1024 * 1024);
    if (sizeInMB > SUGGESTED_MAX_SIZE_MB) {
      setAlert({
        open: true,
        message: (
          <span>
            El archivo es demasiado pesado (máximo {SUGGESTED_MAX_SIZE_MB}MB).
            Por favor, comprimilo en{" "}
            <Link
              href="https://www.ilovepdf.com/es/comprimir_pdf"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "inherit", fontWeight: "bold" }}
            >
              iLovePDF
            </Link>{" "}
            para poder subirlo.
          </span>
        ),
        severity: "error",
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setAlert({ open: false, message: "", severity: "success" });
        checkFileSize(selectedFile);
      } else {
        setAlert({
          open: true,
          message: "Por favor, seleccione un archivo PDF.",
          severity: "error",
        });
      }
    }
  };

  const executeUpload = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    setAlert({ open: false, message: "", severity: "success" });

    try {
      await subirNotaDeAutorizacion(file);
      const now = Date.now();
      setLastUploadTime(now);
      localStorage.setItem("lastNotaUploadTime", now.toString());

      setAlert({
        open: true,
        message: "Nota de autorización subida correctamente.",
        severity: "success",
      });

      // Call onSuccess callback after a brief delay to show success message
      setTimeout(() => {
        handleResetFile(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      const isLargeFile =
        error.response?.status === 413 ||
        error.message?.includes("413") ||
        error.response?.data?.message?.toLowerCase().includes("large");

      if (isLargeFile) {
        setAlert({
          open: true,
          message: (
            <span>
              El servidor rechazó el archivo por su peso. Por favor, comprimilo
              en{" "}
              <Link
                href="https://www.ilovepdf.com/es/comprimir_pdf"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "inherit", fontWeight: "bold" }}
              >
                iLovePDF
              </Link>{" "}
              e intentá nuevamente.
            </span>
          ),
          severity: "error",
        });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Error al subir la nota de autorización.";
        setAlert({ open: true, message: errorMessage, severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!file) {
      setAlert({
        open: true,
        message: "Por favor, seleccione un archivo para subir.",
        severity: "warning",
      });
      return;
    }

    if (file.size / (1024 * 1024) > SUGGESTED_MAX_SIZE_MB) {
      setAlert({
        open: true,
        message: `El archivo supera el límite de ${SUGGESTED_MAX_SIZE_MB}MB.`,
        severity: "error",
      });
      return;
    }

    // Check localStorage for recent uploads
    const savedTime = localStorage.getItem("lastNotaUploadTime");
    const effectiveLastTime = savedTime ? Number(savedTime) : lastUploadTime;

    const now = Date.now();
    const threeMinutesInMs = 3 * 60 * 1000;

    if (effectiveLastTime && now - effectiveLastTime < threeMinutesInMs) {
      setConfirmDialogOpen(true);
    } else {
      executeUpload();
    }
  };

  const handleResetFile = (clearAlert = true) => {
    setFile(null);
    if (clearAlert) {
      setAlert({ open: false, message: "", severity: "success" });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setAlert({ open: false, message: "", severity: "success" });
        checkFileSize(droppedFile);
      } else {
        setAlert({
          open: true,
          message: "Por favor, seleccione un archivo PDF.",
          severity: "error",
        });
      }
    }
  };

  const isTooLarge = file && file.size / (1024 * 1024) > SUGGESTED_MAX_SIZE_MB;
  const hasError =
    alert.open && (alert.severity === "error" || alert.severity === "warning");
  const isInfo = alert.open && alert.severity === "info";

  return (
    <>
      {/* Confirmation Dialog for Recent Uploads */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmación de Carga</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Cargaste una nota hace poco menos de 3 minutos. ¿Estás seguro de que
            querés cargar otra?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={executeUpload}
            variant="contained"
            sx={{
              backgroundColor: INSTITUTIONAL_CYAN,
              "&:hover": { backgroundColor: "#0088c4" },
            }}
          >
            Sí, Subir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Upload Modal */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #eef2f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2.5,
            px: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#E0F2FE",
              }}
            >
              <CloudUploadIcon
                sx={{ color: INSTITUTIONAL_CYAN, fontSize: 24 }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Geogrotesque Sharp", sans-serif',
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "text.primary",
              }}
            >
              Cargar Nota de Autorización
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 158, 227, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, px: 4, pb: 2 }}>
          {alert.open && (
            <Alert
              severity={alert.severity}
              sx={{ width: "100%", mb: 3 }}
              onClose={() => setAlert({ ...alert, open: false })}
            >
              {alert.message}
            </Alert>
          )}

          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "1.05rem",
              color: "#6b7280",
              mb: 3,
              lineHeight: 1.6,
              mt: 1.5,
              mb: 1,
            }}
          >
            Adjuntá la nota de autorización para habilitar los cursos. Máximo{" "}
            <strong>{SUGGESTED_MAX_SIZE_MB}MB</strong>.
          </Typography>

          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 0.8 }}>
            <FileDownloadIcon
              sx={{ color: INSTITUTIONAL_CYAN, fontSize: 18 }}
            />
            <Link
              href="https://drive.google.com/drive/folders/1e9cIZjDv3n7ss9NIDACfitCRbfjVrlQ3"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: "1rem",
                fontWeight: 600,
                color: INSTITUTIONAL_CYAN,
                textDecoration: "none",
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Descargar Modelo de Nota de Autorización
            </Link>
          </Box>

          {/* Drag & Drop Zone */}
          <Box
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              borderRadius: "12px",
              border: isDragOver
                ? `2px dashed ${INSTITUTIONAL_CYAN}`
                : "2px dashed #cbd5e1",
              padding: "48px 32px",
              textAlign: "center",
              cursor: !file ? "pointer" : "default",
              backgroundColor: isDragOver ? "#F0F9FF" : "#F8F9FA",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: INSTITUTIONAL_CYAN,
                backgroundColor: "#F0F9FF",
              },
            }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
              id="pdf-upload-input-modal"
            />

            {!file ? (
              <label
                htmlFor="pdf-upload-input-modal"
                style={{ cursor: "pointer", display: "block", width: "100%" }}
              >
                <CloudUploadIcon
                  sx={{
                    fontSize: "48px",
                    color: isDragOver ? INSTITUTIONAL_CYAN : "#64748b",
                    mb: 2,
                    transition: "color 0.3s ease",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  Arrastrá tu archivo acá
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    mb: 3,
                  }}
                >
                  o seleccioná un archivo desde tu computadora
                </Typography>

                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    backgroundColor: INSTITUTIONAL_CYAN,
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 158, 227, 0.2)",
                    px: 3,
                    py: 1,
                    "&:hover": {
                      backgroundColor: "#0088c4",
                      boxShadow: "0 6px 16px rgba(0, 158, 227, 0.3)",
                    },
                  }}
                >
                  Seleccionar Archivo PDF
                </Button>
              </label>
            ) : (
              <Box sx={{ py: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: INSTITUTIONAL_CYAN, mb: 2, fontWeight: 600 }}
                >
                  ¡Archivo cargado!
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 158, 227, 0.1)",
                    borderRadius: "12px",
                    px: 3,
                    py: 2,
                    width: "fit-content",
                    mx: "auto",
                    border: `1px solid ${INSTITUTIONAL_CYAN}`,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "text.primary", mr: 2 }}
                  >
                    {file.name}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleResetFile()}
                    title="Eliminar archivo"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 2, color: "text.secondary" }}
                >
                  Hacé clic en el botón de "SUBIR" para finalizar el envío.
                </Typography>
              </Box>
            )}
          </Box>

          {/* TIP PRO - Help Block */}
          <Box
            sx={{
              backgroundColor: "#E0F2FE",
              border: `1.5px solid ${INSTITUTIONAL_CYAN}`,
              borderRadius: "10px",
              p: 2.5,
              mt: 4,
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            <InfoIcon
              sx={{
                color: INSTITUTIONAL_CYAN,
                fontSize: 20,
                mt: 0.3,
                flexShrink: 0,
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Geogrotesque Sharp", sans-serif',
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: INSTITUTIONAL_CYAN,
                  mb: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Recuerda
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.95rem",
                  color: "#0369a1",
                  lineHeight: 1.5,
                }}
              >
                El archivo debe ser PDF y no superar los 2MB para una carga
                óptima.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "2rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Tooltip
              title={
                !file
                  ? "Seleccione un archivo primero"
                  : isTooLarge
                    ? "El archivo es demasiado pesado"
                    : loading
                      ? "Subiendo..."
                      : "Subir la nota de autorización seleccionada"
              }
            >
              <Box sx={{ width: "100%" }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleUploadClick}
                  disabled={!file || loading || isTooLarge}
                  sx={{
                    width: "100%",
                    backgroundColor: INSTITUTIONAL_CYAN,
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "10px",
                    py: 1.5,
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Subiendo...
                    </Box>
                  ) : (
                    "SUBIR NOTA DE AUTORIZACIÓN"
                  )}
                </Button>
              </Box>
            </Tooltip>

            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              sx={{
                borderColor: "#cbd5e1",
                color: "#6b7280",
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.9rem",
                borderRadius: "10px",
                py: 1.5,
                textTransform: "none",
                "&:hover:not(:disabled)": {
                  borderColor: "#94a3b8",
                  backgroundColor: "rgba(0,0,0,0.03)",
                },
                width: "100%",
              }}
            >
              CANCELAR
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModalCargarNota;
