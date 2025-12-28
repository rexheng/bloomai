'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Trophy, Flame, Calendar, Camera } from 'lucide-react';
import { StatsCard } from './StatsCard';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  current_streak: number;
  xp?: number;
  level?: number;
  created_at: string;
  email?: string;
}

interface ProfileViewProps {
  initialProfile: Profile;
}

export default function ProfileView({ initialProfile }: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => ({ ...prev, display_name: displayName }));
      setIsEditing(false);
      // Optional: Add toast notification here
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm ring-1 ring-stone-100">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-sage-500" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm border border-stone-100 text-stone-400 group-hover:text-sage-600 transition-colors">
            <Camera size={14} />
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-bold text-stone-800">{profile.display_name || 'Bloom Explorer'}</h1>
          <p className="text-stone-500 text-sm mt-1">Member since {formatDate(profile.created_at)}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
             <span className="px-3 py-1 bg-sage-50 text-sage-700 text-xs font-medium rounded-full border border-sage-100">
               Free Plan
             </span>
             {/* Future: Add Level/Rank here */}
          </div>
        </div>

        <div className="flex gap-2">
           <button 
             onClick={handleLogout}
             className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
             title="Sign out"
           >
             <LogOut size={20} />
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100/50 p-1 rounded-xl w-fit mx-auto md:mx-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'overview' 
              ? 'bg-white text-stone-800 shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'settings' 
              ? 'bg-white text-stone-800 shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard 
              icon={Trophy} 
              label="Level" 
              value={profile.level || 1} 
              color="text-purple-500"
            />
            <StatsCard 
              icon={Trophy} 
              label="XP" 
              value={profile.xp || 0} 
              subValue={`Next Level: ${((profile.level || 1) * 100) - (profile.xp || 0)} XP`}
              color="text-blue-500"
            />
            <StatsCard 
              icon={Trophy} 
              label="Total Points" 
              value={profile.total_points} 
              color="text-amber-500"
            />
            <StatsCard 
              icon={Flame} 
              label="Current Streak" 
              value={`${profile.current_streak} Days`} 
              color="text-orange-500"
            />
            <StatsCard 
              icon={Calendar} 
              label="Days Tracked" 
              value="1" 
              subValue="Keep it up!"
              color="text-blue-500"
            />
            
            {/* Future: Add Activity Chart or Recent Achievements */}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
             <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-800">Profile Settings</h2>
                <p className="text-sm text-stone-500">Manage your account preferences</p>
             </div>
             
             <div className="p-6 space-y-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-colors"
                      placeholder="How should we call you?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={profile.email || ''}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isLoading || displayName === profile.display_name}
                      className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
             </div>
             
             <div className="p-6 bg-red-50/30 border-t border-stone-100">
                <h3 className="text-red-600 font-medium mb-2">Danger Zone</h3>
                <p className="text-sm text-stone-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
