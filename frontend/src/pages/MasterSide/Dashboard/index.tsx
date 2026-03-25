import React from "react";

const MasterDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Master Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome to the Master Dashboard. Monitor system-wide operations and key metrics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow border-l-4 border-blue-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-xs text-gray-500 mt-2">↑ 12% from last month</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border-l-4 border-green-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-green-600">245</p>
          <p className="text-xs text-gray-500 mt-2">Currently online</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border-l-4 border-yellow-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">System Health</h3>
          <p className="text-3xl font-bold text-yellow-600">98%</p>
          <p className="text-xs text-gray-500 mt-2">Uptime</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border-l-4 border-red-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-red-600">12</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium">New user registration</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">System backup completed</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Report generated</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Nutritionists</span>
              <span className="font-bold text-lg">156</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Patients</span>
              <span className="font-bold text-lg">890</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Micro Kitchens</span>
              <span className="font-bold text-lg">43</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Orders</span>
              <span className="font-bold text-lg">167</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
