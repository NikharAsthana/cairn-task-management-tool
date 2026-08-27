// apps/web/src/components/shared/motion-button.tsx
"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

// motion.create() wraps an existing React component with Motion's gesture
// and animation props (whileTap, whileHover, etc.), without needing to
// touch button.tsx itself — same "compose over, don't edit vendor files"
// approach used everywhere else shadcn primitives get customized in this
// project.
export const MotionButton = motion.create(Button);