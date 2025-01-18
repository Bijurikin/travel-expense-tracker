"use client"

import { motion } from "framer-motion"

export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// Aktualisierte Motion-Komponenten
export const MotionButton = motion.button
export const MotionDiv = motion.div

// Für benutzerdefinierte Komponenten
export const createMotionComponent = <T extends React.ElementType>(
  Component: T,
  motionConfig = {}
) => {
  return motion(Component, {
    forwardMotionProps: true,
    ...motionConfig,
  }) as ReturnType<typeof motion<T>>
}
