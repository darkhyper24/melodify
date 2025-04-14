"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    thumbSize?: string;
    trackSize?: string;
    rangeColor?: string;
    trackColor?: string;
    thumbColor?: string;
}

const Slider = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
    ({ className, thumbSize, trackSize, rangeColor, trackColor, thumbColor, ...props }, ref) => (
        <SliderPrimitive.Root
            ref={ref}
            className={cn("relative flex w-full touch-none select-none items-center group", className)} // Add "group" here
            {...props}
        >
            <SliderPrimitive.Track className={cn("relative grow overflow-hidden rounded-full", trackSize || "h-2", trackColor || "bg-[#4d4d4d]")}>
                <SliderPrimitive.Range
                    className={cn("absolute h-full rounded-full group-hover:bg-[#1ed760] group-hover:rounded-none", rangeColor || "bg-white")}
                />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
                className={cn(
                    "block rounded-full border-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 opacity-0 group-hover:opacity-100",
                    thumbSize || "h-3 w-3",
                    thumbColor || "border-primary bg-white"
                )}
            />
        </SliderPrimitive.Root>
    )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
