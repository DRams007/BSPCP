
import { useState, useEffect } from 'react';
import { Bell, Check, Loader2, FileText, CreditCard, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Activity {
    id: string;
    activity_type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    is_read: boolean;
    created_at: string;
    related_entity?: string;
    related_id?: string;
}

const AdminNotifications = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { token } = useAuth(); // Assuming AuthContext provides token

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const limit = 20;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/activities?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchActivities();
        } else {
            // Poll for unread count occasionally or initial load
            fetchActivities();
        }

        // Set up polling interval every 60 seconds
        const interval = setInterval(fetchActivities, 60000);
        return () => clearInterval(interval);
    }, [isOpen, token]);

    const markAsRead = async (ids: string[]) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/activities/mark-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activityIds: ids })
            });

            // Update local state
            setActivities(prev => prev.map(a => ids.includes(a.id) ? { ...a, is_read: true } : a));
            setUnreadCount(prev => Math.max(0, prev - ids.filter(id => activities.find(a => a.id === id && !a.is_read)).length));
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/activities/mark-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ all: true })
            });

            setActivities(prev => prev.map(a => ({ ...a, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'application_submitted':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'payment_proof_uploaded':
                return <CreditCard className="h-4 w-4 text-green-500" />;
            case 'renewal_verified':
            case 'renewal_rejected':
                return <RefreshCw className="h-4 w-4 text-purple-500" />;
            case 'payment_verified':
            case 'payment_rejected':
                return <CreditCard className="h-4 w-4 text-orange-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getLink = (activity: Activity) => {
        if (activity.activity_type === 'application_submitted') {
            return `/admin/applications?id=${activity.related_id}`;
        }
        // For payments/renewals, we might want to go to member details or a payment review page
        // Assuming /admin/members redirects or we can filter
        return `/admin/members`;
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-1 text-muted-foreground hover:text-primary"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {loading && activities.length === 0 ? (
                        <div className="flex items-center justify-center h-20">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className={cn(
                                        "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                                        !activity.is_read && "bg-blue-50/50"
                                    )}
                                    onClick={() => !activity.is_read && markAsRead([activity.id])}
                                >
                                    <div className="mt-1 bg-background p-2 rounded-full border shadow-sm">
                                        {getIcon(activity.activity_type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !activity.is_read && "text-blue-700")}>
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {activity.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {/* Quick Action or Indicator */}
                                    {!activity.is_read && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead([activity.id]);
                                                }}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs justify-center" asChild>
                        <Link to="/admin/notifications">View All Notifications</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AdminNotifications;
