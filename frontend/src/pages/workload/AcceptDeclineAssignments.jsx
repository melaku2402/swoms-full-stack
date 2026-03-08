// src/pages/workload/AcceptDeclineAssignments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import workloadAPI from "../../api/workload";

const AcceptDeclineAssignments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const fetchPendingAssignments = async () => {
    try {
      setLoading(true);
      const response = await workloadAPI.getMyAssignments({
        status: "assigned",
      });
      setAssignments(response.data?.assignments || []);
    } catch (error) {
      console.error("Error fetching pending assignments:", error);
      toast.error("Failed to load pending assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (assignmentId) => {
    try {
      await workloadAPI.updateAssignmentStatus(assignmentId, "accepted");
      toast.success("Assignment accepted successfully");
      fetchPendingAssignments();
    } catch (error) {
      console.error("Error accepting assignment:", error);
      toast.error("Failed to accept assignment");
    }
  };

  const handleDecline = async (assignmentId) => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    try {
      await workloadAPI.updateAssignmentStatus(
        assignmentId,
        "declined",
        declineReason
      );
      toast.success("Assignment declined");
      setShowDeclineModal(false);
      setDeclineReason("");
      fetchPendingAssignments();
    } catch (error) {
      console.error("Error declining assignment:", error);
      toast.error("Failed to decline assignment");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Review & Approve Assignments
          </h1>
          <p className="text-gray-600 mt-1">
            Review and accept or decline your course assignments
          </p>
        </div>
        <button
          onClick={() => navigate("/workload/assignments")}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View All Assignments
        </button>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {assignments.length} Assignment
                {assignments.length !== 1 ? "s" : ""} Pending Review
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please review each assignment and accept or decline within 7
                days
              </p>
            </div>
          </div>
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
      </div>

      {/* Assignments Grid */}
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.assignment_id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-gray-900 text-lg">
                      {assignment.course_code}
                    </span>
                  </div>
                  <h3 className="text-gray-900 font-medium">
                    {assignment.course_title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Section: {assignment.section_code} •{" "}
                    {assignment.credit_hours || "N/A"} credit hours
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  Pending Review
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{assignment.student_count || 0} students enrolled</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Assigned on {formatDate(assignment.assigned_date)}
                  </span>
                </div>
                {assignment.notes && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="italic">{assignment.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleAccept(assignment.assignment_id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accept Assignment</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowDeclineModal(true);
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pending Assignments
          </h3>
          <p className="text-gray-600 mb-6">
            You have no assignments pending review. All assignments have been
            processed.
          </p>
          <button
            onClick={() => navigate("/workload")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>Return to Dashboard</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Decline Assignment
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for declining the assignment "
              {selectedAssignment?.course_code}". This will be sent to the
              department head for review.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter your reason for declining this assignment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows="4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecline(selectedAssignment.assignment_id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptDeclineAssignments;
