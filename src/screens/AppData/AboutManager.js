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

export default function AboutManager() {
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({
    title: "",
    content: "",
    highlight: "",
    imageUrl: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docSnap = await getDoc(doc(db, "appContent", "aboutScreen"));
        if (docSnap.exists()) {
          setSections(docSnap.data().sections || []);
        }
      } catch (error) {
        showSnackbar("Failed to load content", "error");
      }
    };
    fetchAbout();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSectionClick = () => {
    setNewSection({
      title: "",
      content: "",
      highlight: "",
      imageUrl: ""
    });
    setShowCreateDialog(true);
  };

  const addSection = async () => {
    if (!newSection.title || !newSection.content) {
      showSnackbar("Title and Content are required", "error");
      return;
    }

    try {
      const updatedSections = [...sections, newSection];
      await setDoc(doc(db, "appContent", "aboutScreen"), { sections: updatedSections });
      setSections(updatedSections);
      setShowCreateDialog(false);
      showSnackbar("Section added successfully", "success");
    } catch (error) {
      showSnackbar("Failed to add section", "error");
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditSection({ ...sections[index] });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditSection(null);
  };

  const saveEdit = async () => {
    try {
      const updatedSections = [...sections];
      updatedSections[editingIndex] = editSection;
      await setDoc(doc(db, "appContent", "aboutScreen"), { sections: updatedSections });
      setSections(updatedSections);
      setEditingIndex(null);
      setEditSection(null);
      showSnackbar("Section updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update section", "error");
    }
  };

  const removeSection = async (index) => {
    try {
      const updatedSections = sections.filter((_, i) => i !== index);
      await setDoc(doc(db, "appContent", "aboutScreen"), { sections: updatedSections });
      setSections(updatedSections);
      showSnackbar("Section deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete section", "error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          About Screen Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSectionClick}
          sx={{ height: "fit-content" }}
        >
          Add Section
        </Button>
      </Box>

      {/* Existing Sections */}
      <Typography variant="h5" component="h2" gutterBottom>
        Current Sections
      </Typography>
      
      {sections.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No sections added yet
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {sections.map((section, index) => (
            <Grid item xs={12} key={index}>
              <Card elevation={3}>
                <CardContent>
                  {editingIndex === index ? (
                    <>
                      <TextField
                        label="Title"
                        name="title"
                        value={editSection.title}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Content"
                        name="content"
                        value={editSection.content}
                        onChange={handleEditChange}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                      />
                      <TextField
                        label="Highlight (optional)"
                        name="highlight"
                        value={editSection.highlight || ""}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Image URL"
                        name="imageUrl"
                        value={editSection.imageUrl}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {section.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {section.content}
                      </Typography>
                      {section.highlight && (
                        <Typography variant="body2" color="primary" paragraph>
                          {section.highlight}
                        </Typography>
                      )}
                      {section.imageUrl && (
                        <Box sx={{ my: 2 }}>
                          <img 
                            src={section.imageUrl} 
                            alt={section.title} 
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                          />
                        </Box>
                      )}
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
                        onClick={() => removeSection(index)}
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

      {/* Create New Section Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Create New Section
          <IconButton
            onClick={() => setShowCreateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title *"
                name="title"
                value={newSection.title}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content *"
                name="content"
                value={newSection.content}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Highlight (optional)"
                name="highlight"
                value={newSection.highlight}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Image URL"
                name="imageUrl"
                value={newSection.imageUrl}
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
            onClick={addSection} 
            variant="contained" 
            disabled={!newSection.title || !newSection.content}
            startIcon={<CheckIcon />}
          >
            Add Section
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