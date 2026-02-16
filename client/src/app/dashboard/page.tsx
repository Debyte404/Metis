"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, Play, BrainCircuit, Trophy, SkipForward, ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const BACKEND_URL = "http://localhost:8000";

interface DashboardState {
  user_preferences: {
    visual_mode: string;
    granularity: string;
    gamification: string;
  };
  next_task: {
    id: string; 
    step_key: string;
    content: string;
    parent_task_id: string; 
  } | null;
  next_job: {
    id: string;
    content: string;
  } | null;
  all_jobs: {
    _id: string;
    description: string;
    status: string;
    created_at: string;
  }[];
  xp_points?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState("");
  const { theme, setTheme } = useTheme();
  const [justEarnedXP, setJustEarnedXP] = useState<number | null>(null);

  const fetchState = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const res = await axios.get(`${BACKEND_URL}/api/dashboard/state`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setState(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard state", err);
      // Optional: Redirect to login if 401
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleClickEvent = async (eventType: "completed" | "skipped", itemType: "task" | "job", itemId: string, stepKey?: string) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${BACKEND_URL}/api/dashboard/clickevent`, {
        event_type: eventType,
        item_type: itemType,
        item_id: itemId,
        step_key: stepKey
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.achievements) {
        // Simple XP toast effect
        const xp = Object.keys(res.data.achievements).reduce((acc, key) => acc + parseInt(key), 0);
        setJustEarnedXP(xp);
        setTimeout(() => setJustEarnedXP(null), 3000);
      }

      await fetchState();
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecompose = async (jobId: string) => {
    setIsProcessing(true);
    try {
        const token = localStorage.getItem("token");
        await axios.post(`${BACKEND_URL}/api/dashboard/decomposejob`, {
            item_id: jobId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await fetchState();
    } catch (err) {
        console.error("Decomposition failed", err);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleBrainDump = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!brainDumpText.trim()) return;
      
      setIsProcessing(true);
      try {
          const token = localStorage.getItem("token");
          await axios.post(`${BACKEND_URL}/api/dashboard/braindump`, {
              content: brainDumpText
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setBrainDumpText("");
          await fetchState();
      } catch (err) {
          console.error("Brain dump failed", err);
      } finally {
        setIsProcessing(false);
      }
  };


  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground font-mono">Loading Neural Interface...</p>
              </div>
          </div>
      );
  }

  if (!state) return null;

  const isGamified = state.user_preferences.gamification === "gamified";

  return (
    <div className="min-h-screen bg-background p-6 font-mono relative overflow-hidden">
        {/* Minimalist Grid Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
        </div>

        {/* XP Floating Toast */}
        {justEarnedXP && (
            <div className="fixed top-10 right-10 z-50 animate-in slide-in-from-right fade-in duration-300">
                <Badge className="text-xl py-2 px-4 bg-yellow-500/90 text-black border-none shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    <Trophy className="w-6 h-6 mr-2 inline" />
                    +{justEarnedXP} XP
                </Badge>
            </div>
        )}

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
            
            {/* Header */}
            <header className="flex justify-between items-center border-b border-border/40 pb-6">
                <div>
                     <h1 className="text-4xl font-bold tracking-tighter text-foreground font-heading">METIS<span className="text-primary">.OS</span></h1>
                     <p className="text-muted-foreground mt-1">Operational Command</p>
                </div>
                <div className="flex items-center gap-4">
                    {isGamified && (
                         <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                             <Trophy className="w-4 h-4 text-yellow-500" />
                             <span className="font-bold text-lg">{state.xp_points} XP</span>
                         </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* LEFT COL: Next Task Pane */}
                <div className="md:col-span-7 space-y-6">
                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-primary">
                            <Play className="w-4 h-4 mr-2" /> Current Directive
                        </h2>
                        
                        {state.next_task ? (
                             <Card className="border-primary/50 bg-card/50 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all hover:border-primary">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                         <Badge variant="outline" className="font-mono text-xs uppercase tracking-widest mb-2">Micro-Step {state.next_task.step_key}</Badge>
                                    </div>
                                    <CardTitle className="text-2xl md:text-3xl font-heading leading-tight">
                                        {state.next_task.content}
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="flex gap-3 pt-4">
                                    <Button 
                                        size="lg" 
                                        className="flex-1 text-lg h-14" 
                                        onClick={() => handleClickEvent("completed", "task", state.next_task!.id, state.next_task!.step_key)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
                                        Complete
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="secondary" 
                                        className="h-14"
                                        onClick={() => handleClickEvent("skipped", "task", state.next_task!.id, state.next_task!.step_key)}
                                        disabled={isProcessing}
                                    >
                                        <SkipForward className="h-5 w-5" />
                                    </Button>
                                </CardFooter>
                             </Card>
                        ) : (
                            <Card className="border-dashed border-border bg-muted/10">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary-foreground">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">All Clear</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs">
                                        No active micro-tasks. Decompose a job or add a new one to continue.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {/* Brain Dump Input */}
                     <section>
                         <h2 className="text-lg font-semibold mb-4 flex items-center text-primary">
                            <BrainCircuit className="w-4 h-4 mr-2" /> Neural Input
                        </h2>
                        <Card className="bg-card/30">
                            <CardContent className="pt-6">
                                <form onSubmit={handleBrainDump} className="flex gap-4">
                                    <Input 
                                        placeholder="Dump your thoughts here... (e.g., 'Buy milk, call mom, build a rocket')" 
                                        className="flex-1 bg-background/50 h-12"
                                        value={brainDumpText}
                                        onChange={(e) => setBrainDumpText(e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    <Button type="submit" size="lg" disabled={!brainDumpText.trim() || isProcessing}>
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                                    </Button>
                                </form>
                                <p className="text-xs text-muted-foreground mt-2 pl-1">
                                    AI filters noise & extracts actionable jobs automatically.
                                </p>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                 {/* RIGHT COL: Jobs List */}
                 <div className="md:col-span-5 relative">
                     <div className="sticky top-6">
                         <h2 className="text-lg font-semibold mb-4 flex items-center text-muted-foreground">
                            Mission Log ({state.all_jobs.length})
                        </h2>
                        
                        <Card className="bg-card/40 border-border/60">
                            <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md">
                                <div className="p-4 space-y-3">
                                    {state.all_jobs.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            No pending missions.
                                        </div>
                                    ) : (
                                        state.all_jobs.map((job) => (
                                            <div key={job._id} className="group flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-background/40 hover:bg-background/80 transition-all hover:border-primary/30 hover:shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-medium text-sm leading-snug">{job.description}</p>
                                                    <Badge variant={job.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px]">
                                                        {job.status}
                                                    </Badge>
                                                </div>
                                                
                                                {job.status !== 'completed' && (
                                                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="xs" 
                                                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleClickEvent("skipped", "job", job._id)}
                                                            disabled={isProcessing}
                                                        >
                                                            Skip
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="xs" 
                                                            className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/50 text-foreground"
                                                            onClick={() => handleDecompose(job._id)}
                                                            disabled={isProcessing}
                                                        >
                                                            <NetworkIcon className="w-3 h-3 mr-1.5" /> Breakdown
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                     </div>
                 </div>

            </div>
        </div>
    </div>
  );
}

function NetworkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  )
}
