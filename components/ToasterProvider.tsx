'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#333',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#FFFFFF',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#FFFFFF',
                    },
                },
            }}
        />
    );
}
