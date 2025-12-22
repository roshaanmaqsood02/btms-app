"use client";

import React, { useState } from "react";
import { useLoginMutation } from "@/redux/services/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  setCredentials,
  setError,
  clearError,
  selectAuthError,
} from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import Logo from "@/public/icons/brackets_logo.svg";
import Illustrator from "@/public/images/illustrator.svg";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authError = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const isLoading = isLoginLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
        })
      );

      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "An error occurred";
      dispatch(setError(errorMessage));
    }
  };

  const handleForgotPassword = () => {
    // Add forgot password functionality here
    console.log("Forgot password clicked");
    // You can add navigation to forgot password page or open a modal
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Brand Section */}
      <div className="bg-[rgb(96,57,187)] hidden lg:flex flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md space-y-8 text-center">
          <div>
            <p className="text-[#19C9D1] text-2xl md:text-3xl font-semibold mt-6">
              Simple, Robust. <br />
              Efficient, Secure.
            </p>
          </div>

          <div className="relative w-full h-64 md:h-96 mt-8">
            <Image
              src={Illustrator}
              alt="Platform Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="bg-white flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 md:w-52 md:h-52">
                <Image src={Logo} alt="Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-semibold tracking-tight">Login</h2>

            {/* Error Alert */}
            {authError && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="py-6 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="py-6 text-base rounded-xl"
                  />
                </div>

                {/* Forgot Password Link - Right Aligned */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="text-[#19C9D1] hover:text-[#15b0b6] font-medium p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl px-8 py-6 text-lg font-medium bg-[rgb(96,57,187)] text-white hover:bg-[rgb(86,47,177)]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
