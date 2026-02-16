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

const BACKEND_URL = "http://localhost:8000"; 

enum Step {
  NAME = 0,
  VISUAL_MODE = 1,
  GRANULARITY = 2,
  COMMUNICATION = 3,
  GAMIFICATION = 4,
}

export function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(Step.NAME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    visualmode: "standard",
    granularity: "low",
    communication_style: "gentle",
    gamification: "standard",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError("");
    if (currentStep === Step.NAME && !formData.name) {
        setError("Please tells us your name.");
        return;
    }

    if (currentStep < Step.GAMIFICATION) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitProfile();
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > Step.NAME) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitProfile = async () => {
    setLoading(true);
    setError("");
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        await axios.post(`${BACKEND_URL}/api/onboarding`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        router.push("/dashboard");

    } catch (err: any) {
        console.error(err);
        setError("Failed to save profile. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="backdrop-blur-md bg-card/60 border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-heading">
             Configure Neural Profile
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of 5
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
    </div>
  );
}

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
