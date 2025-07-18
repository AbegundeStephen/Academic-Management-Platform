/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

interface SyllabusData {
  courseInfo: {
    title: string;
    code: string;
    credits: number;
    semester: string;
    instructor: string;
    description: string;
  };
  schedule: {
    duration: string;
    sessionsPerWeek: number;
    sessionLength: string;
  };
  objectives: string[];
  topics: string[];
  assessments: {
    type: string;
    percentage: number;
    description: string;
  }[];
  resources: string[];
}

const SyllabusGenerator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<SyllabusData>({
    courseInfo: {
      title: "",
      code: "",
      credits: 3,
      semester: "Fall 2024",
      instructor: user?.firstName || "",
      description: "",
    },
    schedule: {
      duration: "15 weeks",
      sessionsPerWeek: 2,
      sessionLength: "1.5 hours",
    },
    objectives: [""],
    topics: [""],
    assessments: [
      {
        type: "Assignment",
        percentage: 30,
        description: "",
      },
    ],
    resources: [""],
  });

  const [generatedSyllabus, setGeneratedSyllabus] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (
    section: keyof SyllabusData,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (
    section: keyof SyllabusData,
    index: number,
    value: any
  ) => {
    setFormData((prev) => {
      const sectionData = prev[section];

      if (Array.isArray(sectionData)) {
        const updatedArray = [...sectionData];
        updatedArray[index] = value;

        return {
          ...prev,
          [section]: updatedArray,
        };
      }

      return prev;
    });
  };

  const addArrayItem = (
    section: keyof SyllabusData,
    defaultValue: string = ""
  ) => {
    setFormData((prev) => {
      const sectionData = prev[section];

      if (Array.isArray(sectionData)) {
        const newAssessment = {
          type: "",
          percentage: 0,
          description: "",
        };
        return {
          ...prev,
          [section]: [...sectionData, newAssessment],
        };
      }

      return prev;
    });
  };
  const removeArrayItem = (section: keyof SyllabusData, index: number) => {
    setFormData((prev) => {
      const sectionData = prev[section];

      if (Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: sectionData.filter((_, i) => i !== index),
        };
      }

      return prev;
    });
  };

  const generateSyllabus = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const syllabusContent = `
# ${formData.courseInfo.title} (${formData.courseInfo.code})

## Course Information
- **Course Title:** ${formData.courseInfo.title}
- **Course Code:** ${formData.courseInfo.code}
- **Credits:** ${formData.courseInfo.credits}
- **Semester:** ${formData.courseInfo.semester}
- **Instructor:** ${formData.courseInfo.instructor}

## Course Description
${formData.courseInfo.description}

## Course Schedule
- **Duration:** ${formData.schedule.duration}
- **Sessions per Week:** ${formData.schedule.sessionsPerWeek}
- **Session Length:** ${formData.schedule.sessionLength}

## Learning Objectives
${formData.objectives.map((obj, index) => `${index + 1}. ${obj}`).join("\n")}

## Course Topics
${formData.topics.map((topic, index) => `• ${topic}`).join("\n")}

## Assessment Methods
${formData.assessments
  .map(
    (assessment) =>
      `• ${assessment.type}: ${assessment.percentage}% - ${assessment.description}`
  )
  .join("\n")}

## Required Resources
${formData.resources.map((resource) => `• ${resource}`).join("\n")}
      `;

      setGeneratedSyllabus(syllabusContent);
    } catch (error) {
      console.error("Error generating syllabus:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        AI Syllabus Generator
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Course Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Course Information</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Course Title"
                value={formData.courseInfo.title}
                onChange={(e) =>
                  handleInputChange("courseInfo", "title", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Course Code"
                value={formData.courseInfo.code}
                onChange={(e) =>
                  handleInputChange("courseInfo", "code", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Credits"
                value={formData.courseInfo.credits}
                onChange={(e) =>
                  handleInputChange(
                    "courseInfo",
                    "credits",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Semester"
                value={formData.courseInfo.semester}
                onChange={(e) =>
                  handleInputChange("courseInfo", "semester", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Course Description"
                value={formData.courseInfo.description}
                onChange={(e) =>
                  handleInputChange("courseInfo", "description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Learning objective"
                  value={objective}
                  onChange={(e) =>
                    handleArrayChange("objectives", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeArrayItem("objectives", index)}
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("objectives")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Objective
            </button>
          </div>

          {/* Course Topics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Course Topics</h3>
            {formData.topics.map((topic, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Course topic"
                  value={topic}
                  onChange={(e) =>
                    handleArrayChange("topics", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeArrayItem("topics", index)}
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("topics")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Topic
            </button>
          </div>

          {/* Assessments */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Assessments</h3>
            {formData.assessments.map((assessment, index) => (
              <div
                key={index}
                className="mb-4 p-3 border border-gray-200 rounded-md">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Assessment type"
                    value={assessment.type}
                    onChange={(e) => {
                      const newAssessments = [...formData.assessments];
                      newAssessments[index].type = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        assessments: newAssessments,
                      }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Percentage"
                    value={assessment.percentage}
                    onChange={(e) => {
                      const newAssessments = [...formData.assessments];
                      newAssessments[index].percentage = parseInt(
                        e.target.value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        assessments: newAssessments,
                      }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  placeholder="Assessment description"
                  value={assessment.description}
                  onChange={(e) => {
                    const newAssessments = [...formData.assessments];
                    newAssessments[index].description = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      assessments: newAssessments,
                    }));
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeArrayItem("assessments", index)}
                  className="mt-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("assessments", "")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Assessment
            </button>
          </div>

          {/* Resources */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Required Resources</h3>
            {formData.resources.map((resource, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Resource"
                  value={resource}
                  onChange={(e) =>
                    handleArrayChange("resources", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeArrayItem("resources", index)}
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("resources")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Resource
            </button>
          </div>

          <button
            onClick={generateSyllabus}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
            {isGenerating ? "Generating..." : "Generate Syllabus"}
          </button>
        </div>

        {/* Generated Syllabus Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            Generated Syllabus Preview
          </h3>
          {generatedSyllabus ? (
            <div className="bg-white p-4 rounded-md border max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {generatedSyllabus}
              </pre>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-md border h-96 flex items-center justify-center text-gray-500">
              Fill out the form and click &quot;Generate Syllabus&quot; to see
              the preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusGenerator;
