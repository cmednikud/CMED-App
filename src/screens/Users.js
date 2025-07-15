import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Paper,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import SearchBar from "../tools/SearchBar";
import CsvExportButton from "../tools/CsvExportButton";
import DataTable from "../tools/DataTable";
import EditDialog from "../tools/EditDialog";
import DeleteDialog from "../tools/DeleteDialog";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(data);
    };
    fetchData();
  }, []);

  const handleEditSave = async () => {
    if (!editData) return;
    const { id, ...data } = editData;
    await updateDoc(doc(db, "users", id), data);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    setEditData(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "users", deleteId));
    setUsers((prev) => prev.filter((u) => u.id !== deleteId));
    setDeleteId(null);
  };

  const exportData = users.map((u, index) => ({
    "Serial No.": index + 1,
    ID: u.id,
    Name: u.name || "",
    Email: u.email || "",
    "Email Verified": u.emailVerified ? "Yes" : "No",
    "Created At": u.createdAt
      ? new Date(u.createdAt.seconds * 1000).toLocaleString()
      : "",
    "Last Login": u.lastLogin
      ? new Date(u.lastLogin.seconds * 1000).toLocaleString()
      : "",
  }));

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  });

  const columns = [
    { key: "serial", label: "S.No" },
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "emailVerified", label: "Email Verified" },
    { key: "createdAt", label: "Created At" },
    { key: "lastLogin", label: "Last Login" },
  ];

  const rows = filteredUsers.map((user, index) => ({
    ...user,
    serial: index + 1,
    emailVerified: user.emailVerified ? "Yes" : "No",
    createdAt: user.createdAt
      ? new Date(user.createdAt.seconds * 1000).toLocaleString()
      : "",
    lastLogin: user.lastLogin
      ? new Date(user.lastLogin.seconds * 1000).toLocaleString()
      : "",
  }));

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
        <Typography variant="h5">Users ({filteredUsers.length})</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchBar
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <CsvExportButton
            data={exportData}
            filename={`users_${Date.now()}.csv`}
          />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        renderActions={(row) => (
          <>
            <IconButton
              size="small"
              onClick={() =>
                setEditData({
                  ...row,
                  emailVerified: row.emailVerified === "Yes",
                })
              }
            >
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
          { name: "email", label: "Email" },
          {
            name: "emailVerified",
            label: "Email Verified (true/false)",
          },
        ]}
        onChange={setEditData}
        onSave={handleEditSave}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this user?"
      />
    </Paper>
  );
}
