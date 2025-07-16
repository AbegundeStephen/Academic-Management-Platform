"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/app/store/store";
import { setCredentials } from "@/app/store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem("token");
    if (storedToken && !token) {
      // In a real app, you'd validate the token with the server
      // For now, we'll assume it's valid and try to get user info
      // This is a simplified approach
      try {
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        if (userInfo.id) {
          dispatch(setCredentials({ user: userInfo, token: storedToken }));
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    }
  }, [dispatch, token, router]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push(`/dashboard/${user.role}`);
      return;
    }
  }, [token, user, allowedRoles, router]);

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
