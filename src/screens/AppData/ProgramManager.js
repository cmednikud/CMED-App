import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import SortableFields from '../../tools/SortableFields'; // ✅ Reusable drag-and-drop

const ProgramManager = () => {
  const [programs, setPrograms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const querySnapshot = await getDocs(collection(db, 'programs'));
    const programsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPrograms(programsData);
  };

  const handleAddProgram = () => {
    setCurrentProgram({
      title: '',
      description: '',
      date: '',
      lastDate: '',
      targetScreen: '',
      formFields: []
    });
    setOpenDialog(true);
  };

  const handleEditProgram = (program) => {
    setCurrentProgram(program);
    setOpenDialog(true);
  };

  const handleDeleteProgram = async (id) => {
    await deleteDoc(doc(db, 'programs', id));
    fetchPrograms();
  };

  const handleSubmit = async () => {
    if (currentProgram.id) {
      const { id, ...rest } = currentProgram;
      await updateDoc(doc(db, 'programs', currentProgram.id), rest);
    } else {
      await addDoc(collection(db, 'programs'), currentProgram);
    }
    setOpenDialog(false);
    fetchPrograms();
  };

  const addFormField = () => {
    setCurrentProgram({
      ...currentProgram,
      formFields: [
        ...(currentProgram.formFields || []),
        { name: '', type: 'text', label: '', required: false, options: [] }
      ]
    });
  };

  const updateFormField = (index, field, value) => {
    const newFields = [...currentProgram.formFields];
    newFields[index][field] = value;
    setCurrentProgram({
      ...currentProgram,
      formFields: newFields
    });
  };

  const removeFormField = (index) => {
    const newFields = [...currentProgram.formFields];
    newFields.splice(index, 1);
    setCurrentProgram({
      ...currentProgram,
      formFields: newFields
    });
  };

  const isTargetScreenSet = currentProgram?.targetScreen?.trim() !== '';

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Program Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProgram}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Add Program
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Last Date</TableCell>
              <TableCell>Target Screen</TableCell>
              <TableCell>Form Fields</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell>{program.title}</TableCell>
                <TableCell>{program.description}</TableCell>
                <TableCell>{program.date ? new Date(program.date).toDateString() : 'N/A'}</TableCell>
                <TableCell>{program.lastDate ? new Date(program.lastDate).toDateString() : 'N/A'}</TableCell>
                <TableCell>{program.targetScreen || 'N/A'}</TableCell>
                <TableCell>{program.formFields?.length || 0}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditProgram(program)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProgram(program.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentProgram?.id ? 'Edit Program' : 'Add Program'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={currentProgram?.title || ''}
            onChange={(e) => setCurrentProgram({ ...currentProgram, title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={currentProgram?.description || ''}
            onChange={(e) => setCurrentProgram({ ...currentProgram, description: e.target.value })}
          />

          <TextField
            label="Program Date"
            type="date"
            fullWidth
            margin="normal"
            value={currentProgram?.date || ''}
            onChange={(e) => setCurrentProgram({ ...currentProgram, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Form Last Date (optional)"
            type="date"
            fullWidth
            margin="normal"
            value={currentProgram?.lastDate || ''}
            onChange={(e) => setCurrentProgram({ ...currentProgram, lastDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Target Screen (Volunteer, Internship, Training, SkillsDevelopment)"
            fullWidth
            margin="normal"
            value={currentProgram?.targetScreen || ''}
            onChange={(e) => setCurrentProgram({ ...currentProgram, targetScreen: e.target.value })}
            helperText="If you set a Target Screen, Form Fields below will be ignored"
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Form Fields (used ONLY if no Target Screen is set)
          </Typography>

          {isTargetScreenSet && (
            <Typography sx={{ mb: 2, color: 'red' }}>
              ⚠️ Target Screen is set — custom form fields will be ignored!
            </Typography>
          )}

          {!isTargetScreenSet && (
            <>
              <SortableFields
                fields={currentProgram?.formFields || []}
                setFields={(fields) =>
                  setCurrentProgram({
                    ...currentProgram,
                    formFields: fields
                  })
                }
                updateField={updateFormField}
                deleteField={removeFormField}
              />

              <Button
                variant="outlined"
                onClick={addFormField}
                sx={{ mt: 2 }}
              >
                Add Form Field
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProgramManager;
