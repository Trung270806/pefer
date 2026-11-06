"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<string | null>(null);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const validateEmail = (val: string): string | null => {
    if (!val || val.trim() === "") {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validatePassword = (val: string): string | null => {
    if (!val || val === "") {
      return "Password is required";
    }
    if (val.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const validateConfirmPassword = (confirmVal: string, passVal: string): string | null => {
    if (!confirmVal || confirmVal === "") {
      return "Confirm password is required";
    }
    if (confirmVal !== passVal) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasSubmitted) {
      setErrorEmail(validateEmail(val));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (hasSubmitted) {
      setErrorPassword(validatePassword(val));
      if (confirmPassword) {
        setErrorConfirmPassword(validateConfirmPassword(confirmPassword, val));
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (hasSubmitted) {
      setErrorConfirmPassword(validateConfirmPassword(val, password));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth(null);
    setFormSuccess(null);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    setErrorEmail(emailErr);
    setErrorPassword(passErr);
    setErrorConfirmPassword(confirmErr);

    if (emailErr || passErr || confirmErr) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorAuth(error.message);
      } else {
        setFormSuccess("Registration successful");
        // Clear form fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setHasSubmitted(false);
      }
    } catch (err: unknown) {
      setErrorAuth(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Register to start curating your personal shelf</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-testid="register-form" noValidate onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                data-testid="register-email"
                type="email"
                placeholder="reader@example.com"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
              />
              {errorEmail && (
                <p data-testid="error-email" className="text-sm font-medium text-destructive">
                  {errorEmail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                data-testid="register-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
              />
              {errorPassword && (
                <p data-testid="error-password" className="text-sm font-medium text-destructive">
                  {errorPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                data-testid="register-confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={loading}
              />
              {errorConfirmPassword && (
                <p data-testid="error-confirm-password" className="text-sm font-medium text-destructive">
                  {errorConfirmPassword}
                </p>
              )}
            </div>

            {errorAuth && (
              <div
                data-testid="error-auth"
                className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium"
              >
                {errorAuth}
              </div>
            )}

            {formSuccess && (
              <div
                data-testid="form-success"
                className="p-3 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
              >
                {formSuccess}
              </div>
            )}

            <Button data-testid="register-submit" type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

