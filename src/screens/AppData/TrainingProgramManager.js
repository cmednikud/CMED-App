import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // ✅ your normal Firebase config
import SortableFields from "../../tools/SortableFields"; // ✅ your reusable sorting component

export default function TrainingProgramManager() {
  const [fields, setFields] = useState([]);

  // Load existing form config
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "appContent", "trainingScreen");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (
          data.trainingProgram &&
          Array.isArray(data.trainingProgram.formFields)
        ) {
          setFields(data.trainingProgram.formFields);
        }
      }
    };
    fetchData();
  }, []);

  // Add new empty field
  const addField = () => {
    setFields([
      ...fields,
      {
        name: "",
        label: "",
        type: "text",
        required: false,
        options: []
      }
    ]);
  };

  // Update a field
  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  // Remove a field
  const deleteField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  // Save to Firestore
  const saveFields = async () => {
    const docRef = doc(db, "appContent", "trainingScreen");
    await setDoc(
      docRef,
      { trainingProgram: { formFields: fields } },
      { merge: true }
    );
    alert("✅ Training Program saved successfully!");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Training Program Manager
      </Typography>

      <SortableFields
        fields={fields}
        setFields={setFields}
        updateField={updateField}
        deleteField={deleteField}
      />

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={addField}
        >
          Add Field
        </Button>
      </Box>

      <Button variant="contained" color="success" onClick={saveFields}>
        Save Training Program
      </Button>
    </Container>
  );
}
