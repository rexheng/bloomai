import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileView from '@/components/profile/ProfileView';

export default async function ProfilePage() {
  const supabase = await createClient();

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // BYPASS: Mock user for development
  let profile = null;
  
  if (!user) {
    console.log('⚠️ Using Mock User for Profile Page');
    user = {
      id: 'mock-user-id',
      email: 'guest@bloom.com',
      user_metadata: {
        full_name: 'Guest Explorer',
        avatar_url: null
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    } as any;

    profile = {
      id: 'mock-user-id',
      display_name: 'Guest Explorer',
      avatar_url: null,
      total_points: 100,
      current_streak: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } else {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // Construct the profile object with email from auth user if not present in profile table
  // based on the requirements schema, profile table doesn't have email.
  const profileData = {
    ...profile,
    id: user!.id, // Ensure ID is present
    email: user!.email,
    display_name: profile?.display_name || user!.user_metadata?.full_name || 'Explorer',
    avatar_url: profile?.avatar_url || user!.user_metadata?.avatar_url,
    total_points: profile?.total_points || 0,
    current_streak: profile?.current_streak || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    created_at: profile?.created_at || user!.created_at, // Fallback
  };

  return <ProfileView initialProfile={profileData} />;
}
