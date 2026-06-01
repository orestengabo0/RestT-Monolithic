"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await apiClient.post<{
        data: { message: string };
      }>("/auth/resend-verification", { email });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
            RestT
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 sm:mt-3 text-base sm:text-lg">
            Resend verification email
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Resend Verification
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Enter your email address and we'll send you a new verification link
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="p-3 sm:p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-2xl sm:rounded-3xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-900 dark:text-neutral-100">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 rounded-3xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-3xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Verification Email"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <div className="p-3 sm:p-4 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900 rounded-2xl sm:rounded-3xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium mb-1">Check your email</p>
                    <p className="text-green-600/90 dark:text-green-400/90">
                      If an account exists with <strong>{email}</strong> and is not verified, you will receive a verification email shortly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">
                  Didn't receive the email?
                </p>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                href="/login"
                className="font-semibold text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300 transition-colors"
              >
                Back to login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 mt-6 sm:mt-8">
          Need help?{" "}
          <Link href="/support" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
