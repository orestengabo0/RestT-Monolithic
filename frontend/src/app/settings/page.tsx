"use client";

import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  );
}

function SettingsContent() {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Account Settings */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
              Account Settings
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email Address
                </label>
                <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 break-all">
                  {user?.email}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Account Status
                </label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    {user?.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
              Security
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <button className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium">
                Change Password
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
              Preferences
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Preference settings coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
