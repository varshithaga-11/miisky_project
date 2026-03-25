import React, { useState } from "react";

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const reports = [
    {
      id: 1,
      name: "User Activity Report",
      description: "Comprehensive analysis of user activities and engagement",
      generated: "2024-03-20",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "System Performance Report",
      description: "Server performance metrics and uptime analysis",
      generated: "2024-03-19",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Financial Report",
      description: "Revenue, transactions, and financial metrics",
      generated: "2024-03-18",
      size: "3.2 MB",
    },
    {
      id: 4,
      name: "Nutritionist Analytics",
      description: "Performance metrics of nutritionists and their patients",
      generated: "2024-03-17",
      size: "2.1 MB",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
      <p className="text-gray-600 mb-8">View and download comprehensive system reports.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <h3 className="text-sm text-gray-600 mb-2">Total Reports</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <h3 className="text-sm text-gray-600 mb-2">This Month</h3>
          <p className="text-2xl font-bold text-green-600">8</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <h3 className="text-sm text-gray-600 mb-2">Total Size</h3>
          <p className="text-2xl font-bold text-purple-600">156 MB</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <h3 className="text-sm text-gray-600 mb-2">Last Generated</h3>
          <p className="text-2xl font-bold text-orange-600">Today</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="activity">User Activity</option>
              <option value="performance">Performance</option>
              <option value="financial">Financial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Report Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Generated</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Size</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{report.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{report.description}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{report.generated}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{report.size}</td>
                <td className="px-6 py-4 text-sm space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                  <button className="text-green-600 hover:text-green-800 font-medium">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Generate New Report</h3>
        <p className="text-sm text-blue-800 mb-4">Create a custom report based on your specific requirements</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Generate Custom Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
