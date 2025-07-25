
'use client';

import { useDragLayer } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import type { SchedulableItem } from './ScheduleView';

// This component is no longer needed for visual feedback as ghosting is handled in ScheduleView
// but we keep the hook for potential future use or for other drag types.

export function useIsDraggingTechnician(techId: string) {
    const { itemType, isDragging, item } = useDragLayer(
        (monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            isDragging: monitor.isDragging(),
        })
    );

    if (!isDragging || itemType !== ItemTypes.JOB) {
        return false;
    }
    
    const job = item.originalData as SchedulableItem;
    // Check if the dragged job's technicianId matches the column's techId
    // This is the key logic for highlighting the correct column.
    return job?.technicianId === techId;
}
