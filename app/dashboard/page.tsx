// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Trash2 } from 'lucide-react';
import DashboardContent from '@/components/DashboardContent';
import DarkModeToggle from '@/components/DarkModeToggle';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user details from Clerk
  const user = await currentUser();
  
  // REMOVED Firebase calls - they're causing issues
  // We will handle this on the client side if needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Smart Dustbin System</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Welcome, {user?.firstName || 'User'}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>

      <DashboardContent />
    </div>
  );
}