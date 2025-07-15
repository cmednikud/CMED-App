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
  CardActions,
  IconButton,
  Grid,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from "@mui/icons-material";

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    imageUrl: "",
    action1: "",
    action2: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editService, setEditService] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDoc(doc(db, "appContent", "servicesScreen"));
        if (snap.exists()) {
          setServices(snap.data().services || []);
        }
      } catch (error) {
        showSnackbar("Failed to load services", "error");
      }
    };
    fetchServices();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditService((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddServiceClick = () => {
    setNewService({
      title: "",
      description: "",
      imageUrl: "",
      action1: "",
      action2: ""
    });
    setShowCreateDialog(true);
  };

  const addService = async () => {
    if (!newService.title || !newService.description) {
      showSnackbar("Title and Description are required", "error");
      return;
    }

    try {
      const updatedServices = [...services, newService];
      await setDoc(doc(db, "appContent", "servicesScreen"), { services: updatedServices });
      setServices(updatedServices);
      setShowCreateDialog(false);
      showSnackbar("Service added successfully", "success");
    } catch (error) {
      showSnackbar("Failed to add service", "error");
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditService({ ...services[index] });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditService(null);
  };

  const saveEdit = async () => {
    try {
      const updatedServices = [...services];
      updatedServices[editingIndex] = editService;
      await setDoc(doc(db, "appContent", "servicesScreen"), { services: updatedServices });
      setServices(updatedServices);
      setEditingIndex(null);
      setEditService(null);
      showSnackbar("Service updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update service", "error");
    }
  };

  const deleteService = async (index) => {
    try {
      const updatedServices = services.filter((_, i) => i !== index);
      await setDoc(doc(db, "appContent", "servicesScreen"), { services: updatedServices });
      setServices(updatedServices);
      showSnackbar("Service deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete service", "error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Services Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddServiceClick}
          sx={{ height: "fit-content" }}
        >
          Add New Service
        </Button>
      </Box>

      {/* Existing Services */}
      <Typography variant="h5" component="h2" gutterBottom>
        Current Services
      </Typography>
      
      {services.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No services added yet
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid item xs={12} key={index}>
              <Card elevation={3}>
                <CardContent>
                  {editingIndex === index ? (
                    <>
                      <TextField
                        label="Title"
                        name="title"
                        value={editService.title}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Description"
                        name="description"
                        value={editService.description}
                        onChange={handleEditChange}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                      />
                      <TextField
                        label="Image URL"
                        name="imageUrl"
                        value={editService.imageUrl}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                          label="Action 1"
                          name="action1"
                          value={editService.action1}
                          onChange={handleEditChange}
                          fullWidth
                        />
                        <TextField
                          label="Action 2"
                          name="action2"
                          value={editService.action2}
                          onChange={handleEditChange}
                          fullWidth
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {service.description}
                      </Typography>
                      {service.imageUrl && (
                        <Box sx={{ my: 2 }}>
                          <img 
                            src={service.imageUrl} 
                            alt={service.title} 
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                          />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        {service.action1 && (
                          <Button variant="outlined">{service.action1}</Button>
                        )}
                        {service.action2 && (
                          <Button variant="outlined">{service.action2}</Button>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {editingIndex === index ? (
                    <>
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={cancelEditing}
                        color="error"
                      >
                        Cancel
                      </Button>
                      <Button
                        startIcon={<CheckIcon />}
                        onClick={saveEdit}
                        variant="contained"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => deleteService(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => startEditing(index)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create New Service Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Create New Service
          <IconButton
            onClick={() => setShowCreateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title *"
                name="title"
                value={newService.title}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Image URL"
                name="imageUrl"
                value={newService.imageUrl}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description *"
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Action 1 (optional)"
                name="action1"
                value={newService.action1}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Action 2 (optional)"
                name="action2"
                value={newService.action2}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)} color="error">
            Cancel
          </Button>
          <Button 
            onClick={addService} 
            variant="contained" 
            disabled={!newService.title || !newService.description}
            startIcon={<CheckIcon />}
          >
            Add Service
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