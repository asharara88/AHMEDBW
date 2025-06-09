import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Brain, Zap, ChevronRight, Bell, Settings, User, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeviceDropdown from './DeviceDropdown';
import SubscriptionStatus from '../common/SubscriptionStatus';

interface DashboardSidebarProps {
  userId: string;
}

const DashboardSidebar = ({ userId }: DashboardSidebarProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Activity className="h-4 w-4" /> },
    { id: 'metabolic', name: 'Metabolic', icon: <Zap className="h-4 w-4" /> },
    { id: 'recovery', name: 'Recovery', icon: <Heart className="h-4 w-4" /> },
    { id: 'cognitive', name: 'Cognitive', icon: <Brain className="h-4 w-4" /> },
  ];
  
  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">Welcome back</h3>
            <p className="text-sm text-text-light">Your health score: 82</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link 
            to="/profile" 
            className="flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <Link 
            to="/notifications" 
            className="flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <Bell className="h-3.5 w-3.5" />
            Alerts
          </Link>
        </div>
      </div>
      
      {/* Subscription Status */}
      <SubscriptionStatus />
      
      {/* Device Connection */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
        <DeviceDropdown />
      </div>
      
      {/* Dashboard Navigation */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
        <h3 className="mb-3 text-sm font-medium">Dashboard Views</h3>
        <div className="space-y-1">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.id === 'overview' ? '/dashboard' : `/dashboard/${tab.id}`}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.name}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
        <h3 className="mb-3 text-sm font-medium">Quick Links</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/chat"
            className="flex flex-col items-center rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-center text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <Activity className="mb-1 h-5 w-5 text-primary" />
            Chat with Coach
          </Link>
          <Link
            to="/supplements"
            className="flex flex-col items-center rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-center text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <Package className="mb-1 h-5 w-5 text-primary" />
            Supplements
          </Link>
          <Link
            to="/insights"
            className="flex flex-col items-center rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-center text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <Brain className="mb-1 h-5 w-5 text-primary" />
            Insights
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-center text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <User className="mb-1 h-5 w-5 text-primary" />
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;