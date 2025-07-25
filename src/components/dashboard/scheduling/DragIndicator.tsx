'use client';

import { useDragLayer } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import type { SchedulableItem } from './ScheduleView';

function getItemStyles(initialOffset: any, currentOffset: any) {
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        };
    }
    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export function DragIndicator() {
    const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer(
        (monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        })
    );

    function renderItem() {
        switch (itemType) {
            case ItemTypes.JOB:
                const job = item.originalData as SchedulableItem;
                if (!job) return null;
                
                return (
                    <div className="p-2 border rounded-md bg-accent text-accent-foreground shadow-lg">
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm">{job.customerName}</p>
                    </div>
                );
            default:
                return null;
        }
    }

    if (!isDragging) {
        return null;
    }

    return (
        <div style={{ position: 'fixed', pointerEvents: 'none', zIndex: 100, left: 0, top: 0, width: '100%', height: '100%' }}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {renderItem()}
            </div>
        </div>
    );
}

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
    return job?.technicianId === techId;
}
