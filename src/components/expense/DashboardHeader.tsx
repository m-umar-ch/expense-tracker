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
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">
            Financial Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" size="sm" onClick={onShowSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
