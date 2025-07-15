import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Box,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import CsvExportButton from "../../tools/CsvExportButton";
import DataTable from "../../tools/DataTable";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";

export default function TrainingApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "trainingApplications"));
      const data = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        let timestamp = null;
        if (docData.timestamp?.toDate) {
          timestamp = docData.timestamp.toDate();
        } else if (docData.timestamp) {
          timestamp = new Date(docData.timestamp);
        }
        return {
          id: docSnap.id,
          fullName: docData.fullName || "",
          phone: docData.phone || "",
          cnic: docData.cnic || "",
          education: docData.education || "",
          previousExperience: docData.previousExperience || "",
          trainingProgram: docData.trainingProgram || "",
          timestamp: timestamp ? timestamp.toISOString() : null,
        };
      });

      // ✅ Sort by newest first
      data.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setApps(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "trainingApplications", deleteId));
    setApps((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);
  };

  const handleEditClick = (app) => {
    setEditData({ ...app });
  };

  const handleSave = async () => {
    if (!editData) return;
    await updateDoc(doc(db, "trainingApplications", editData.id), {
      fullName: editData.fullName,
      phone: editData.phone,
      cnic: editData.cnic,
      education: editData.education,
      previousExperience: editData.previousExperience,
      trainingProgram: editData.trainingProgram,
    });
    setApps((prev) =>
      prev.map((a) => (a.id === editData.id ? { ...a, ...editData } : a))
    );
    setEditData(null);
  };

  const exportData = apps.map((a) => ({
    ID: a.id,
    "Full Name": a.fullName,
    Phone: a.phone,
    CNIC: a.cnic,
    Education: a.education,
    "Previous Experience": a.previousExperience,
    "Training Program": a.trainingProgram,
    Submitted: a.timestamp
      ? format(new Date(a.timestamp), "MMM dd, yyyy hh:mm a")
      : "N/A",
  }));

  const filteredApps = apps.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(term) ||
      a.phone.toLowerCase().includes(term) ||
      a.cnic.toLowerCase().includes(term) ||
      a.education.toLowerCase().includes(term) ||
      a.previousExperience.toLowerCase().includes(term) ||
      a.trainingProgram.toLowerCase().includes(term)
    );
  });

  const columns = [
    { key: "fullName", label: "Full Name" },
    { key: "phone", label: "Phone" },
    { key: "cnic", label: "CNIC" },
    { key: "education", label: "Education" },
    { key: "previousExperience", label: "Previous Experience" },
    { key: "trainingProgram", label: "Training Program" },
    {
      key: "timestamp",
      label: "Submitted",
      render: (value) =>
        value ? format(new Date(value), "MMM dd, yyyy hh:mm a") : "N/A",
    },
  ];

  if (loading) return <Typography>Loading training applications...</Typography>;

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5">Training Applications</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CsvExportButton
            data={exportData}
            filename={`training_applications_${Date.now()}.csv`}
          />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredApps}
        renderActions={(row) => (
          <>
            <IconButton size="small" onClick={() => handleEditClick(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      />

      <EditDialog
        open={!!editData}
        data={editData}
        fields={[
          { name: "fullName", label: "Full Name" },
          { name: "phone", label: "Phone" },
          { name: "cnic", label: "CNIC" },
          { name: "education", label: "Education" },
          { name: "previousExperience", label: "Previous Experience" },
          { name: "trainingProgram", label: "Training Program" },
        ]}
        onChange={setEditData}
        onSave={handleSave}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this training application?"
      />
    </Paper>
  );
}
