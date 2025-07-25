
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ScheduleViewContextType {
    isFitToScreen: boolean;
    setIsFitToScreen: (isFit: boolean) => void;
}

const ScheduleViewContext = createContext<ScheduleViewContextType | undefined>(undefined);

export function ScheduleViewProvider({ children }: { children: ReactNode }) {
    const [isFitToScreen, setIsFitToScreen] = useState(true);
    return (
        <ScheduleViewContext.Provider value={{ isFitToScreen, setIsFitToScreen }}>
            {children}
        </ScheduleViewContext.Provider>
    );
}

export function useScheduleView() {
    const context = useContext(ScheduleViewContext);
    if (context === undefined) {
        throw new Error('useScheduleView must be used within a ScheduleViewProvider');
    }
    return context;
}
