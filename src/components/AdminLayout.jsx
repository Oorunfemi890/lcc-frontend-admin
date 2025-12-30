import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const sidebarItems = [
    {
      path: "/dashboard",
      icon: "ri-dashboard-line",
      label: "Dashboard",
      permission: "all",
    },
    {
      path: "/members",
      icon: "ri-group-line",
      label: "Members",
      permission: "members",
    },
    {
      path: "/attendance",
      icon: "ri-calendar-check-line",
      label: "Attendance",
      permission: "attendance",
    },
    {
      path: "/events",
      icon: "ri-calendar-event-line",
      label: "Events",
      permission: "events",
    },
    {
      path: "/celebrations",
      icon: "ri-cake-3-line",
      label: "Celebrations",
      permission: "celebrations",
    },
    {
      path: "/first-timers",
      icon: "ri-user-add-line",
      label: "First Timers",
      permission: "first_timers",
    },
    {
      path: "/follow-up",
      icon: "ri-chat-follow-up-line",
      label: "Follow Up",
      permission: "follow_up",
    },
    {
      path: "/testimonies",
      icon: "ri-feedback-line",
      label: "Testimonies",
      permission: "testimonies",
    },
    {
      path: "/services",
      icon: "ri-service-line",
      label: "Services",
      permission: "services",
    },
    {
      path: "/profile",
      icon: "ri-user-settings-line",
      label: "Profile",
      permission: "all",
    },
    {
      path: "/admin-management",
      icon: "ri-admin-line",
      label: "Admin Management",
      permission: "admin_management",
      roles: ["SUPER_ADMIN", "ADMIN"], // Only visible to SUPER_ADMIN and ADMIN
    },
    {
      path: "/settings",
      icon: "ri-settings-3-line",
      label: "Settings",
      permission: "settings",
      roles: ["SUPER_ADMIN", "ADMIN"], // Only visible to SUPER_ADMIN and ADMIN
    },
  ];

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (item.permission === "all") return true;

    // Check for super admin role (case insensitive)
    const role = admin?.role?.toUpperCase();
    if (role === "SUPER_ADMIN") return true;

    // Check role-based access if specified
    if (item.roles) {
      return item.roles.includes(role);
    }

    // Check permissions array
    return admin?.permissions?.includes(item.permission);
  });

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 transform z-50 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-200 ease-in-out`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-indigo-600 text-white flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img src="/img/favicon.png" alt="RCCG Logo" className="h-8 w-8" />
            <span className="ml-2 text-lg font-semibold">RCCG LCC</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-gray-300"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredSidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.path)
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <i
                className={`${item.icon} mr-3 text-lg ${isActive(item.path)
                  ? "text-indigo-700"
                  : "text-gray-400 group-hover:text-gray-500"
                  }`}
              ></i>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {admin?.member?.profilePicture || admin?.profilePicture || admin?.avatar ? (
                <img
                  src={admin.member?.profilePicture || admin.profilePicture || admin.avatar}
                  alt={admin.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-indigo-600"></i>
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {admin?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {admin?.position}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-4 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600 md:hidden"
            >
              <i className="ri-menu-2-line text-2xl"></i>
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>

            {/* Page title */}
            <div className="flex-1 min-w-0 md:block hidden">
              <h1 className="text-lg font-medium text-gray-900">
                {/* Page title can go here */}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <i className="ri-notification-line text-xl"></i>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {admin?.member?.profilePicture || admin?.profilePicture || admin?.avatar ? (
                    <img
                      src={admin.member?.profilePicture || admin.profilePicture || admin.avatar}
                      alt={admin.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-indigo-600"></i>
                    </div>
                  )}
                  <span className="ml-2 text-sm text-gray-700 hidden sm:block">
                    {admin?.name}
                  </span>
                  <i className="ri-arrow-down-s-line ml-1 text-gray-400"></i>
                </button>

                {profileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="ri-user-line mr-3"></i>
                        My Profile
                      </Link>
                      <Link
                        to="https://www.libertychristiancentre.online/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="ri-home-line mr-3"></i>
                        View Website
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="ri-logout-box-line mr-3"></i>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Click outside to close profile dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setProfileDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
