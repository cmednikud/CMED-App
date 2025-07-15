import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Drawer,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonIcon from "@mui/icons-material/Person";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";

const navLinks = [
  { label: "User Data Manager", path: "/userdatamanager", icon: <PersonIcon /> },
  { label: "Users", path: "/users", icon: <PersonIcon /> },
  { label: "View User Data", path: "/app-view", icon: <SettingsApplicationsIcon /> },
  { label: "App Data", path: "/app-data", icon: <SettingsApplicationsIcon /> },
  { label: "Gallery", path: "/gallery", icon: <PersonIcon /> },
];

export default function Sidebar({
  onLogout,
  user,
  mobileOpen,
  handleDrawerToggle,
  isMobile,
}) {
  const location = useLocation();
  const drawerWidth = 240; // Adjusted size

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <MedicalServicesIcon sx={{ fontSize: 32, mr: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          CMED NIKUD
        </Typography>
      </Box>

      {/* User Info */}
      {user && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Avatar src={user.photoURL} sx={{ width: 40, height: 40, mr: 2 }}>
            {user.displayName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user.displayName || "Admin"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List disablePadding>
          {navLinks.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname.startsWith(item.path)}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  px: 3,
                  py: 1.25,
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.main",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Logout at Bottom */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            py: 1.25,
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          top: isMobile ? 0 : "70px", // below header on desktop
          height: isMobile ? "100%" : "calc(100% - 70px)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
