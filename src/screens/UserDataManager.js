import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tabs,
  Tab,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Avatar,
  TextField,
  InputAdornment,
  Chip,
  useTheme,
  alpha,
  Skeleton
} from "@mui/material";
import {
  Search,
  Person,
  Email,
  CalendarToday,
  WorkOutline,
  SchoolOutlined,
  ContactMailOutlined,
  FilterList,
  Assignment,
  PeopleAltOutlined
} from "@mui/icons-material";

export default function UserDataManager() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // Load selected user's data
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUser) return;

      setLoading(true);
      try {
        const [volunteers, internships, trainings, appointments, contacts, program, skills] = await Promise.all([
          getDocs(query(collection(db, "volunteerApplications"), where("userId", "==", selectedUser.id))),
          getDocs(query(collection(db, "internshipApplications"), where("userId", "==", selectedUser.id))),
          getDocs(query(collection(db, "trainingApplications"), where("userId", "==", selectedUser.id))),
          getDocs(query(collection(db, "appointments"), where("userId", "==", selectedUser.id))),
          getDocs(query(collection(db, "contactMessages"), where("userId", "==", selectedUser.id))),
          getDocs(query(collection(db, "programRegistrations"), where("userId", "==", selectedUser.id))),
          getDocs(query(collection(db, "skillsDevelopment"), where("userId", "==", selectedUser.id))),
        ]);

        setUserData({
          volunteers: volunteers.docs.map((d) => ({ id: d.id, ...d.data() })),
          internships: internships.docs.map((d) => ({ id: d.id, ...d.data() })),
          trainings: trainings.docs.map((d) => ({ id: d.id, ...d.data() })),
          appointments: appointments.docs.map((d) => ({ id: d.id, ...d.data() })),
          contacts: contacts.docs.map((d) => ({ id: d.id, ...d.data() })),
          program: program.docs.map((d) => ({ id: d.id, ...d.data() })),
          skills: skills.docs.map((d) => ({ id: d.id, ...d.data() })),
        });
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedUser]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          color: theme.palette.primary.dark,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PeopleAltOutlined fontSize="large" />
          <Box>
            User Management
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
              Manage all user applications and data
            </Typography>
          </Box>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Users List Panel */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Header */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: alpha(theme.palette.primary.light, 0.1),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <FilterList fontSize="small" /> User Directory
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper
                  }
                }}
              />
            </Box>
            
            {/* User List */}
            {loading ? (
              <Box sx={{ p: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1, borderRadius: 2 }} />
                ))}
              </Box>
            ) : (
              <List sx={{ 
                flexGrow: 1,
                overflowY: "auto",
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                },
              }}>
                {filteredUsers.map((user) => (
                  <ListItem disablePadding key={user.id}>
                    <ListItemButton
                      selected={selectedUser?.id === user.id}
                      onClick={() => setSelectedUser(user)}
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          }
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          width: 40, 
                          height: 40,
                          bgcolor: selectedUser?.id === user.id ? 
                            theme.palette.primary.main : 
                            theme.palette.grey[400],
                          color: theme.palette.common.white
                        }}
                      >
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography fontWeight={500} noWrap>
                            {user.displayName || user.email || "No Name"}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {user.email}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            
            {/* Footer */}
            <Box sx={{ 
              p: 1.5, 
              backgroundColor: alpha(theme.palette.grey[100], 0.5),
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center'
            }}>
              <Chip 
                label={`${filteredUsers.length} users found`} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>

        {/* User Details Panel */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {selectedUser ? (
              <>
                {/* User Header */}
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: alpha(theme.palette.primary.light, 0.05),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar 
                      sx={{ 
                        mr: 3, 
                        width: 64, 
                        height: 64,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        fontSize: '1.75rem'
                      }}
                    >
                      {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.name?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {selectedUser.displayName || selectedUser.name || "No Name"}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body1" color="text.secondary">
                            {selectedUser.email}
                          </Typography>
                        </Box>
                        <Chip 
                          label="Active" 
                          size="small" 
                          color="success"
                          variant="outlined"
                          sx={{ 
                            height: 20,
                            fontSize: '0.75rem',
                            '& .MuiChip-label': { px: 1 }
                          }} 
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ 
                  px: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{ 
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: 3,
                        backgroundColor: theme.palette.primary.main
                      }
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab 
                      icon={<WorkOutline fontSize="small" />} 
                      iconPosition="start" 
                      label="Volunteer" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                    <Tab 
                      icon={<SchoolOutlined fontSize="small" />} 
                      iconPosition="start" 
                      label="Internship" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                    <Tab 
                      icon={<SchoolOutlined fontSize="small" />} 
                      iconPosition="start" 
                      label="Training" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                    <Tab 
                      icon={<CalendarToday fontSize="small" />} 
                      iconPosition="start" 
                      label="Appointments" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                    <Tab 
                      icon={<ContactMailOutlined fontSize="small" />} 
                      iconPosition="start" 
                      label="Messages" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                    <Tab 
                      icon={<Assignment fontSize="small" />} 
                      iconPosition="start" 
                      label="Programs" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                    <Tab 
                      icon={<WorkOutline fontSize="small" />} 
                      iconPosition="start" 
                      label="Skills Development" 
                      sx={{ minHeight: 48, py: 1.5 }}
                    />
                  </Tabs>
                </Box>

                {/* Content */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflow: 'auto',
                  p: loading ? 0 : 3
                }}>
                  {loading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      minHeight: 400
                    }}>
                      <CircularProgress size={60} thickness={4} />
                    </Box>
                  ) : (
                    <>
                      {activeTab === 0 && (
                        <EnhancedDataTable data={userData?.volunteers} type="Volunteer" />
                      )}
                      {activeTab === 1 && (
                        <EnhancedDataTable data={userData?.internships} type="Internship" />
                      )}
                      {activeTab === 2 && (
                        <EnhancedDataTable data={userData?.trainings} type="Training" />
                      )}
                      {activeTab === 3 && (
                        <EnhancedDataTable data={userData?.appointments} type="Appointment" />
                      )}
                      {activeTab === 4 && (
                        <EnhancedDataTable data={userData?.contacts} type="Contact" />
                      )}
                      {activeTab === 5 && (
                        <EnhancedDataTable data={userData?.program} type="Programs" />
                      )}
                      {activeTab === 6 && (
                        <EnhancedDataTable data={userData?.skils} type="Skills Development" />
                      )}
                    </>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: "center", 
                p: 8,
                color: theme.palette.text.secondary
              }}>
                <Person sx={{ 
                  fontSize: 80, 
                  color: alpha(theme.palette.text.secondary, 0.3), 
                  mb: 3 
                }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  No user selected
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 400 }}>
                  Select a user from the directory to view their applications, appointments, and messages
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function EnhancedDataTable({ data, type }) {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        minHeight: 300,
        color: alpha(theme.palette.text.secondary, 0.7),
        textAlign: 'center',
        p: 4
      }}>
        <ContactMailOutlined sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          No {type} records found
        </Typography>
        <Typography variant="body1">
          This user hasn't submitted any {type.toLowerCase()} applications yet
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ 
      boxShadow: 'none',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <Table size="small" sx={{ 
        minWidth: 650,
        '& .MuiTableCell-root': {
          py: 1.5,
          fontSize: '0.875rem'
        }
      }}>
        <TableHead sx={{ 
          background: alpha(theme.palette.primary.light, 0.1)
        }}>
          <TableRow>
            {Object.keys(data[0]).map((k) => (
              <TableCell key={k} sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap'
              }}>
                {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={row.id} 
              hover 
              sx={{ 
                '&:nth-of-type(even)': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.05)
                }
              }}
            >
              {Object.keys(row).map((k) => (
                <TableCell key={k} sx={{
                  maxWidth: 250,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {formatValue(row[k])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function formatValue(value) {
  if (value?.toDate) {
    return value.toDate().toLocaleString();
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value === undefined || value === null) {
    return '-';
  }
  return String(value);
}