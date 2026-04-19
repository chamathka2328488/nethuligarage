import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Notification {
    id: string;
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    link: string;
}

// ── Style helpers ──────────────────────────────────────────────────────────────

const typeStyles: Record<Notification['type'], { dot: string; bg: string; border: string; title: string }> = {
    danger:  { dot: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800',    title: 'text-red-700 dark:text-red-400'    },
    warning: { dot: 'bg-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', title: 'text-yellow-700 dark:text-yellow-400' },
    info:    { dot: 'bg-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',  title: 'text-blue-700 dark:text-blue-400'  },
};

// ── Component ──────────────────────────────────────────────────────────────────

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [dismissed, setDismissed]         = useState<Set<string>>(new Set());
    const [open, setOpen]                   = useState(false);
    const [loading, setLoading]             = useState(false);
    const dropdownRef                        = useRef<HTMLDivElement>(null);

    // ── Fetch notifications ────────────────────────────────────────────────────

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res  = await fetch('/notifications', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            setNotifications(data.notifications ?? []);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount and every 60 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Computed ───────────────────────────────────────────────────────────────

    const visible = notifications.filter(n => !dismissed.has(n.id));
    const count   = visible.length;

    const handleDismiss = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDismissed(prev => new Set([...prev, id]));
    };

    const handleDismissAll = () => {
        setDismissed(new Set(visible.map(n => n.id)));
        setOpen(false);
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="relative" ref={dropdownRef}>

            {/* Bell button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
            >
                {/* Bell icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Badge */}
                {count > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Notifications
                            {count > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">{count}</span>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchNotifications}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Refresh"
                            >
                                {loading ? '↻' : '↺'}
                            </button>
                            {count > 0 && (
                                <button
                                    onClick={handleDismissAll}
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                        {visible.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-sm">All clear — no alerts</p>
                            </div>
                        ) : (
                            visible.map(n => {
                                const s = typeStyles[n.type];
                                return (
                                    <Link
                                        key={n.id}
                                        href={n.link}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-start gap-3 px-4 py-3 ${s.bg} border-l-4 ${s.border} hover:opacity-90 transition-opacity no-underline`}
                                    >
                                        {/* Dot */}
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold ${s.title}`}>{n.title}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{n.message}</p>
                                        </div>

                                        {/* Dismiss */}
                                        <button
                                            onClick={e => handleDismiss(n.id, e)}
                                            className="shrink-0 text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 text-sm leading-none mt-0.5"
                                            title="Dismiss"
                                        >
                                            ✕
                                        </button>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {visible.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
                            <p className="text-[11px] text-gray-400 text-center">
                                Auto-refreshes every 60 seconds
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}