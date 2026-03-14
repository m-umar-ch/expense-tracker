import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import {
  DollarSign,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useForm } from "@tanstack/react-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const currentUser = useQuery(api.users.currentUser);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (activeTab === "signup" && value.password !== value.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setIsSubmitting(true);
      try {
        await signIn("password", {
          email: value.email,
          password: value.password,
          flow: activeTab === "login" ? "signIn" : "signUp",
        });
        toast.success(
          activeTab === "login"
            ? "Welcome back!"
            : "Account created successfully",
        );
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(
          activeTab === "login" 
            ? "Invalid email or password" 
            : "Registration failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[450px] space-y-6">
        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-2 shadow-sm">
            <DollarSign className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ExpenseTrack</h1>
          <p className="text-sm text-muted-foreground">
            Manage your finances with ease.
          </p>
        </div>

        <Tabs
          defaultValue="login"
          onValueChange={(val) => setActiveTab(val as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="login"
            className="animate-in fade-in zoom-in-95 duration-200"
          >
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <form.Field
                    name="email"
                    children={(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={field.name}
                            type="email"
                            placeholder="name@example.com"
                            className="pl-9"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                  />

                  <form.Field
                    name="password"
                    children={(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={field.name}
                            type={showPassword ? "text" : "password"}
                            className="pl-9"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="signup"
            className="animate-in fade-in zoom-in-95 duration-200"
          >
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Join our platform to start tracking your expenses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <form.Field
                    name="email"
                    children={(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={`${field.name}_signup`}>Email</Label>
                        <Input
                          id={`${field.name}_signup`}
                          placeholder="name@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="password"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={`${field.name}_signup`}>
                            Password
                          </Label>
                          <Input
                            id={`${field.name}_signup`}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    />
                    <form.Field
                      name="confirmPassword"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Confirm</Label>
                          <Input
                            id={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex-col gap-4 text-center">
                <p className="text-xs text-muted-foreground px-8">
                  By clicking continue, you agree to our{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
