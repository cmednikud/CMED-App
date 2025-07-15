import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  VolunteerActivism as VolunteerIcon,
  Work as InternshipIcon,
  School as TrainingIcon,
  CalendarMonth as AppointmentIcon,
  ContactMail as ContactIcon,
  Assignment as SubmissionIcon,
  DashboardCustomize as DashboardIcon,
} from "@mui/icons-material";

// === Quick Access Options ===
const quickLinks = [
  {
    title: "Volunteer Applications",
    path: "/app-view/volunteers",
    icon: <VolunteerIcon />,
    description: "Review and manage volunteer applications.",
    color: "#4e79a7"
  },
  {
    title: "Internship Applications",
    path: "/app-view/internships",
    icon: <InternshipIcon />,
    description: "Review and manage internship applications.",
    color: "#f28e2b"
  },
  {
    title: "Training Applications",
    path: "/app-view/trainings",
    icon: <TrainingIcon />,
    description: "Oversee paramedical training applicants.",
    color: "#e15759"
  },
  {
    title: "Appointments",
    path: "/app-view/appointments",
    icon: <AppointmentIcon />,
    description: "View and manage patient appointments.",
    color: "#76b7b2"
  },
  {
    title: "Contact Messages",
    path: "/app-view/contacts",
    icon: <ContactIcon />,
    description: "Read and respond to contact form messages.",
    color: "#59a14f"
  },
  {
    title: "Program Submissions",
    path: "/app-view/program-submissions",
    icon: <SubmissionIcon />,
    description: "Access submissions for all active programs.",
    color: "#edc948"
  },
  {
    title: "Skills Development Program",
    path: "/app-view/skills-application",
    icon: <InternshipIcon />,
    description: "Access submissions for all active programs.",
    color: "#edc948"
  }
];

export default function AppQuickAccess() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Avatar
          sx={{
            backgroundColor: theme.palette.primary.main,
            width: 80,
            height: 80,
            mb: 3,
            mx: "auto",
            boxShadow: theme.shadows[4]
          }}
        >
          <DashboardIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          Quick Access Dashboard
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          Quickly navigate to the most important management screens for your applications.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {quickLinks.map((item, index) => (
            <Grid
            item
            xs={12}   // Full width on mobile
            sm={6}     // 2 per row on small screens
            md={4}     // 3 per row on medium screens and up
            key={index}
            >
            <Card
                component={Link}
                to={item.path}
                sx={{
                height: "100%",
                borderRadius: 3,
                textDecoration: "none",
                background: `linear-gradient(135deg, ${item.color}15, #ffffff)`,
                borderLeft: `4px solid ${item.color}`,
                transition: "all 0.3s ease",
                '&:hover': {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
                }
                }}
            >
                <CardContent sx={{ p: 4 }}>
                <Avatar
                    sx={{
                    backgroundColor: `${item.color}25`,
                    color: item.color,
                    width: 60,
                    height: 60,
                    mb: 3
                    }}
                >
                    {React.cloneElement(item.icon, { sx: { fontSize: 30 } })}
                </Avatar>
                <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                >
                    {item.title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    {item.description}
                </Typography>
                <Box
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                    '& > div': {
                        transition: "transform 0.3s ease"
                    },
                    '&:hover > div': {
                        transform: "translateX(5px)"
                    }
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Open Now
                    </Typography>
                    <Box sx={{ ml: 1 }}>→</Box>
                </Box>
                </CardContent>
            </Card>
            </Grid>
        ))}
        </Grid>


      {!isMobile && (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Click any card to jump directly to that section.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
