"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { Course } from "@/app/store/slices/courseSlice";

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnroll = () => {
    // TODO: Implement enrollment logic
    console.log("Enrolling in course:", course.id);
  };

  const isEnrolled = course?.isEnrolled === true;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600">{course.credits} credits</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              course.status
            )}`}>
            {course.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span>{`${course.enrolledStudents} students`}</span>
          </div>
          <div className="flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{course.credits} credits</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {course.lecturer && <span>Prof. {course.lecturer}</span>}
          </div>
          <div className="flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v11a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z"
              />
            </svg>
            <span>{course.semester}</span>
          </div>
        </div>

        {user?.role === "student" && (
          <div className="mt-4">
            {isEnrolled ? (
              <button
                disabled
                className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed">
                Enrolled
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Enroll Now
              </button>
            )}
          </div>
        )}

        {(user?.role === "lecturer" || user?.role === "admin") && (
          <div className="mt-4 flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Manage
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
