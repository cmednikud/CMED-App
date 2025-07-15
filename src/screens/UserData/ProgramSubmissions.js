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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";

import SearchBar from "../../tools/SearchBar";
import CsvExportButton from "../../tools/CsvExportButton";
import EditDialog from "../../tools/EditDialog";
import DeleteDialog from "../../tools/DeleteDialog";

export default function ProgramSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionsSearchTerm, setSubmissionsSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "programRegistrations"), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        let timestamp = null;

        if (docData.submittedAt?.toDate) {
          timestamp = docData.submittedAt.toDate();
        } else if (typeof docData.submittedAt === "number") {
          timestamp = new Date(docData.submittedAt);
        } else if (typeof docData.submittedAt === "string") {
          timestamp = new Date(docData.submittedAt);
        }

        return {
          id: docSnap.id,
          programName: docData.programName || "",
          status: docData.status || "pending",
          userId: docData.userId || "",
          submittedAt: timestamp ? timestamp.toISOString() : null,
          data: docData,
        };
      });

      setSubmissions(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const groupedPrograms = submissions.reduce((acc, sub) => {
    const key = sub.programName || "Unknown Program";
    if (!acc[key]) acc[key] = [];
    acc[key].push(sub);
    return acc;
  }, {});

  Object.keys(groupedPrograms).forEach((programName) => {
    groupedPrograms[programName].sort((a, b) => {
      if (!a.submittedAt) return 1;
      if (!b.submittedAt) return -1;
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });
  });

  const filteredPrograms = Object.entries(groupedPrograms).filter(
    ([programName]) =>
      programName.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return format(new Date(iso), "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid";
    }
  };

  const uniqueFields =
    selectedProgram?.submissions?.reduce((fields, sub) => {
      Object.keys(sub.data).forEach((key) => {
        if (!["programName", "status", "userId", "submittedAt"].includes(key)) {
          fields.add(key);
        }
      });
      return fields;
    }, new Set()) || new Set();

  const handleDeleteSubmission = async (id) => {
    await deleteDoc(doc(db, "programRegistrations", id));
    setDeleteId(null);
  };

  const handleDeleteProgram = async (programName) => {
    const programSubs = groupedPrograms[programName] || [];
    const batchPromises = programSubs.map((sub) =>
      deleteDoc(doc(db, "programRegistrations", sub.id))
    );
    await Promise.all(batchPromises);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    const { id, ...rest } = editData;

    await updateDoc(doc(db, "programRegistrations", id), rest);
    setEditData(null);
  };

  const filteredSubmissions = selectedProgram
    ? selectedProgram.submissions.filter((sub) => {
        const term = submissionsSearchTerm.trim().toLowerCase();
        return (
          sub.userId.toLowerCase().includes(term) ||
          sub.status.toLowerCase().includes(term) ||
          Object.values(sub.data)
            .join(" ")
            .toLowerCase()
            .includes(term)
        );
      })
    : [];

  const programsCsv = filteredPrograms.map(([programName, subs]) => ({
    Program: programName,
    Submissions: subs.length,
  }));

  const submissionsCsv = filteredSubmissions.map((sub) => {
    const base = {
      ID: sub.id,
      Program: sub.programName,
      UserID: sub.userId,
      Status: sub.status,
      SubmittedAt: formatDate(sub.submittedAt),
    };
    uniqueFields.forEach((field) => {
      base[field] = sub.data[field] ?? "";
    });
    return base;
  });

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5">Programs</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search programs..."
          />
          <CsvExportButton
            data={programsCsv}
            filename={`programs_${Date.now()}.csv`}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Program</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map(([programName, subs]) => (
                  <TableRow key={programName}>
                    <TableCell>{programName}</TableCell>
                    <TableCell>{subs.length}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedProgram({ name: programName, submissions: subs });
                          setSubmissionsSearchTerm("");
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProgram(programName)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography align="center">
                      No matching programs found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ✅ Modal for Submissions */}
      <Dialog
        open={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Submissions for {selectedProgram?.name}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh", overflow: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <SearchBar
              value={submissionsSearchTerm}
              onChange={setSubmissionsSearchTerm}
              placeholder="Search submissions..."
            />
            <CsvExportButton
              data={submissionsCsv}
              filename={`${selectedProgram?.name || "submissions"}_${Date.now()}.csv`}
            />
          </Box>

          {selectedProgram && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    {[...uniqueFields].map((field) => (
                      <TableCell key={field}>{field}</TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.map((sub, index) => (
                    <TableRow key={sub.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{sub.userId}</TableCell>
                      <TableCell>{sub.status}</TableCell>
                      <TableCell>{formatDate(sub.submittedAt)}</TableCell>
                      {[...uniqueFields].map((field) => (
                        <TableCell key={field}>
                          {typeof sub.data[field] === "object"
                            ? JSON.stringify(sub.data[field])
                            : String(sub.data[field] || "")}
                        </TableCell>
                      ))}
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            setEditData({
                              id: sub.id,
                              ...sub.data,
                            })
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(sub.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5 + uniqueFields.size}>
                        <Typography align="center">
                          No matching submissions found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProgram(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <EditDialog
        open={!!editData}
        data={editData}
        fields={[...uniqueFields].map((field) => ({
          name: field,
          label: field,
        }))}
        onChange={setEditData}
        onSave={handleSaveEdit}
        onCancel={() => setEditData(null)}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDeleteSubmission(deleteId)}
        title="Confirm Delete"
        description="Are you sure you want to delete this submission?"
      />
    </Paper>
  );
}
