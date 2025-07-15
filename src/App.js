// src/App.js

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Sidebar from "./screens/Sidebar";
import Login from "./screens/Login";
import Users from "./screens/Users";
import UserDataManager from "./screens/UserDataManager";
import Gallery from "./screens/Gallery/Gallery";

import AppDataView from "./screens/UserData/AppDataView";
import VolunteerApplications from "./screens/UserData/VolunteerApplications";
import InternshipApplications from "./screens/UserData/InternshipApplications";
import TrainingApplications from "./screens/UserData/TrainingApplications";
import Appointments from "./screens/UserData/Appointments";
import ContactMessages from "./screens/UserData/ContactMessages";
import SkillsApplication from "./screens/UserData/SkillsApplication";
import ProgramSubmissions from "./screens/UserData/ProgramSubmissions";

import AppDataManager from "./screens/AppData/AppDataManager";
import AboutManager from "./screens/AppData/AboutManager";
import ServicesManager from "./screens/AppData/ServicesManager";
import DoctorsManager from "./screens/AppData/DoctorsManager";
import HealthTipsManager from "./screens/AppData/HealthTipsManager";
import SupportManager from "./screens/AppData/SupportManager";
import ContactManager from "./screens/AppData/ContactManager";
import ProgramManager from "./screens/AppData/ProgramManager";
import TrainingProgramManager from "./screens/AppData/TrainingProgramManager";
import VolunteerProgramManager from "./screens/AppData/VolunteerProgramManager";
import InternshipProgramManager from "./screens/AppData/InternshipProgramManager";
import SkillsDevelopmentManager from "./screens/AppData/SkillsDevelopmentManager";
// Import your logo image (make sure it's in the correct path)
import logo from "./image.jpeg";


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      {/* Header Section - now with higher z-index than sidebar */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "70px",
        backgroundColor: "#2c3e50",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        zIndex: 1100, // Higher than sidebar
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}>
        <img 
          src={logo} 
          alt="Logo" 
          style={{
            height: "45px",
            width: "45px",
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "15px",
            border: "2px solid #3498db"
          }} 
        />
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            letterSpacing: "0.5px"
          }}>
            Continual Medical Education NIKUD
          </h1>
          <p style={{
            margin: 0,
            fontSize: "12px",
            opacity: 0.8,
            marginTop: "3px"
          }}>
            Admin Dashboard
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ 
        display: "flex",
        marginTop: "70px", // Header height
        minHeight: "calc(100vh - 70px)" // Viewport minus header
      }}>
        {/* Sidebar with proper z-index */}
        <div style={{
          position: "fixed",
          left: 0,
          top: "70px", // Below header
          bottom: 0,
          width: "240px",
          zIndex: 1000 // Lower than header but fixed
        }}>
          <Sidebar onLogout={() => signOut(auth)} />
        </div>

        {/* Content area with proper spacing */}
        <div style={{ 
          flex: 1,
          marginLeft: "240px", // Sidebar width
          padding: "25px",
          backgroundColor: "#f5f7fa",
          minHeight: "calc(100vh - 70px)"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 15px rgba(0,0,0,0.05)",
            padding: "25px",
            minHeight: "calc(100vh - 120px)" // Account for paddings
          }}>
            <Routes>
              {/* Core admin routes */}
              <Route path="/" element={<UserDataManager />} />
              <Route path="/userdatamanager" element={<UserDataManager />} />
              <Route path="/users" element={<Users />} />
              <Route path="/gallery" element={<Gallery />} />

              {/* App Data View main & sub routes */}
              <Route path="/app-view" element={<AppDataView />} />
              <Route path="/app-view/volunteers" element={<VolunteerApplications />} />
              <Route path="/app-view/internships" element={<InternshipApplications />} />
              <Route path="/app-view/trainings" element={<TrainingApplications />} />
              <Route path="/app-view/appointments" element={<Appointments />} />
              <Route path="/app-view/contacts" element={<ContactMessages />} />
              <Route path="/app-view/program-submissions" element={<ProgramSubmissions />} />
              <Route path="/app-view/skills-application" element={<SkillsApplication />} />

              {/* App Data main & sub routes */}
              <Route path="/app-data" element={<AppDataManager />} />
              <Route path="/app-data/about" element={<AboutManager />} />
              <Route path="/app-data/services" element={<ServicesManager />} />
              <Route path="/app-data/doctors" element={<DoctorsManager />} />
              <Route path="/app-data/tips" element={<HealthTipsManager />} />
              <Route path="/app-data/support" element={<SupportManager />} />
              <Route path="/app-data/contacts" element={<ContactManager />} />
              <Route path="/app-data/programs" element={<ProgramManager />} />
              <Route path="/app-data/training-programs" element={<TrainingProgramManager />} />
              <Route path="/app-data/volunteer-programs" element={<VolunteerProgramManager />} />
              <Route path="/app-data/internship-programs" element={<InternshipProgramManager />} />
              <Route path="/app-data/skills-development-programs" element={<SkillsDevelopmentManager />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}