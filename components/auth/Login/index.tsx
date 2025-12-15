"use client";

import React, { useState } from "react";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/redux/services/authApi";
import { useAppDispatch } from "@/redux/hook";
import { setCredentials, setError, clearError } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Logo from "@/public/icons/brackets_logo.svg";
import Illustrator from "@/public/images/illustrator.svg";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    gender: "male",
    city: "",
    country: "",
    phone: "",
    postalCode: "",
  });

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const isLoading = isLoginLoading || isRegisterLoading;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
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

        router.push("/profile");
      } else {
        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          gender: formData.gender,
          city: formData.city,
          country: formData.country,
          phone: formData.phone,
          postalCode: formData.postalCode,
        }).unwrap();

        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
          })
        );

        router.push("/profile");
      }
    } catch (error: any) {
      dispatch(setError(error?.data?.message || "An error occurred"));
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Brand Section */}
      <div className="bg-[rgb(96,57,187)] hidden lg:flex flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md space-y-8 text-center">
          <div>
            <p className="text-[rgb(25,201,209)] text-2xl md:text-3xl font-semibold mt-6">
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
      <div className="bg-white flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 md:w-52 md:h-52">
                <Image src={Logo} alt="Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-semibold tracking-tight">
              {isLogin ? "Login" : "Create Account"}
            </h2>

            {/* Form */}
            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-4">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="py-6 text-base rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="py-6 text-base rounded-xl"
                  />

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="py-6 text-base rounded-xl"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="py-6 text-base rounded-xl"
                      />

                      <Input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        className="py-6 text-base rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="py-6 text-base rounded-xl"
                      />

                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="Postal Code"
                        className="py-6 text-base rounded-xl"
                      />
                    </div>

                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base text-gray-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Toggle between Login/Register */}
              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-600 hover:text-gray-900 text-base"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl px-8 py-6 text-lg font-medium bg-[rgb(96,57,187)] text-white hover:bg-[rgb(86,47,177)]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isLogin ? (
                    "Login"
                  ) : (
                    "Create Account"
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
