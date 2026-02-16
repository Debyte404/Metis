**Smart** **Companion** **Version:** 1.0

**Status:** Draft

**Target** **Platform:** Web Application (PWA Capable)

**1.** **Executive** **Summary**

The Smart Companion is an AI-powered life operating system designed to
assist neurodiverse individuals (ADHD, Dyslexia, etc.) in overcoming
"Task Paralysis" and "Time Blindness." Unlike standard to-do lists, this
system adapts to the user's biological energy rhythm and visual
processing needs, breaking overwhelming goals into "MicroWins."

**2.** **Feature** **Set** **1:** **The** **Calibration** **Wizard**
**(Onboarding)**

**Goal:** Capture the user's functional preferences and biological
rhythm without using medical jargon or causing "form fatigue."

**2.1** **User** **Flow**

Index Page -\> Auth (Signup) -\> **Calibration** **Wizard** -\>
Dashboard

**2.2** **Functional** **Requirements**

**Step** **1:** **Visual** **Comfort** **Tuner** **(Dyslexia**
**Support)**

> ● **Objective:** Configure the UI to minimize visual stress. ●
> **Interaction:** A split-screen comparison.
>
> ○ *Panel* *A:* Standard Sans-Serif font, normal leading, white
> background.
>
> ○ *Panel* *B:* **OpenDyslexic** font, 1.5x line spacing, "Cream"
> background (Hex: \#FFFDD0). ● **Question:** "Which side is calmer for
> your eyes?"
>
> ● **Output** **Variable:** visual_mode (Standard/Dyslexia-Friendly).

**Step** **2:** **Cognitive** **Load** **Calibration** **(Granularity)**

> ● **Objective:** Determine how the AI should decompose tasks. ●
> **Interaction:** Two cards showing a task list.
>
> ○ *Card* *A* *(Low* *Granularity):* "1. Clean the Kitchen."
>
> ○ *Card* *B* *(High* *Granularity):* "1. Throw away trash on counter.
> 2. Put dirty dishes in sink. 3. Wipe the table."
>
> ● **Question:** "Which instruction feels less overwhelming?"
>
> ● **Output** **Variable:** granularity_preference (Macro/Micro).

**Step** **3:** **Chronotype** **Detection** **(Energy** **Scheduler)**

> ● **Objective:** Map the user's peak energy hours.
>
> ● **Interaction:** A visual slider or three simple illustrated cards.
> ○ *Morning* *Lark:* "I'm sharpest before noon."
>
> ○ *Mid-Day:* "I peak in the afternoon."
>
> ○ *Night* *Owl:* "I get my best work done after dark."
>
> ● **Output** **Variable:** chronotype (Lark/Hummingbird/Owl).

**Step** **4:** **Sensory** **Profile** **(Gamification)**

> ● **Objective:** Determine reward mechanisms. ● **Interaction:**
> Toggle switch.
>
> ○ *Gamified:* "I like streaks, badges, and sounds." ○ *Zen* *Mode:* "I
> prefer a quiet, calm interface."
>
> ● **Output** **Variable:** gamification_level (High/Low).

**2.3** **Technical** **Constraints**

> ● **Privacy:** All answers are stored in the local SQLite NeuroProfile
> table.
>
> ● **Persistence:** Settings must be applied immediately to the
> Onboarding UI itself (e.g., if they pick Dyslexia font, the rest of
> the wizard switches to that font instantly).

**3.** **Feature** **Set** **2:** **The** **Dashboard** **(The**
**Command** **Center)**

**Goal:** Eliminate "Decision Fatigue" by hiding future tasks and
focusing strictly on the "Now."

**3.1** **Design** **Layout** **(Wireframe** **Logic)**

The screen is divided into three distinct zones to guide the eye.

||
||
||
||
||

||
||
||

**3.2** **Detailed** **Component** **Requirements**

**Component** **A:** **The** **Energy** **Battery**

> ● **Logic:** Compares Current_System_Time vs. User's Chronotype. ●
> **Visual** **States:**
>
> ○ *High* *Charge* *(Green):* "Peak Energy. Great time for complex
> tasks." ○ *Low* *Charge* *(Orange):* "Energy Dip. Let's stick to easy
> wins."
>
> ● **Data** **Source:** Scheduler Algorithm (Python backend).

**Component** **B:** **The** **Focus** **Solo** **(The** **"Task**
**Paralysis"** **Killer)**

> ● **Behavior:**
>
> ○ This component hides the full to-do list.
>
> ○ It fetches the **top** **priority** **MicroWin** from the backend.
>
> ○ *Example* *Display:* A large, clean card reading: **"Open** **your**
> **Physics** **Textbook."** (Not "Study Physics").
>
> ● **Actions:**
>
> ○ **"Done"** **Button:** Triggers a "Dopamine Hit" (visual ripple
> effect + subtle sound). Loads the next step.
>
> ○ **"Stuck"** **Button:** Summons the AI Companion to break the step
> down further (e.g., "Okay, just find the book first").
>
> ○ **"Defer"** **Button:** Pushes the task to the "Energy Dip" slot
> later in the day.

**Component** **C:** **The** **Brain** **Dump**

> ● **Behavior:** A constantly visible text input field at the bottom.
>
> ● **Function:** Users type raw thoughts here (e.g., "Need to call
> Mom").
>
> ● **Backend** **Logic:** These inputs are sent to the LLM later to be
> parsed, categorized, and scheduled. They do *not* clutter the
> immediate view.

**Component** **D:** **Zero** **State** **(First** **Login)**

> ● **Trigger:** User has no tasks.
>
> ● **UI:** A calm illustration (e.g., a resting landscape).
>
> ● **Copy:** "All caught up. What's on your mind for today?"
>
> ● **Call** **to** **Action:** Focus is placed on the "Brain Dump"
> input.

**4.** **API** **Requirements** **(FastAPI** **Endpoints)**

**4.1** **Onboarding**

> ● POST /api/v1/profile/calibrate
>
> ○ **Input:** JSON object with preferences.
>
> ○ **Action:** Updates NeuroProfile in SQLite.

**4.2** **Dashboard**

> ● GET /api/v1/dashboard/state ○ **Returns:**
>
> ■ energy_level: (High/Low)
>
> ■ current_microwin: { "text": "Open VS Code", "id": 101 } ■
> streak_count: (Integer)
>
> ● POST /api/v1/tasks/complete/{id}
>
> ○ **Action:** Marks task done, updates streak, returns next_microwin.

**5.** **Non-Functional** **Requirements**

> 1\. **Load** **Time:** Dashboard must load in \< 1.5 seconds (critical
> for ADHD users who lose focus quickly).
>
> 2\. **Accessibility:** Must pass **WCAG** **2.1** **AAA** standards
> (High contrast ratios, screen reader compatibility).
>
> 3\. **Error** **Handling:** Never show red "Error" boxes (induces
> anxiety). Use gentle "Retry" prompts in neutral colors.

**6.** **Success** **Metrics** **(For** **Judges)**

> ● **Retention:** Do users return for Day 2? (Measured by "Streak"
> data). ● **Completion** **Rate:** % of "MicroWins" completed vs. "Big
> Goals" set.
>
> ● **Latency:** Time taken from "Brain Dump" input to "Task Scheduled"
> (Eficiency of AI).
