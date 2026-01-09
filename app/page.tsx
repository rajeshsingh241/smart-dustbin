import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Shield, Bell, BarChart3 } from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Smart Dustbin</span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Smart Waste Management
            <br />
            <span className="text-green-600 dark:text-green-400">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Monitor dustbins in real-time with IoT sensors. Get instant alerts when bins are full.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg shadow-lg border dark:border-gray-700"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Real-Time Monitoring</h3>
            <p className="text-gray-600 dark:text-gray-300">Track fill levels with IoT sensors.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Instant Alerts</h3>
            <p className="text-gray-600 dark:text-gray-300">Get alerts when bins are full.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Secure & Scalable</h3>
            <p className="text-gray-600 dark:text-gray-300">Enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}