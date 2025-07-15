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
  Info as AboutIcon,
  MedicalServices as ServicesIcon,
  People as DoctorsIcon,
  Favorite as TipsIcon,
  Support as SupportIcon,
  ContactMail as ContactIcon,
  Settings as SettingsIcon,
  School as ProgramsIcon,
  VolunteerActivism as VolunteerIcon,
  Work as InternshipIcon
} from "@mui/icons-material";

const managementOptions = [
  {
    title: "About Screen",
    path: "/app-data/about",
    icon: <AboutIcon />,
    description: "Manage about page content and sections",
    color: "#4e79a7"
  },
  {
    title: "Services",
    path: "/app-data/services",
    icon: <ServicesIcon />,
    description: "Manage healthcare services offered",
    color: "#f28e2b"
  },
  {
    title: "Doctors",
    path: "/app-data/doctors",
    icon: <DoctorsIcon />,
    description: "Manage doctor profiles and information",
    color: "#e15759"
  },
  {
    title: "Health Tips",
    path: "/app-data/tips",
    icon: <TipsIcon />,
    description: "Manage health tips and wellness advice",
    color: "#76b7b2"
  },
  {
    title: "Apply Now Screen",
    path: "/app-data/support",
    icon: <SupportIcon />,
    description: "View and manage user support requests",
    color: "#59a14f"
  },
  {
    title: "Contact Messages and Share Link of App",
    path: "/app-data/contacts",
    icon: <ContactIcon />,
    description: "View and manage contact form submissions and link of app",
    color: "#edc948"
  },
  {
    title: "Programs",
    path: "/app-data/programs",
    icon: <ProgramsIcon />,
    description: "Manage health programs and registrations",
    color: "#9c755f"
  },
  {
    title: "Training Programs",
    path: "/app-data/training-programs",
    icon: <ProgramsIcon />,
    description: "Manage paramedical training forms",
    color: "#59a14f"
  },
  {
    title: "Volunteer Programs",
    path: "/app-data/volunteer-programs",
    icon: <VolunteerIcon />,
    description: "Manage volunteer application forms",
    color: "#f28e2b"
  },
  {
    title: "Internship Programs",
    path: "/app-data/internship-programs",
    icon: <InternshipIcon />,
    description: "Manage internship application forms and fields",
    color: "#4e79a7"
  },
  {
    title: "Skills Development Programs",
    path: "/app-data/skills-development-programs",
    icon: <InternshipIcon />,
    description: "Manage skills development forms and fields",
    color: "#4e79a7"
  }
];

export default function AppDataManager() {
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
          <SettingsIcon sx={{ fontSize: 40 }} />
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
          App Data Management
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          Central dashboard to manage all your application content and data
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {managementOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              component={Link}
              to={option.path}
              sx={{
                height: "100%",
                borderRadius: 3,
                textDecoration: "none",
                background: `linear-gradient(135deg, ${option.color}20, #ffffff)`,
                borderLeft: `4px solid ${option.color}`,
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Avatar
                  sx={{
                    backgroundColor: `${option.color}20`,
                    color: option.color,
                    width: 60,
                    height: 60,
                    mb: 3
                  }}
                >
                  {React.cloneElement(option.icon, { sx: { fontSize: 30 } })}
                </Avatar>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {option.description}
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
                    Manage Now
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
            Select any card above to manage specific application content
          </Typography>
        </Box>
      )}
    </Container>
  );
}
