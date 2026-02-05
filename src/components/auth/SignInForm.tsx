"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, User, DollarSign } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
            <DollarSign className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {flow === "signIn" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {flow === "signIn" 
                ? "Sign in to continue to your expense tracker" 
                : "Join us to start tracking your expenses"
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitting(true);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                let toastTitle = "";
                if (error.message.includes("Invalid password")) {
                  toastTitle = "Invalid password. Please try again.";
                } else {
                  toastTitle =
                    flow === "signIn"
                      ? "Could not sign in, did you mean to sign up?"
                      : "Could not sign up, did you mean to sign in?";
                }
                toast.error(toastTitle);
                setSubmitting(false);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting 
                ? "Please wait..." 
                : flow === "signIn" 
                  ? "Sign In" 
                  : "Create Account"
              }
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up here" : "Sign in here"}
              </Button>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">OR</span>
            </div>
          </div>

          <Button 
            variant="outline"
            size="lg"
            onClick={() => void signIn("anonymous")}
            className="w-full"
          >
            <User className="mr-2 h-4 w-4" />
            Continue as Guest
          </Button>
          
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
