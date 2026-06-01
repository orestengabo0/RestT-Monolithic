"use client";

import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileContent />
    </DashboardLayout>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Profile
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            View and manage your profile information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 h-24 sm:h-32"></div>
          <div className="px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-10 mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-neutral-900 p-1.5 sm:p-2 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 flex items-center justify-center">
                  <span className="text-white dark:text-neutral-900 font-bold text-3xl sm:text-4xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    First Name
                  </label>
                  <p className="mt-1 text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                    {user?.firstName}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                    {user?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Email Address
                  </label>
                  <p className="mt-1 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 break-all">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Role
                  </label>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      {user?.role.name}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Account Status
                  </label>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      {user?.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Email Verification
                  </label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      user?.emailVerified
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {user?.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium sm:font-normal">Member Since:</span>
                  <span className="mt-1 sm:mt-0 sm:ml-2 text-neutral-900 dark:text-neutral-100">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
