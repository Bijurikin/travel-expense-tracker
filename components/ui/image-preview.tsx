"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface ImagePreviewProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImagePreview({ src, alt, open, onOpenChange }: ImagePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
