// File: frontend/src/app/dashboard/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import LecturerDashboard from "@/components/dashboard/LecturerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "student") {
    return <StudentDashboard />;
  }

  if (user.role === "lecturer") {
    return <LecturerDashboard />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return null;
}
