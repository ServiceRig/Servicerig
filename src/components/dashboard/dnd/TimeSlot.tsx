
'use client';

import React from 'react';
import { useDrop, useDragLayer } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { DraggableJob } from './DraggableJob';
import type { SchedulableItem } from '../scheduling/ScheduleView';

interface TimeSlotProps {
  technicianId: string;
  startTime: Date;
  onDrop: (item: any, technicianId: string, startTime: Date) => void;
  onHover: (techId: string, time: Date) => void;
  startHour?: number;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ technicianId, startTime, onDrop, onHover, startHour = 7 }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.JOB,
    drop: (item: any) => {
        const cleanStartTime = new Date(startTime);
        onDrop(item, technicianId, cleanStartTime);
    },
    hover: (item, monitor) => {
        if (monitor.isOver({ shallow: true })) {
            onHover(technicianId, startTime);
        }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }), [technicianId, startTime, onDrop, onHover]);


  return (
    <div
      ref={drop}
      className="absolute w-full h-[15px]" 
      style={{
        top: `${(startTime.getHours() - startHour) * 60 + startTime.getMinutes()}px`,
      }}
    />
  );
};
