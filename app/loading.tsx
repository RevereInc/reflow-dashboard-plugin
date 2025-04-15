import React from 'react';

export default function Loading() {
    return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center bg-background">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full bg-primary animate-[loading_1s_ease-in-out_infinite]"/>
            </div>
        </div>
    );
}