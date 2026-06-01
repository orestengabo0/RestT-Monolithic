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
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            View and manage your profile information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-10 mb-6">
              <div className="w-32 h-32 rounded-full bg-white dark:bg-neutral-900 p-2 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 flex items-center justify-center">
                  <span className="text-white dark:text-neutral-900 font-bold text-4xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-6 mb-4">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    First Name
                  </label>
                  <p className="mt-1 text-base text-neutral-900 dark:text-neutral-100">
                    {user?.firstName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Name
                  </label>
                  <p className="mt-1 text-base text-neutral-900 dark:text-neutral-100">
                    {user?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Email Address
                  </label>
                  <p className="mt-1 text-base text-neutral-900 dark:text-neutral-100">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Role
                  </label>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      {user?.role.name}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Account Status
                  </label>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      {user?.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Email Verification
                  </label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Member Since:</span>
                  <span className="ml-2 text-neutral-900 dark:text-neutral-100">
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
