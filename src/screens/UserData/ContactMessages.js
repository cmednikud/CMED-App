import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import CsvExportButton from "../../tools/CsvExportButton";
import DataTable from "../../tools/DataTable";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "contactMessages"), (snapshot) => {
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
          email: docData.email || "",
          phone: docData.phone || "",
          subject: docData.subject || "",
          message: docData.message || "",
          timestamp: timestamp ? timestamp.toISOString() : null,
        };
      });

      // ✅ Sort by timestamp DESCENDING
      data.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setMessages(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleEdit = (row) => {
    setEditData({ ...row });
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    await updateDoc(doc(db, "contactMessages", editData.id), {
      name: editData.name,
      phone: editData.phone,
      subject: editData.subject,
      message: editData.message,
    });
    setEditData(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "contactMessages", deleteId));
    setDeleteId(null);
  };

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return format(new Date(iso), "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid";
    }
  };

  const exportData = messages.map((m) => ({
    ID: m.id,
    Name: m.name,
    Email: m.email,
    Phone: m.phone,
    Subject: m.subject,
    Message: m.message,
    Submitted: formatDate(m.timestamp),
  }));

  const filteredMessages = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.phone.toLowerCase().includes(term) ||
      m.subject.toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term)
    );
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message" },
    {
      key: "timestamp",
      label: "Submitted",
      render: (value) => formatDate(value),
    },
  ];

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
        <Typography variant="h5">Contact Messages</Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CsvExportButton
            data={exportData}
            filename={`contact_messages_${Date.now()}.csv`}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredMessages}
          renderActions={(row) => (
            <>
              <IconButton size="small" onClick={() => handleEdit(row)}>
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
      )}

      <EditDialog
        open={!!editData}
        data={editData}
        fields={[
          { name: "name", label: "Name" },
          { name: "phone", label: "Phone" },
          { name: "subject", label: "Subject" },
          { name: "message", label: "Message" },
        ]}
        onChange={setEditData}
        onSave={handleSaveEdit}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this message?"
      />
    </Paper>
  );
}
