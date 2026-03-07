import { LayoutDashboard, ArrowLeft, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";

interface DashboardHeaderProps {
  onShowSettings: () => void;
}

export function DashboardHeader({ onShowSettings }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 shrink-0">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="hidden sm:inline">Financial Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            title="Home"
            className="px-2 sm:px-3"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowSettings}
            title="Settings"
            className="px-2 sm:px-3"
          >
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            title="Logout"
            className="px-2 sm:px-3"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
