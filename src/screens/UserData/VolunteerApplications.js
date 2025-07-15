import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import CsvExportButton from "../../tools/CsvExportButton";
import DataTable from "../../tools/DataTable";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";

export default function VolunteerApplications() {
  const [fields, setFields] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchConfigAndData = async () => {
      try {
        // ✅ 1) Get dynamic fields from volunteerScreen config
        const configSnap = await getDoc(doc(db, "appContent", "volunteerScreen"));
        let formFields = [];
        if (configSnap.exists()) {
          formFields = configSnap.data().volunteerProgram?.formFields || [];
          setFields(formFields);
        }

        // ✅ 2) Fetch applications
        const querySnapshot = await getDocs(collection(db, "volunteerApplications"));
        const data = querySnapshot.docs.map((docSnap) => {
          const docData = docSnap.data();
          let timestamp = null;
          if (docData.timestamp?.toDate) {
            timestamp = docData.timestamp.toDate();
          } else if (docData.timestamp) {
            timestamp = new Date(docData.timestamp);
          }
          return {
            id: docSnap.id,
            ...docData,
            timestamp: timestamp ? timestamp.toISOString() : null,
          };
        });

        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigAndData();
  }, []);

  const handleEditClick = (row) => setEditData(row);

  const handleSave = async () => {
    try {
      const { id, timestamp, ...data } = editData;
      const cleanedData = { ...data };

      // Clean string fields
      fields.forEach((field) => {
        const val = cleanedData[field.name];
        cleanedData[field.name] = typeof val === "string" ? val.trim() : val;
      });

      await updateDoc(doc(db, "volunteerApplications", id), cleanedData);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...cleanedData } : a))
      );
      setEditData(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "volunteerApplications", deleteId));
      setApplications((prev) => prev.filter((a) => a.id !== deleteId));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return format(date, "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const filtered = applications.filter((app) => {
    const search = searchTerm.toLowerCase();
    return fields.some((field) =>
      (app[field.name] || "").toString().toLowerCase().includes(search)
    );
  });

  // ✅ Build columns dynamically
  const columns = [
    ...fields.map((field) => ({
      key: field.name,
      label: field.label || field.name,
    })),
    {
      key: "timestamp",
      label: "Submitted",
      render: (value) => formatDate(value),
    },
  ];

  const exportData = filtered.map((app) => {
    const row = {};
    fields.forEach((field) => {
      row[field.label || field.name] = app[field.name] || "";
    });
    row["Submitted"] = formatDate(app.timestamp);
    return row;
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Volunteer Applications
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CsvExportButton
            data={exportData}
            filename="volunteer_applications.csv"
          />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filtered}
        renderActions={(row) => (
          <>
            <Tooltip title="Edit">
              <IconButton color="primary" onClick={() => handleEditClick(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => handleDeleteClick(row.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      />

      <EditDialog
        open={!!editData}
        data={editData}
        fields={fields}
        onChange={setEditData}
        onSave={handleSave}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this volunteer application?"
      />
    </Paper>
  );
}
