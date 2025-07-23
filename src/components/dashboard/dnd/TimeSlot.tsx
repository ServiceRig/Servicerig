
'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';

interface TimeSlotProps {
  technicianId: string;
  startTime: Date;
  onDrop: (jobId: string, technicianId: string, startTime: Date) => void;
  startHour?: number;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ technicianId, startTime, onDrop, startHour = 7 }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.JOB,
    drop: (item: { id: string }) => {
        // Ensure we pass a clean date object to avoid timezone issues.
        const cleanStartTime = new Date(startTime);
        onDrop(item.id, technicianId, cleanStartTime);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [technicianId, startTime, onDrop]);

  return (
    <div
      ref={drop}
      className="absolute w-full border-t border-dashed border-gray-300"
      style={{
        top: `${(startTime.getHours() - startHour + startTime.getMinutes() / 60) * 60}px`,
        height: '15px', 
      }}
    >
      {isOver && canDrop && (
        <div
          className="absolute inset-0 bg-accent opacity-50"
        />
      )}
    </div>
  );
};
