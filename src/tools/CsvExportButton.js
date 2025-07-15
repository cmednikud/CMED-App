import React from "react";
import { Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { CSVLink } from "react-csv";

export default function CsvExportButton({ data, filename = "export.csv" }) {
  return (
    <CSVLink data={data} filename={filename} style={{ textDecoration: "none" }}>
      <Button variant="contained" color="primary" startIcon={<FileDownloadIcon />}>
        Export CSV
      </Button>
    </CSVLink>
  );
}
