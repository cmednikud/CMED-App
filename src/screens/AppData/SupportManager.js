import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  VolunteerActivism as VolunteerIcon,
  Work as InternshipIcon,
  School as TrainingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Lightbulb as SkillsIcon,
} from "@mui/icons-material";

export default function SupportManager() {
  const [supportData, setSupportData] = useState({
    volunteer: {
      description: "",
      eligibility: [],
      roles: [],
      enabled: true,
    },
    internship: {
      description: "",
      eligibility: [],
      fields: [],
      enabled: true,
    },
    training: {
      description: "",
      eligibility: [],
      areas: [],
      enabled: true,
    },
    skillsDevelopment: {
      description: "",
      eligibility: [],
      areas: [],
      skills: [],
      enabled: true,
    },
  });

  const [newItem, setNewItem] = useState({
    volunteer: { eligibility: "", roles: "" },
    internship: { eligibility: "", fields: "" },
    training: { eligibility: "", areas: "" },
    skillsDevelopment: { eligibility: "", areas: "", skills: "" },
  });

  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, "appContent", "supportScreen"));
        if (snap.exists()) {
          setSupportData(snap.data());
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load support information",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveData = async () => {
    try {
      await setDoc(doc(db, "appContent", "supportScreen"), supportData);
      setSnackbar({
        open: true,
        message: "Support information saved successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save support information",
        severity: "error",
      });
    }
  };

  const addItem = (section, key) => {
    const value = newItem[section][key].trim();
    if (!value) return;

    setSupportData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: [...prev[section][key], value],
      },
    }));

    setNewItem((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: "",
      },
    }));
  };

  const removeItem = (section, key, index) => {
    setSupportData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: prev[section][key].filter((_, i) => i !== index),
      },
    }));
  };

  const toggleEnabled = (section) => {
    setSupportData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled: !prev[section].enabled,
      },
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const renderSection = (section, title, icon, fields) => (
    <Card sx={{ mb: 4 }} key={section}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: "primary.main" }}>{icon}</Avatar>}
        action={
          <Switch
            checked={supportData[section].enabled}
            onChange={() => toggleEnabled(section)}
            color="primary"
          />
        }
        title={title}
        subheader={supportData[section].enabled ? "Enabled" : "Disabled"}
      />
      <CardContent>
        <TextField
          label="Description"
          value={supportData[section].description}
          onChange={(e) =>
            setSupportData((prev) => ({
              ...prev,
              [section]: { ...prev[section], description: e.target.value },
            }))
          }
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />

        {fields.map((field) => (
          <Box key={field.key} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label}
            </Typography>
            <List dense>
              {supportData[section][field.key].map((item, i) => (
                <ListItem key={i}>
                  <ListItemText primary={item} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeItem(section, field.key, i)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                value={newItem[section][field.key]}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    [section]: {
                      ...prev[section],
                      [field.key]: e.target.value,
                    },
                  }))
                }
                fullWidth
                size="small"
                placeholder={`Add ${field.label.toLowerCase()}`}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => addItem(section, field.key)}
                disabled={!newItem[section][field.key].trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Support Programs Manager
      </Typography>

      {renderSection("volunteer", "Volunteer Program", <VolunteerIcon />, [
        { key: "eligibility", label: "Eligibility Criteria" },
        { key: "roles", label: "Available Roles" },
      ])}

      {renderSection("internship", "Internship Program", <InternshipIcon />, [
        { key: "eligibility", label: "Eligibility Criteria" },
        { key: "fields", label: "Available Fields" },
      ])}

      {renderSection("training", "Training Program", <TrainingIcon />, [
        { key: "eligibility", label: "Eligibility Criteria" },
        { key: "areas", label: "Training Areas" },
      ])}

      {renderSection("skillsDevelopment", "Skills Development", <SkillsIcon />, [
        { key: "eligibility", label: "Eligibility Criteria" },
        { key: "areas", label: "Focus Areas" },
        { key: "skills", label: "Skills Covered" },
      ])}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveData}
          size="large"
        >
          Save All Changes
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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
