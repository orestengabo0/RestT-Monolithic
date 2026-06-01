"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render signup form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
            RestT
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 sm:mt-3 text-base sm:text-lg">
            Create your account and get started today.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Sign Up
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Create an account to access all features
            </p>
          </div>

          {success ? (
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
                    <p className="font-medium mb-1">Account created successfully!</p>
                    <p className="text-green-600/90 dark:text-green-400/90">
                      We've sent a verification email to <strong>{formData.email}</strong>. Please check your inbox and click the verification link to activate your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">
                  Didn't receive the email?
                </p>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside mb-3">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes for the email to arrive</li>
                </ul>
                <Link
                  href="/resend-verification"
                  className="text-sm font-semibold text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300 transition-colors"
                >
                  Resend verification email →
                </Link>
              </div>

              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 text-base font-semibold rounded-3xl"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="p-3 sm:p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-2xl sm:rounded-3xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-900 dark:text-neutral-100">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 rounded-3xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-900 dark:text-neutral-100">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 rounded-3xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-900 dark:text-neutral-100">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 rounded-3xl"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-neutral-900 dark:text-neutral-100">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300 transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 mt-6 sm:mt-8">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
