import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const success = await login(formData.email, formData.password);
    
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  const demoCredentials = [
    { email: "admin@college.com", password: "admin123", role: "Admin" },
    { email: "manager@college.com", password: "manager123", role: "Manager" },
    { email: "employee@college.com", password: "employee123", role: "Employee" },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Building2 className="h-10 w-10 text-white" />
            <div className="text-white">
              <h1 className="text-2xl font-bold">College Work Management</h1>
              <p className="text-primary-foreground/80 text-sm">Multi-College Task & Cost Management System</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground mt-2">Sign in to your account</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
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

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Demo Credentials:
              </p>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <Card key={index} className="p-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{cred.role}</p>
                        <p className="text-xs text-muted-foreground">{cred.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ email: cred.email, password: cred.password })}
                      >
                        Use
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 College Work Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
