import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  BarChart3,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calculator,
  Receipt,
  PieChart,
} from "lucide-react";
import { paymentAPI } from "../../../api";

const FinanceDashboard = () => {
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    processedPayments: 0,
    totalAmount: 0,
    averagePayment: 0,
    taxAmount: 0,
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      // Fetch payment statistics
      const response = await paymentAPI.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Finance Dashboard</h1>
            <p className="text-emerald-200">Payment Processing • Spring 2024</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ETB {stats.totalAmount?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.processedPayments}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pendingPayments}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tax Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ETB {stats.taxAmount?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/payments/sheets"
            className="p-4 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <Receipt className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">Payment Sheets</span>
            </div>
          </Link>

          <Link
            to="/payments/rates"
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Rate Tables</span>
            </div>
          </Link>

          <Link
            to="/reports/payments"
            className="p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <PieChart className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Financial Reports</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
