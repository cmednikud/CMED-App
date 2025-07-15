import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Paper, Box, Typography, CircularProgress, Tooltip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import CsvExportButton from "../../tools/CsvExportButton";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";
import DataTable from "../../tools/DataTable";

export default function InternshipApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "internshipApplications"));
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

        // ✅ Sort by timestamp DESCENDING so newest first
        data.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (application) => {
    setEditData(application);
  };

  const handleSave = async () => {
    try {
      const { id, timestamp, ...data } = editData;
      await updateDoc(doc(db, "internshipApplications", id), data);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...data } : app))
      );
      setEditData(null);
    } catch (err) {
      console.error("Error updating document:", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "internshipApplications", deleteId));
      setApplications((prev) => prev.filter((a) => a.id !== deleteId));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Not available";
    try {
      const date = new Date(isoString);
      return format(date, "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      app.userId?.toLowerCase().includes(term) ||
      app.fullName?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.phone?.toLowerCase().includes(term) ||
      app.institution?.toLowerCase().includes(term) ||
      app.program?.toLowerCase().includes(term) ||
      app.graduationYear?.toString().includes(term) ||
      app.department?.toLowerCase().includes(term) ||
      app.duration?.toLowerCase().includes(term) ||
      app.skills?.toLowerCase().includes(term)
    );
  });

  const exportData = filteredApplications.map((app) => ({
    "User ID": app.userId || "N/A",
    "Full Name": app.fullName || "",
    Email: app.email || "",
    Phone: app.phone || "",
    Institution: app.institution || "",
    Program: app.program || "",
    "Graduation Year": app.graduationYear || "",
    Department: app.department || "",
    Duration: app.duration || "",
    Skills: app.skills || "",
    Submitted: app.timestamp ? formatDate(app.timestamp) : "Not available",
  }));

  const columns = [
    { key: "userId", label: "User ID" },
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "institution", label: "Institution" },
    { key: "program", label: "Program" },
    { key: "graduationYear", label: "Graduation Year" },
    { key: "department", label: "Department" },
    { key: "duration", label: "Duration" },
    { key: "skills", label: "Skills" },
    {
      key: "timestamp",
      label: "Submitted",
      render: (value) => formatDate(value),
    },
  ];

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
          Internship Applications
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CsvExportButton
            data={exportData}
            filename="internship_applications.csv"
          />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredApplications}
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
        fields={[
          { name: "userId", label: "User ID" },
          { name: "fullName", label: "Full Name" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          { name: "institution", label: "Institution" },
          { name: "program", label: "Program" },
          { name: "graduationYear", label: "Graduation Year" },
          { name: "department", label: "Department" },
          { name: "duration", label: "Duration" },
          { name: "skills", label: "Skills" },
        ]}
        onChange={setEditData}
        onSave={handleSave}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this application?"
      />
    </Paper>
  );
}
