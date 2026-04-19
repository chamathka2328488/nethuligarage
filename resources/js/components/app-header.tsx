import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { NotificationBell } from '@/components/notification-bell';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 dark:border-sidebar-border">
            <SidebarTrigger className="-ml-1" />

            <div className="flex flex-1 items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Notification bell — right side of header */}
            <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
            </div>
        </header>
    );
}