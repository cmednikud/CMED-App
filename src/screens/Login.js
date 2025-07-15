import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import hospitalBg from "../download.jpeg";
import logo from "../image.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth listener will redirect
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${hospitalBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Avatar
            src={logo}
            alt="Hospital Logo"
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              border: "2px solid #1976d2",
            }}
          />
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: "primary.main",
              textAlign: "center",
            }}
          >
            Continual Medical Education
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 500,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            NIKUD Admin Portal
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 600,
              letterSpacing: 0.5,
              borderRadius: 1,
            }}
          >
            Sign In
          </Button>
        </form>

        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}
        >
          © {new Date().getFullYear()} NIKUD Hospital. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
}