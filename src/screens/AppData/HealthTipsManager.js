import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

export default function HealthTipsManager() {
  const [tips, setTips] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [newTip, setNewTip] = useState({ text: "" });
  const [editingTip, setEditingTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "healthTips"));
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      loaded.sort((a, b) => a.index - b.index);
      setTips(loaded);
      setFilteredTips(loaded);
    } catch (error) {
      showSnackbar("Failed to load tips", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddClick = () => {
    setNewTip({ text: "" });
    setEditingTip(null);
    setShowDialog(true);
  };

  const handleEditClick = (tip) => {
    setEditingTip(tip);
    setNewTip({ text: tip.text });
    setShowDialog(true);
  };

  const saveTip = async () => {
    if (!newTip.text.trim()) {
      showSnackbar("Tip text cannot be empty", "error");
      return;
    }

    try {
      if (editingTip) {
        await setDoc(doc(db, "healthTips", editingTip.id), {
          index: editingTip.index,
          text: newTip.text.trim(),
        });
        showSnackbar("Tip updated successfully", "success");
      } else {
        const nextIndex = tips.length > 0 ? tips[tips.length - 1].index + 1 : 1;
        await setDoc(doc(db, "healthTips", nextIndex.toString()), {
          index: nextIndex,
          text: newTip.text.trim(),
        });
        showSnackbar("Tip added successfully", "success");
      }
      setShowDialog(false);
      fetchTips();
    } catch (error) {
      showSnackbar("Failed to save tip", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "healthTips", id));
      showSnackbar("Tip deleted successfully", "success");
      fetchTips();
    } catch (error) {
      showSnackbar("Failed to delete tip", "error");
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredTips(tips);
    } else {
      const filtered = tips.filter((tip) =>
        tip.text.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTips(filtered);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Health Tips Manager
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search tips..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ height: "fit-content" }}
          >
            Add Tip
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredTips.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No health tips found
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "background.default" }}>
              <TableRow>
                <TableCell width="80px">#</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell width="120px" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTips.map((tip) => (
                <TableRow key={tip.id} hover>
                  <TableCell>{tip.index}</TableCell>
                  <TableCell>{tip.text}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditClick(tip)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(tip.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTip ? "Edit Health Tip" : "Add New Health Tip"}
          <IconButton
            onClick={() => setShowDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Tip Text"
            value={newTip.text}
            onChange={(e) => setNewTip({ text: e.target.value })}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={saveTip}
            variant="contained"
            disabled={!newTip.text.trim()}
            startIcon={<CheckIcon />}
          >
            {editingTip ? "Update" : "Save"}
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
