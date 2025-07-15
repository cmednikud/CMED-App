import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Grid,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MedicalServices as DoctorIcon,
  Schedule as ScheduleIcon,
  School as QualificationIcon,
  Work as SpecializationIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from "@mui/icons-material";

export default function DoctorsManager() {
  const [doctors, setDoctors] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    qualification: "",
    specialization: "",
    timing: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await getDoc(doc(db, "appContent", "doctorsScreen"));
        if (snap.exists()) {
          setDoctors(snap.data().doctors || []);
        }
        setLoading(false);
      } catch (error) {
        showSnackbar("Failed to load doctors", "error");
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddDialog = () => {
    setDoctorForm({
      name: "",
      qualification: "",
      specialization: "",
      timing: ""
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (doctor, index) => {
    setDoctorForm({ ...doctor });
    setEditingId(index);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const saveDoctor = async () => {
    if (!doctorForm.name || !doctorForm.qualification) {
      showSnackbar("Name and Qualification are required", "error");
      return;
    }

    try {
      let updatedDoctors;
      if (editingId !== null) {
        // Update existing doctor
        updatedDoctors = [...doctors];
        updatedDoctors[editingId] = doctorForm;
      } else {
        // Add new doctor
        updatedDoctors = [...doctors, doctorForm];
      }

      await setDoc(doc(db, "appContent", "doctorsScreen"), { doctors: updatedDoctors });
      setDoctors(updatedDoctors);
      showSnackbar(
        editingId !== null ? "Doctor updated successfully" : "Doctor added successfully",
        "success"
      );
      handleCloseDialog();
    } catch (error) {
      showSnackbar(
        editingId !== null ? "Failed to update doctor" : "Failed to add doctor",
        "error"
      );
    }
  };

  const deleteDoctor = async (index) => {
    try {
      const updatedDoctors = doctors.filter((_, i) => i !== index);
      await setDoc(doc(db, "appContent", "doctorsScreen"), { doctors: updatedDoctors });
      setDoctors(updatedDoctors);
      showSnackbar("Doctor deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete doctor", "error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Doctors Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{ height: "fit-content" }}
        >
          Add Doctor
        </Button>
      </Box>

      {/* Doctor List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : doctors.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No doctors added yet
        </Typography>
      ) : (
        <List>
          {doctors.map((doctor, index) => (
            <Paper key={index} elevation={2} sx={{ mb: 2 }}>
              <ListItem>
                <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                  <DoctorIcon />
                </Avatar>
                <ListItemText
                  primary={doctor.name}
                  secondary={
                    <>
                      <Box component="span" display="block">
                        <Chip
                          icon={<QualificationIcon fontSize="small" />}
                          label={doctor.qualification}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {doctor.specialization && (
                          <Chip
                            icon={<SpecializationIcon fontSize="small" />}
                            label={doctor.specialization}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {doctor.timing && (
                          <Chip
                            icon={<ScheduleIcon fontSize="small" />}
                            label={doctor.timing}
                            size="small"
                          />
                        )}
                      </Box>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenEditDialog(doctor, index)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => deleteDoctor(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId !== null ? "Edit Doctor" : "Add New Doctor"}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name *"
                name="name"
                value={doctorForm.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Qualification *"
                name="qualification"
                value={doctorForm.qualification}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Specialization"
                name="specialization"
                value={doctorForm.specialization}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Timing"
                name="timing"
                value={doctorForm.timing}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Cancel
          </Button>
          <Button
            onClick={saveDoctor}
            variant="contained"
            disabled={!doctorForm.name || !doctorForm.qualification}
            startIcon={<CheckIcon />}
          >
            {editingId !== null ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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