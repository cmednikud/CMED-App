import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Paper, Box, Typography, CircularProgress } from "@mui/material";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";
import DataTable from "../../tools/DataTable";
import CsvExportButton from "../../tools/CsvExportButton";

export default function SkillsApplication() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "skillsDevelopment"));
        const data = querySnapshot.docs.map((docSnap) => {
          const docData = docSnap.data();
          let timestamp = null;
          if (docData.createdAt?.toDate) {
            timestamp = docData.createdAt.toDate();
          } else if (docData.createdAt) {
            timestamp = new Date(docData.createdAt);
          }
          return {
            id: docSnap.id,
            skillName: docData.skillName || "",
            category: docData.category || "",
            currentLevel: docData.currentLevel || "",
            targetLevel: docData.targetLevel || "",
            hoursPracticed: docData.hoursPracticed || 0,
            learningResources: docData.learningResources || "",
            notes: docData.notes || "",
            createdAt: timestamp ? timestamp.toISOString() : null,
          };
        });

        // ✅ Sort newest first
        data.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setSkills(data);
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (skill) => {
    setEditData(skill);
  };

  const handleSave = async (updated) => {
    try {
      const { id, createdAt, ...data } = updated;

      const cleanedData = {
        ...data,
        skillName: data.skillName.trim(),
        category: data.category.trim(),
        currentLevel: data.currentLevel.trim(),
        targetLevel: data.targetLevel.trim(),
        hoursPracticed: Number(data.hoursPracticed) || 0,
        learningResources: data.learningResources.trim(),
        notes: data.notes.trim(),
      };

      await updateDoc(doc(db, "skillsDevelopment", id), cleanedData);

      setSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...cleanedData } : s))
      );
      setEditData(null);
    } catch (err) {
      console.error("Error updating skill:", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "skillsDevelopment", deleteId));
      setSkills((prev) => prev.filter((s) => s.id !== deleteId));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error("Error deleting skill:", err);
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

  const filteredSkills = skills.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.skillName.toLowerCase().includes(search) ||
      s.category.toLowerCase().includes(search) ||
      s.currentLevel.toLowerCase().includes(search) ||
      s.targetLevel.toLowerCase().includes(search) ||
      s.learningResources.toLowerCase().includes(search) ||
      s.notes.toLowerCase().includes(search)
    );
  });

  const exportData = filteredSkills.map((s) => ({
    "Skill Name": s.skillName,
    Category: s.category,
    "Current Level": s.currentLevel,
    "Target Level": s.targetLevel,
    "Hours Practiced": s.hoursPracticed,
    "Learning Resources": s.learningResources,
    "Progress Notes": s.notes,
    "Created At": formatDate(s.createdAt),
  }));

  const columns = [
    { key: "skillName", label: "Skill Name" },
    { key: "category", label: "Category" },
    { key: "currentLevel", label: "Current Level" },
    { key: "targetLevel", label: "Target Level" },
    { key: "hoursPracticed", label: "Hours Practiced" },
    { key: "learningResources", label: "Learning Resources" },
    { key: "notes", label: "Progress Notes" },
    {
      key: "createdAt",
      label: "Created At",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <button
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "4px 8px",
              cursor: "pointer",
            }}
            onClick={() => handleEditClick(row)}
          >
            Edit
          </button>
          <button
            style={{
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "4px 8px",
              cursor: "pointer",
            }}
            onClick={() => handleDeleteClick(row.id)}
          >
            Delete
          </button>
        </Box>
      ),
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
          Skills Development
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CsvExportButton data={exportData} filename="skills_development.csv" />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredSkills}
        onEdit={handleEditClick}
        onDelete={(id) => handleDeleteClick(id)}
      />

      <EditDialog
        open={!!editData}
        data={editData}
        fields={[
          { name: "skillName", label: "Skill Name" },
          { name: "category", label: "Category" },
          { name: "currentLevel", label: "Current Level" },
          { name: "targetLevel", label: "Target Level" },
          { name: "hoursPracticed", label: "Hours Practiced", type: "number" },
          { name: "learningResources", label: "Learning Resources" },
          { name: "notes", label: "Progress Notes" },
        ]}
        onSave={handleSave}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this skill record?"
      />
    </Paper>
  );
}
