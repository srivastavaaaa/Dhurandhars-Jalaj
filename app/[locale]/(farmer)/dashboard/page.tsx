import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { Sprout, BookOpen, Warehouse, Tractor, Bell, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// Client component for dynamic notifications listing
import NotificationList from './NotificationList';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const farmerId = cookieStore.get('krishi_farmer_id')?.value;

  let farmer = null;

  if (farmerId) {
    farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        farms: {
          include: {
            crops: true
          }
        },
        schemeMatches: true,
        bookings: true,
        notifications: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });
  }

  if (!farmer) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 min-h-[70vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-md text-center space-y-4">
          <ShieldCheck size={48} className="text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 font-black">No Profile Registered</h3>
          <p className="text-xs text-slate-500 font-light">
            You need to create a farm profile before accessing the dashboard.
          </p>
          <Link
            href="/onboarding"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition"
          >
            Register Profile
          </Link>
        </div>
      </div>
    );
  }

  const farm = farmer.farms[0];
  const crop = farm?.crops[0];
  const eligibleSchemesCount = farmer.schemeMatches.filter(m => m.status === 'suggested').length;
  const activeBookingsCount = farmer.bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-lg shadow-emerald-900/10">
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] bg-emerald-700/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-emerald-300">
            Farming Hub
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Namaste, {farmer.name}!</h2>
          <p className="text-xs text-emerald-100 font-light">
            Village: <strong>{farmer.village}</strong> • Crop: <strong>{crop?.cropName || 'None listed'}</strong>
          </p>
        </div>

        <div className="flex space-x-2 relative z-10">
          <Link
            href="/dashboard/profile"
            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            Edit Profile
          </Link>
          <Link
            href="/onboarding"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md"
          >
            Switch Language
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 text-emerald-700/15 pointer-events-none">
          <Sprout size={180} />
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Schemes Match Card */}
        <Link
          href="/dashboard/schemes"
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex items-start justify-between group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Government Schemes</span>
              <span className="text-2xl font-black text-slate-800">{eligibleSchemesCount} Matched</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-100 transition">
            View
          </span>
        </Link>

        {/* Post-Harvest advisor Card */}
        <Link
          href="/dashboard/harvest-advisor"
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex items-start justify-between group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Warehouse size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Harvest Advisory</span>
              <span className="text-2xl font-black text-slate-800">
                {crop?.cropName ? '35% Spoilage' : 'No advisory'}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full group-hover:bg-amber-100 transition">
            View
          </span>
        </Link>

        {/* Equipment Rentals Card */}
        <Link
          href="/dashboard/equipment"
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex items-start justify-between group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Tractor size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Equipment Bookings</span>
              <span className="text-2xl font-black text-slate-800">{activeBookingsCount} Confirmed</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full group-hover:bg-purple-100 transition">
            View
          </span>
        </Link>
      </div>

      {/* Main Grid: Crop Diagnostics status + Notification List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Crop Diagnostics & Bio Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center space-x-2">
              <Sprout size={18} className="text-emerald-600" />
              <span>Active Crop Status</span>
            </h3>
            
            {crop ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Crop Name:</span>
                  <span className="font-bold text-slate-800">{crop.cropName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Sown Date:</span>
                  <span className="font-semibold text-slate-800">{new Date(crop.sownDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Growth Stage:</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">{crop.currentStage}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Health Index:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    crop.status === 'Healthy' 
                      ? 'bg-green-50 text-green-700' 
                      : crop.status === 'Diseased' 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-amber-50 text-amber-700'
                  }`}>{crop.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-light">No crops registered yet.</p>
            )}
          </div>
        </div>

        {/* Notifications and Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center space-x-2">
              <Bell size={18} className="text-emerald-600" />
              <span>Notifications & Action Alerts</span>
            </h3>
            
            <NotificationList initialNotifications={farmer.notifications} />
          </div>
        </div>

      </div>

    </div>
  );
}
