"use client"

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Progress } from "@/components/ui/progress";

interface RangeSliderProps {
    min: number;
    max: number;
    start: number;
    end: number;
    onChange: (start: number, end: number) => void;
    onConfirm?: () => void;
}

export default function RangeSlider({ min, max, start, end, onChange, onConfirm }: RangeSliderProps) {
    const [startVal, setStartVal] = useState(start);
    const [endVal, setEndVal] = useState(end);

    const handleStartChange = (val: number) => {
        const newStart = Math.min(val, endVal - 1);
        setStartVal(newStart);
        onChange(newStart, endVal);
    };

    const handleEndChange = (val: number) => {
        const newEnd = Math.max(val, startVal + 1);
        setEndVal(newEnd);
        onChange(startVal, newEnd);
    };

    const percentRange = ((endVal - startVal) / (max - min)) * 100;

    return (
        <div className="w-full mt-2">
            <div className="flex items-center justify-between gap-4 mb-5">
                <Input
                    type="number"
                    min={min}
                    max={endVal - 1}
                    value={startVal}
                    onChange={(e) => handleStartChange(Number(e.target.value))}
                    className="w-full text-center text-sm appearance-none"
                />
                <Input
                    type="number"
                    min={startVal + 1}
                    max={max}
                    value={endVal}
                    onChange={(e) => handleEndChange(Number(e.target.value))}
                    className="w-full text-center text-sm appearance-none"
                />
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-sm overflow-hidden ">
                <div
                    className="h-full bg-[#6127FF] transition-all duration-300"
                    style={{
                        marginLeft: `${((startVal - min) / (max - min)) * 100}%`,
                        width: `${percentRange}%`
                    }}
                />
            </div>

            <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span>{max}</span>
            </div>

            {onConfirm && (
                <Button className="mt-6 w-full bg-[#6127FF] hover:bg-[#6127FF]/90 text-white" onClick={onConfirm}>
                    Confirm
                </Button>
            )}
        </div>
    );
}