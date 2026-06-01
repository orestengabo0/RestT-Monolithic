"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing verification token. Please check your email for the correct link.");
      return;
    }

    // Auto-verify on page load
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post<{
        data: { message: string };
      }>("/auth/verify-email", { token });

      setSuccess(true);
      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
            Email Verification
          </p>
        </div>

        {/* Content */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isLoading ? "Verifying your email address..." : "Please wait while we verify your email"}
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin h-16 w-16 border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Verifying...</p>
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-2xl sm:rounded-3xl">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium mb-1">Verification Failed</p>
                  <p className="text-red-600/90 dark:text-red-400/90">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
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
                    <p className="font-medium mb-1">Email Verified!</p>
                    <p className="text-green-600/90 dark:text-green-400/90">
                      {message || "Your email has been successfully verified."}
                    </p>
                    <p className="text-green-600/90 dark:text-green-400/90 mt-2">
                      Redirecting to login page...
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 text-base font-semibold rounded-3xl"
              >
                Go to Login
              </Button>
            </div>
          )}

          {error && !token && (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">
                Need a new verification link?
              </p>
              <Link
                href="/resend-verification"
                className="text-sm font-semibold text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300 transition-colors"
              >
                Request new verification email →
              </Link>
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
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
