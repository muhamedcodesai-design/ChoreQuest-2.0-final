import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Trophy, Gift, Zap, Flame } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  activity_type: 'chore_completed' | 'chore_approved' | 'badge_earned' | 'level_up' | 'reward_redeemed';
  description: string;
  xp_earned?: number;
  points_earned?: number;
  created_at: string;
}

interface KidActivityTimelineProps {
  kidId: string;
  kidName: string;
}

export function KidActivityTimeline({ kidId, kidName }: KidActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('kid_id', kidId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setActivities(data);
      }
      setLoading(false);
    };

    fetchActivities();
  }, [kidId]);

  const getActivityIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      chore_completed: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
      chore_approved: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      badge_earned: <Trophy className="w-5 h-5 text-yellow-500" />,
      level_up: <Zap className="w-5 h-5 text-purple-500" />,
      reward_redeemed: <Gift className="w-5 h-5 text-pink-500" />,
    };
    return icons[type] || <CheckCircle2 className="w-5 h-5 text-gray-500" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      chore_completed: 'bg-blue-50 border-blue-200',
      chore_approved: 'bg-green-50 border-green-200',
      badge_earned: 'bg-yellow-50 border-yellow-200',
      level_up: 'bg-purple-50 border-purple-200',
      reward_redeemed: 'bg-pink-50 border-pink-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      chore_completed: 'Quest Completed',
      chore_approved: 'Quest Approved',
      badge_earned: 'Badge Earned',
      level_up: 'Level Up!',
      reward_redeemed: 'Reward Redeemed',
    };
    return labels[type] || 'Activity';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground">No activities yet. Start completing quests to build your timeline!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <Card key={activity.id} className={`p-4 border-l-4 ${getActivityColor(activity.activity_type)}`}>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.activity_type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {getActivityLabel(activity.activity_type)}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{activity.description}</p>
            </div>

            {/* Rewards */}
            <div className="flex-shrink-0 text-right">
              {activity.xp_earned ? (
                <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                  <Zap className="w-4 h-4" />
                  +{activity.xp_earned}
                </div>
              ) : null}
              {activity.points_earned ? (
                <div className="flex items-center gap-1 text-sm font-bold text-primary">
                  <Trophy className="w-4 h-4" />
                  +{activity.points_earned}
                </div>
              ) : null}
            </div>
          </div>

          {/* Timeline connector */}
          {index < activities.length - 1 && (
            <div className="absolute left-8 top-full w-0.5 h-3 bg-gradient-to-b from-current to-transparent" />
          )}
        </Card>
      ))}
    </div>
  );
}
