import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OfficerLogin from "./pages/auth/OfficerLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Services from "./pages/services/Services";
import ApplyService from "./pages/services/ApplyService";
import Documents from "./pages/citizen/Documents";
import Complaints from "./pages/citizen/Complaints";
import TrackStatus from "./pages/citizen/TrackStatus";
import Notifications from "./pages/citizen/Notifications";
import Payments from "./pages/citizen/Payments";
import Applications from "./pages/citizen/Applications";
import Profile from "./pages/citizen/Profile";
import {
  ManageCitizens, ManageOfficers, ManageServices, ManageComplaints, Reports, AdminSettings,
  OfficerQueuePage, OfficerVerify, OfficerCitizens, OfficerAnalytics,
} from "./pages/admin/AdminPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/officer-login" element={<OfficerLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/track" element={<TrackStatus />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/services" element={<Services />} />
            <Route path="/apply/:id" element={<ApplyService />} />

            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/officer/queue" element={<OfficerQueuePage />} />
            <Route path="/officer/verify" element={<OfficerVerify />} />
            <Route path="/officer/citizens" element={<OfficerCitizens />} />
            <Route path="/officer/analytics" element={<OfficerAnalytics />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/citizens" element={<ManageCitizens />} />
            <Route path="/admin/officers" element={<ManageOfficers />} />
            <Route path="/admin/services" element={<ManageServices />} />
            <Route path="/admin/complaints" element={<ManageComplaints />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
