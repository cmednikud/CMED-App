import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Public as PublicIcon,
  Map as MapIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Share as ShareIcon,
} from "@mui/icons-material";

export default function ContactManager() {
  const [contact, setContact] = useState({
    address: "",
    email: "",
    phone: "",
    websiteUrl: "",
    googleMapsUrl: "",
    whatsappUrl: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    officeHours: "",
  });
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactSnap = await getDoc(doc(db, "appContent", "contactScreen"));
        if (contactSnap.exists()) {
          setContact(contactSnap.data());
        }

        const shareSnap = await getDoc(doc(db, "appContent", "shareApp"));
        if (shareSnap.exists()) {
          setShareLink(shareSnap.data().link || "");
        }

        setLoading(false);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load information",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field) => (e) => {
    setContact({ ...contact, [field]: e.target.value });
  };

  const saveContact = async () => {
    try {
      await setDoc(doc(db, "appContent", "contactScreen"), contact);
      setSnackbar({
        open: true,
        message: "Contact details updated successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update contact details",
        severity: "error",
      });
    }
  };

  const saveShareLink = async () => {
    try {
      await setDoc(doc(db, "appContent", "shareApp"), { link: shareLink });
      setSnackbar({
        open: true,
        message: "App share link updated successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update share link",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Contact Information Manager
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Basic Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Address"
              value={contact.address}
              onChange={handleChange("address")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              value={contact.email}
              onChange={handleChange("email")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Phone"
              value={contact.phone}
              onChange={handleChange("phone")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Office Hours"
              value={contact.officeHours}
              onChange={handleChange("officeHours")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Social Media & Links
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Website URL"
              value={contact.websiteUrl}
              onChange={handleChange("websiteUrl")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PublicIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Google Maps URL"
              value={contact.googleMapsUrl}
              onChange={handleChange("googleMapsUrl")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MapIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="WhatsApp URL"
              value={contact.whatsappUrl}
              onChange={handleChange("whatsappUrl")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WhatsAppIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Facebook"
              value={contact.facebook}
              onChange={handleChange("facebook")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FacebookIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Instagram"
              value={contact.instagram}
              onChange={handleChange("instagram")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="LinkedIn"
              value={contact.linkedin}
              onChange={handleChange("linkedin")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkedInIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="YouTube"
              value={contact.youtube}
              onChange={handleChange("youtube")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <YouTubeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveContact}
            size="large"
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      {/* ✅ Share App Link Card */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Share App Link
        </Typography>

        <TextField
          label="App Share Link"
          value={shareLink}
          onChange={(e) => setShareLink(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ShareIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveShareLink}
            size="large"
          >
            Save Share Link
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
