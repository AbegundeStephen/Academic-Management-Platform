import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

interface Recommendation {
  id: string;
  title: string;
  code: string;
  description: string;
  reason: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  credits: number;
  match: number;
}

const CourseRecommendations: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [preferences, setPreferences] = useState({
    interests: [] as string[],
    difficulty: "any" as "any" | "beginner" | "intermediate" | "advanced",
    careerGoals: "",
    timeCommitment: "moderate" as "light" | "moderate" | "heavy",
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    "Computer Science",
    "Mathematics",
    "Business",
    "Engineering",
    "Data Science",
    "Web Development",
    "Artificial Intelligence",
    "Cybersecurity",
    "Marketing",
    "Psychology",
  ];

  const handleInterestChange = (interest: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const generateRecommendations = async () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          title: "Introduction to Data Science",
          code: "DS101",
          description:
            "Learn the fundamentals of data analysis, visualization, and machine learning.",
          reason: "Based on your interest in Computer Science and Data Science",
          difficulty: "Beginner",
          credits: 3,
          match: 95,
        },
        {
          id: "2",
          title: "Advanced Web Development",
          code: "WEB301",
          description:
            "Build complex web applications using modern frameworks and technologies.",
          reason: "Perfect for your Web Development interests and career goals",
          difficulty: "Advanced",
          credits: 4,
          match: 88,
        },
        {
          id: "3",
          title: "Business Analytics",
          code: "BUS201",
          description:
            "Apply statistical methods and data analysis to business problems.",
          reason: "Combines your interests in Business and Data Science",
          difficulty: "Intermediate",
          credits: 3,
          match: 82,
        },
      ];

      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Get Personalized Course Recommendations
        </h2>
        <p className="text-gray-600">
          Tell us about your interests and goals, and our AI will recommend the
          best courses for you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are your interests? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {interestOptions.map((interest) => (
              <label key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred difficulty level
          </label>
          <select
            value={preferences.difficulty}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                difficulty: e.target.value as never,
              }))
            }
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="any">Any Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Career Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are your career goals?
          </label>
          <textarea
            value={preferences.careerGoals}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                careerGoals: e.target.value,
              }))
            }
            placeholder="e.g., I want to become a data scientist, work in tech, start my own business..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Time Commitment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How much time can you commit to studying?
          </label>
          <select
            value={preferences.timeCommitment}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                timeCommitment: e.target.value as never,
              }))
            }
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="light">Light (5-10 hours/week)</option>
            <option value="moderate">Moderate (10-20 hours/week)</option>
            <option value="heavy">Heavy (20+ hours/week)</option>
          </select>
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={generateRecommendations}
            disabled={loading || preferences.interests.length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Recommendations...
              </div>
            ) : (
              "Get Recommendations"
            )}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Recommended Courses
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-gray-600">{rec.code}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                        rec.difficulty
                      )}`}>
                      {rec.difficulty}
                    </span>
                    <div className="flex items-center bg-primary-100 text-primary-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {rec.match}% match
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{rec.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span className="mr-4">{rec.reason}</span>
                    <span>{rec.credits} credits</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;
