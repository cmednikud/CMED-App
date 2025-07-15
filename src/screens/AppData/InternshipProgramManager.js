import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import SortableFields from "../../tools/SortableFields";

export default function InternshipProgramManager() {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "appContent", "internshipScreen");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (
          data.internshipProgram &&
          Array.isArray(data.internshipProgram.formFields)
        ) {
          setFields(data.internshipProgram.formFields);
        }
      }
    };
    fetchData();
  }, []);

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

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const deleteField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const saveFields = async () => {
    const docRef = doc(db, "appContent", "internshipScreen");
    await setDoc(
      docRef,
      { internshipProgram: { formFields: fields } },
      { merge: true }
    );
    alert("✅ Internship Program saved successfully!");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Internship Program Manager
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
        Save Internship Program
      </Button>
    </Container>
  );
}
