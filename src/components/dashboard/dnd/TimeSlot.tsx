
'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TimeSlotProps {
  technicianId: string;
  startTime: Date;
  onDrop: (item: any, technicianId: string, startTime: Date) => void;
  startHour?: number;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ technicianId, startTime, onDrop, startHour = 7 }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.JOB,
    drop: (item: any) => {
        // Ensure we pass a clean date object to avoid timezone issues.
        const cleanStartTime = new Date(startTime);
        onDrop(item, technicianId, cleanStartTime);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [technicianId, startTime, onDrop]);

  return (
    <div
      ref={drop}
      className="absolute w-full h-[15px]" // The drop target area is the full 15-min slot
      style={{
        top: `${(startTime.getHours() - startHour + startTime.getMinutes() / 60) * 60}px`,
      }}
    >
      <div
        className={cn(
          "w-full transition-all",
          // The visual indicator is a line at the top of the slot
          isOver && canDrop 
            ? 'h-1 bg-accent opacity-100' // Prominent line on hover
            : 'h-[1px] bg-gray-300/50'  // Subtle line for the grid
        )}
      />
    </div>
  );
};
