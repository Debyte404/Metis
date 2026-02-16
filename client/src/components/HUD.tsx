"use client";

import { useHUDStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Settings, Eye, Sun, Moon, LogOut, Check, Sliders, Activity, Palette, Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function HUD() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { 
    isDyslexic, toggleDyslexic,
    isWarm, toggleWarm,
    shaderSettings, setShaderSettings
  } = useHUDStore();

  useEffect(() => {
    setMounted(true);
    // Apply dyslexic class to body
    if (isDyslexic) {
      document.body.classList.add("dyslexic");
    } else {
      document.body.classList.remove("dyslexic");
    }
  }, [isDyslexic]);

  if (!mounted) return null;

  const handleLogout = () => {
    // Clear token (implementation depends on storage method, assuming localStorage for now)
    localStorage.removeItem("token"); // or cookie clear
    router.push("/auth/login");
  };

  return (
    <motion.div 
      drag 
      dragMomentum={false}
      className="fixed top-4 left-4 z-[10000] flex items-center gap-2 p-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5 cursor-move active:cursor-grabbing hover:bg-black/30 transition-colors"
    >
       {/* Drag Handle */}
       <div className="text-white/20 hover:text-white/50 px-1">
          <Grip className="h-4 w-4" />
       </div>
       
       {/* Visual Accessibility Menu */}
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary">
            <Eye className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Visual Comfort</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={toggleDyslexic} className="flex justify-between">
            <span className={isDyslexic ? "font-dyslexic" : ""}>Dyslexia Font</span>
            {isDyslexic && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleWarm} className="flex justify-between">
            <span>Warm Filter</span>
            {isWarm && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="flex justify-between">
             <span className="flex items-center gap-2"><Moon className="h-3 w-3" /> Dark</span>
             {theme === 'dark' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("light")} className="flex justify-between">
             <span className="flex items-center gap-2"><Sun className="h-3 w-3" /> Light</span>
             {theme === 'light' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User / Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary">
             <Settings className="h-4 w-4" />
           </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </motion.div>
  );
}
