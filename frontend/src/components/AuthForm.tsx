"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../app/store/store";
import { login, register, clearError } from "../app/store/slices/authSlice";
import toast from "react-hot-toast";
import { AppDispatch } from "../app/store/store";
interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: string;
  phone?: string;
}

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>();

const onSubmit = async (data: AuthFormData) => {
  setIsLoading(true);
  dispatch(clearError());

  try {
    if (type === "login") {
      const result = await dispatch(login(data));
      if (result.type === "auth/login/fulfilled") {
        toast.success("Login successful!");
        router.push(`/dashboard/${data.role}`);
      }
    } else {
      // Validate that firstName and lastName are present
      if (!data.firstName || !data.lastName) {
        toast.error("First name and last name are required for registration.");
        return;
      }

      // Cast data to match register's required argument type
      const result = await dispatch(
        register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
        })
      );

      if (result.type === "auth/register/fulfilled") {
        toast.success("Registration successful! Please login.");
        router.push("/login");
      }
    }
  } catch (err) {
    toast.error(error || "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === "login"
              ? "Sign in to your account"
              : "Create new account"}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {type === "register" && (
              <>
                <div>
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    {...registerField("firstName", {
                      required: "First name is required",
                    })}
                    type="text"
                    className="form-input"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    {...registerField("lastName", {
                      required: "Last name is required",
                    })}
                    type="text"
                    className="form-input"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                {...registerField("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                {...registerField("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: "Invalid phone number format",
                  },
                })}
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                {...registerField("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                className="form-input"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                {...registerField("role", { required: "Role is required" })}
                className="form-input">
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || loading}
              className="group relative w-full flex justify-center btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading || loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : type === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {type === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <a
                href={type === "login" ? "/register" : "/login"}
                className="font-medium text-primary-600 hover:text-primary-500">
                {type === "login" ? "Sign up" : "Sign in"}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
