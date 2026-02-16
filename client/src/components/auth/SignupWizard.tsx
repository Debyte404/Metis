"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = "http://localhost:8000"; // Should strictly use ENV var in production

// Steps
enum Step {
  CREDENTIALS = 0,
  NAME = 1,
  VISUAL_MODE = 2,
  GRANULARITY = 3,
  COMMUNICATION = 4,
  GAMIFICATION = 5,
}

export function SignupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(Step.CREDENTIALS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    visualmode: "standard",
    granularity: "low",
    communication_style: "gentle",
    gamification: "standard",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setError("");
    if (currentStep === Step.CREDENTIALS) {
       if (!formData.email || !formData.password) {
           setError("Please enter both email and password.");
           return;
       }
       if (formData.password.length < 6) {
           setError("Password must be at least 6 characters.");
           return;
       }
       
       // Check if email exists
       setLoading(true);
       try {
           const res = await axios.post(`${BACKEND_URL}/auth/check-email`, { email: formData.email });
           if (res.data.exists) {
               setError("This email is already registered. Please log in.");
               setLoading(false);
               return;
           }
       } catch (err) {
           console.error("Email check failed", err);
           setError("Could not verify email. Is the server running?");
           setLoading(false);
           return;
       }
       setLoading(false);
    }
    if (currentStep === Step.NAME && !formData.name) {
        setError("Please tell us your name.");
        return;
    }

    if (currentStep < Step.GAMIFICATION) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitAll();
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > Step.CREDENTIALS) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // The Magic: Chain everything
  const submitAll = async () => {
    setLoading(true);
    setError("");
    try {
        // 1. Signup
        console.log("Signing up...");
        await axios.post(`${BACKEND_URL}/auth/signup`, {
            email: formData.email,
            password: formData.password
        });

        // 2. Login (to get token)
        console.log("Logging in...");
        const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: formData.email,
            password: formData.password
        });
        const token = loginRes.data.access_token;
        
        // Save token (localStorage for now)
        localStorage.setItem("token", token);

        // 3. Onboarding
        console.log("Submitting profile...");
        await axios.post(`${BACKEND_URL}/api/onboarding`, {
            name: formData.name,
            visualmode: formData.visualmode,
            granularity: formData.granularity,
            gamification: formData.gamification,
            communication_style: formData.communication_style
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 4. Redirect
        console.log("Success! Redirecting...");
        router.push("/dashboard");

    } catch (err: any) {
        console.error(err);
        if (err.response) {
            setError(err.response.data.detail || "Something went wrong.");
        } else {
            setError("Network error. Is the backend running?");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="backdrop-blur-md bg-card/60 border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-heading">
            {currentStep === Step.CREDENTIALS ? "Initialize Metis" : "Configure AI Core"}
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of 6
          </CardDescription>
        </CardHeader>
        <CardContent>
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* --- STEP 0: CREDENTIALS --- */}
                    {currentStep === Step.CREDENTIALS && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email Frequency</Label>
                                <Input 
                                    placeholder="user@metis.ai" 
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Access Key (Password)</Label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* --- STEP 1: NAME --- */}
                    {currentStep === Step.NAME && (
                        <div className="space-y-4">
                            <Label>Operator Name</Label>
                            <Input 
                                placeholder="What should I call you?"
                                value={formData.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* --- STEP 2: VISUAL MODE --- */}
                    {currentStep === Step.VISUAL_MODE && (
                        <div className="space-y-4">
                            <Label>Visual Processing Mode</Label>
                            <div className="grid grid-cols-1 gap-2">
                                <SelectionCard 
                                    selected={formData.visualmode === "standard"}
                                    onClick={() => updateField("visualmode", "standard")}
                                    title="Standard"
                                    description="Clean, modern interface with standard fonts."
                                />
                                <SelectionCard 
                                    selected={formData.visualmode === "dyslexic"}
                                    onClick={() => updateField("visualmode", "dyslexic")}
                                    title="Dyslexic-Friendly"
                                    description="OpenDyslexic font, high contrast, reduced vibration."
                                />
                            </div>
                        </div>
                    )}

                     {/* --- STEP 3: GRANULARITY --- */}
                     {currentStep === Step.GRANULARITY && (
                        <div className="space-y-4">
                            <Label>Task Delegation Granularity</Label>
                            <div className="grid grid-cols-1 gap-2">
                                <SelectionCard 
                                    selected={formData.granularity === "high"}
                                    onClick={() => updateField("granularity", "high")}
                                    title="High Detail (Micro-Step)"
                                    description="Break tasks into 5-minute actionable chunks."
                                />
                                <SelectionCard 
                                    selected={formData.granularity === "low"}
                                    onClick={() => updateField("granularity", "low")}
                                    title="Standard (Logical)"
                                    description="Break tasks into functional phases."
                                />
                                <SelectionCard 
                                    selected={formData.granularity === "overview"}
                                    onClick={() => updateField("granularity", "overview")}
                                    title="Overview"
                                    description="Just main objectives. I'll handle the rest."
                                />
                            </div>
                        </div>
                    )}

                     {/* --- STEP 4: COMMUNICATION --- */}
                     {currentStep === Step.COMMUNICATION && (
                        <div className="space-y-4">
                            <Label>AI Personnel Style</Label>
                            <div className="grid grid-cols-1 gap-2">
                                <SelectionCard 
                                    selected={formData.communication_style === "gentle"}
                                    onClick={() => updateField("communication_style", "gentle")}
                                    title="The Gentle Coach"
                                    description="Soft, validating language. Micro-wins focus."
                                />
                                <SelectionCard 
                                    selected={formData.communication_style === "direct"}
                                    onClick={() => updateField("communication_style", "direct")}
                                    title="The Strategist"
                                    description="Concise, literal. No fluff, just instructions."
                                />
                                <SelectionCard 
                                    selected={formData.communication_style === "drill_sergeant"}
                                    onClick={() => updateField("communication_style", "drill_sergeant")}
                                    title="Accountability Partner"
                                    description="Firm, high-energy, active verbs."
                                />
                            </div>
                        </div>
                    )}

                    {/* --- STEP 5: GAMIFICATION --- */}
                     {currentStep === Step.GAMIFICATION && (
                        <div className="space-y-4">
                            <Label>Engagement Protocol</Label>
                            <div className="grid grid-cols-1 gap-2">
                                <SelectionCard 
                                    selected={formData.gamification === "gamified"}
                                    onClick={() => updateField("gamification", "gamified")}
                                    title="Gamified"
                                    description="Earn XP, level up, quest completions."
                                />
                                <SelectionCard 
                                    selected={formData.gamification === "standard"}
                                    onClick={() => updateField("gamification", "standard")}
                                    title="Minimalist"
                                    description="Clean lists, professional interface."
                                />
                            </div>
                        </div>
                    )}


                </motion.div>
            </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
           <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 0 || loading}
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
           </Button>
           
           <Button onClick={handleNext} disabled={loading} className="px-8">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {currentStep === Step.GAMIFICATION ? (loading ? "Initializing..." : "Launch Metis") : "Next"}
                {!loading && currentStep !== Step.GAMIFICATION && <ArrowRight className="w-4 h-4 ml-2" />}
           </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center mt-4 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm p-2 rounded-lg inline-block mx-auto">
        Already have an account? <a href="/auth/login" className="text-primary hover:underline">Login Sequence</a>
      </div>
    </div>
  );
}

// Helper for selection cards
function SelectionCard({ selected, onClick, title, description }: { selected: boolean, onClick: () => void, title: string, description: string }) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent",
                selected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border"
            )}
        >
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
        </div>
    )
}
