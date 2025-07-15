import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

export default function EditDialog({
  open,
  fields,
  data,
  onChange,
  onSave,
  onCancel,
  title = "Edit Record",
}) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {fields.map((field) => (
          <TextField
            key={field.name}
            margin="dense"
            name={field.name}
            label={field.label}
            fullWidth
            value={data?.[field.name] || ""}
            onChange={(e) =>
              onChange({ ...data, [field.name]: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button onClick={onSave} startIcon={<SaveIcon />}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
