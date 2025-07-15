import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import CsvExportButton from "../../tools/CsvExportButton";
import DataTable from "../../tools/DataTable";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        let timestamp = null;
        if (docData.timestamp?.toDate) {
          timestamp = docData.timestamp.toDate();
        } else if (typeof docData.timestamp === "number") {
          timestamp = new Date(docData.timestamp);
        } else if (typeof docData.timestamp === "string") {
          timestamp = new Date(docData.timestamp);
        }
        return {
          id: docSnap.id,
          name: docData.name || "",
          phone: docData.phone || "",
          cnic: docData.cnic || "",
          gender: docData.gender || "",
          department: docData.department || "",
          service: docData.service || "",
          message: docData.message || "",
          timestamp,
        };
      });

      data.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp - a.timestamp;
      });

      setAppointments(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleEdit = (row) => {
    setEditData({ ...row });
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    const cleaned = {
      name: editData.name.trim(),
      phone: editData.phone.trim(),
      cnic: editData.cnic.trim(),
      gender: editData.gender.trim(),
      department: editData.department.trim(),
      service: editData.service.trim(),
      message: editData.message.trim(),
    };
    await updateDoc(doc(db, "appointments", editData.id), cleaned);
    setEditData(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "appointments", deleteId));
    setDeleteId(null);
  };

  const exportData = appointments.map((a) => ({
    ID: a.id,
    Name: a.name,
    Phone: a.phone,
    CNIC: a.cnic,
    Gender: a.gender,
    Department: a.department,
    Service: a.service,
    Message: a.message,
    Submitted: a.timestamp ? format(new Date(a.timestamp), "MMM dd, yyyy hh:mm a") : "N/A",
  }));

  const filtered = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.phone.toLowerCase().includes(term) ||
      a.cnic.toLowerCase().includes(term) ||
      a.gender.toLowerCase().includes(term) ||
      a.department.toLowerCase().includes(term) ||
      a.service.toLowerCase().includes(term) ||
      a.message.toLowerCase().includes(term)
    );
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "cnic", label: "CNIC" },
    { key: "gender", label: "Gender" },
    { key: "department", label: "Department" },
    { key: "service", label: "Service" },
    { key: "message", label: "Message" },
    {
      key: "timestamp",
      label: "Submitted",
      render: (v) => (v ? format(new Date(v), "MMM dd, yyyy hh:mm a") : "N/A"),
    },
  ];

  if (loading) return <Typography>Loading appointments...</Typography>;

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Appointments</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CsvExportButton
            data={exportData}
            filename={`appointments_${Date.now()}.csv`}
          />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filtered}
        renderActions={(row) => (
          <>
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteId(row.id)}
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
          { name: "name", label: "Name" },
          { name: "phone", label: "Phone" },
          { name: "cnic", label: "CNIC" },
          { name: "gender", label: "Gender" },
          { name: "department", label: "Department" },
          { name: "service", label: "Service" },
          { name: "message", label: "Message" },
        ]}
        onChange={setEditData}
        onSave={handleSaveEdit}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        description="Are you sure you want to delete this appointment?"
      />
    </Paper>
  );
}
