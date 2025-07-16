"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { fetchAssignments } from "@/app/store/slices/assignmentSlice";

export default function GradeTable() {
  const { assignments, loading } = useSelector(
    (state: RootState) => state.assignments
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const calculateGPA = () => {
    const gradedAssignments = assignments.filter(
      (a) => a.submission?.grade !== undefined
    );
    if (gradedAssignments.length === 0) return 0;

    const totalPoints = gradedAssignments.reduce((sum, assignment) => {
      const grade = assignment.submission?.grade || 0;
      const percentage = (grade / assignment.maxGrade) * 100;
      return sum + percentage;
    }, 0);

    return ((totalPoints / gradedAssignments.length / 100) * 4).toFixed(2);
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Your Grades</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current GPA</p>
          <p className="text-2xl font-bold text-primary-600">
            {calculateGPA()}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Assignment
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Course
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Grade
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Percentage
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {assignment.courseName}
                </td>
                <td className="py-3 px-4">
                  {assignment.submission?.grade !== undefined ? (
                    <span
                      className={`font-medium ${getGradeColor(
                        assignment.submission.grade,
                        assignment.maxGrade
                      )}`}>
                      {assignment.submission.grade}/{assignment.maxGrade}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not graded</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {assignment.submission?.grade !== undefined ? (
                    <span
                      className={`font-medium ${getGradeColor(
                        assignment.submission.grade,
                        assignment.maxGrade
                      )}`}>
                      {(
                        (assignment.submission.grade / assignment.maxGrade) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.submission?.grade !== undefined
                        ? "bg-green-100 text-green-800"
                        : assignment.submission
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {assignment.submission?.grade !== undefined
                      ? "Graded"
                      : assignment.submission
                      ? "Submitted"
                      : "Not Submitted"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No assignments found.</p>
        </div>
      )}
    </div>
  );
}
