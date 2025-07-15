"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  fetchCourses,
  enrollCourse,
  dropCourse,
} from "../store/slices/coursesSlice";
import toast from "react-hot-toast";

interface CourseListProps {
  showEnrollmentActions?: boolean;
}

export default function CourseList({
  showEnrollmentActions = false,
}: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCredits, setSelectedCredits] = useState("");

  const { courses, loading } = useSelector((state: RootState) => state.courses);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !selectedDepartment || course.department === selectedDepartment;
    const matchesCredits =
      !selectedCredits || course.credits.toString() === selectedCredits;

    return matchesSearch && matchesDepartment && matchesCredits;
  });

  const departments = [...new Set(courses.map((course) => course.department))];
  const creditOptions = [
    ...new Set(courses.map((course) => course.credits.toString())),
  ];

  const handleEnroll = async (courseId: string) => {
    try {
      await dispatch(enrollCourse(courseId));
      toast.success("Successfully enrolled in course!");
    } catch (error) {
      toast.error("Failed to enroll in course");
    }
  };

  const handleDrop = async (courseId: string) => {
    try {
      await dispatch(dropCourse(courseId));
      toast.success("Successfully dropped course!");
    } catch (error) {
      toast.error("Failed to drop course");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="form-input">
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Credits</label>
            <select
              value={selectedCredits}
              onChange={(e) => setSelectedCredits(e.target.value)}
              className="form-input">
              <option value="">All Credits</option>
              {creditOptions.map((credit) => (
                <option key={credit} value={credit}>
                  {credit} Credits
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDepartment("");
                setSelectedCredits("");
              }}
              className="btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="card">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{course.department}</span>
                <span>{course.credits} Credits</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Lecturer: {course.lecturer}
                </span>
                <span className="text-gray-600">
                  {course.enrollmentCount}/{course.maxEnrollment} enrolled
                </span>
              </div>

              {showEnrollmentActions && user?.role === "student" && (
                <div className="pt-3 border-t">
                  {course.isEnrolled ? (
                    <button
                      onClick={() => handleDrop(course.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Drop Course
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={course.enrollmentCount >= course.maxEnrollment}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                      {course.enrollmentCount >= course.maxEnrollment
                        ? "Full"
                        : "Enroll"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No courses found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
