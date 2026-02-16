"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:8000"; 

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const res = await axios.post(`${BACKEND_URL}/auth/login`, formData);
        const token = res.data.access_token;
        localStorage.setItem("token", token);
        
        // Check onboarding status
        try {
            const statusRes = await axios.get(`${BACKEND_URL}/api/onboarding/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (statusRes.data.status === "onboarded") {
                router.push("/dashboard");
            } else {
                router.push("/onboarding");
            }
        } catch (statusErr) {
            // If status check fails but login worked, default to onboarding or dashboard?
            // Safer to go to dashboard and let it handle auth, or onboarding.
            // Let's assume dashboard.
            console.error("Status check failed", statusErr);
            router.push("/dashboard");
        }

    } catch (err: any) {
        console.error(err);
        setError("Invalid credentials or server error.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="backdrop-blur-md bg-card/60 border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-heading">Access Metis Core</CardTitle>
          <CardDescription>Enter your operator credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500">{error}</div>}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                placeholder="user@metis.ai" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <div className="text-sm text-muted-foreground">
                New operator? <a href="/auth/signup" className="text-primary hover:underline">Initialize Interface</a>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
