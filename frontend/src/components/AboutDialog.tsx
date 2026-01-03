import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link,
  CircularProgress,
} from "@mui/material";
import logo from "../assets/retrosprite_logo.png";
import { BrowserOpenURL } from "../wailsjs/runtime/runtime";
import { CheckForUpdates, GetCurrentVersion } from "../wailsjs/go/main/App";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ open, onClose }) => {
  const [version, setVersion] = useState<string>("Loading...");
  const [checking, setChecking] = useState(false);

  // Load version on mount
  useEffect(() => {
    GetCurrentVersion()
      .then((v) => setVersion(v))
      .catch(() => setVersion("Unknown"));
  }, []);

  const handleLinkClick = (url: string) => {
    BrowserOpenURL(url);
  };

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const updateInfo = await CheckForUpdates();
      // Trigger update dialog in parent (App.tsx)
      if (updateInfo.available && !updateInfo.error) {
        // Update available
        window.dispatchEvent(
          new CustomEvent("updateAvailable", { detail: updateInfo }),
        );
      } else if (updateInfo.error) {
        // Error occurred
        window.dispatchEvent(
          new CustomEvent("updateCheckError", { detail: updateInfo.error }),
        );
      } else {
        // No update available
        window.dispatchEvent(
          new CustomEvent("updateNotAvailable", { detail: updateInfo }),
        );
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("updateCheckError", {
          detail: "Failed to check for updates",
        }),
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
        About Retrosprite
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 2,
        }}
      >
        <img
          src={logo}
          alt="Retrosprite Logo"
          style={{ width: "180px", marginBottom: "16px" }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Version {version}
        </Typography>

        <Box sx={{ my: 2, textAlign: "center" }}>
          <Typography variant="body1">
            Nitro Bundle Editor & Converter
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            A powerful tool for editing and converting furniture bundles for
            Habbo retro hotels.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            Created by{" "}
            <Link
              component="button"
              onClick={() => handleLinkClick("https://github.com/Bopified")}
              underline="hover"
            >
              Bopified
            </Link>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            <Link
              component="button"
              onClick={() =>
                handleLinkClick("https://github.com/Bopified/Retrosprite")
              }
              underline="hover"
            >
              View Repository
            </Link>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Button
          onClick={handleCheckForUpdates}
          variant="outlined"
          size="small"
          disabled={checking}
          startIcon={checking ? <CircularProgress size={16} /> : null}
        >
          {checking ? "Checking..." : "Check for Updates"}
        </Button>
        <Button onClick={onClose} variant="contained" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
