"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RootState } from "@/app/store/store";
import { logout } from "@/app/store/slices/authSlice";

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const getNavLinks = () => {
    if (!user) return [];

    const commonLinks = [
      { href: "/courses", label: "Courses" },
      { href: "/ai-assistant", label: "AI Assistant" },
    ];

    const roleLinks = {
      student: [
        { href: "/dashboard/student", label: "Dashboard" },
        ...commonLinks,
      ],
      lecturer: [
        { href: "/dashboard/lecturer", label: "Dashboard" },
        ...commonLinks,
      ],
      admin: [{ href: "/dashboard/admin", label: "Dashboard" }, ...commonLinks],
    };

    return roleLinks[user.role] || [];
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Academic Platform
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 text-sm font-medium">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
