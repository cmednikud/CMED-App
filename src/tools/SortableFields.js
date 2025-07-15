import React from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  Chip
} from "@mui/material";
import { DragHandle, Delete } from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

export default function SortableFields({
  fields,
  setFields,
  updateField,
  deleteField
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(fields);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setFields(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="fields">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {fields.map((field, index) => (
              <Draggable
                key={index}
                draggableId={`field-${index}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{
                      p: 3,
                      mb: 3,
                      background: snapshot.isDragging ? "#f0f0f0" : "white"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Field #{index + 1}
                      </Typography>
                      <Box
                        {...provided.dragHandleProps}
                        sx={{ cursor: "grab" }}
                      >
                        <DragHandle />
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Field Name"
                          fullWidth
                          value={field.name}
                          onChange={(e) =>
                            updateField(index, "name", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Label"
                          fullWidth
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, "label", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Type"
                          fullWidth
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, "type", e.target.value)
                          }
                          helperText="text, textarea, select, checkbox, number, multiselect"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Required"
                          fullWidth
                          select
                          SelectProps={{ native: true }}
                          value={field.required ? "true" : "false"}
                          onChange={(e) =>
                            updateField(
                              index,
                              "required",
                              e.target.value === "true"
                            )
                          }
                        >
                          <option value="true">Required</option>
                          <option value="false">Optional</option>
                        </TextField>
                      </Grid>

                      {(field.type === "select" ||
                        field.type === "checkbox" ||
                        field.type === "multiselect") && (
                        <Grid item xs={12}>
                          <TextField
                            label="Options (comma separated)"
                            fullWidth
                            value={
                              field.options ? field.options.join(",") : ""
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "options",
                                e.target.value
                                  .split(",")
                                  .map((o) => o.trim())
                              )
                            }
                          />
                          <Box sx={{ mt: 1 }}>
                            {field.options &&
                              field.options.map((opt, i) => (
                                <Chip
                                  key={i}
                                  label={opt}
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                          </Box>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <IconButton
                          color="error"
                          onClick={() => deleteField(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
