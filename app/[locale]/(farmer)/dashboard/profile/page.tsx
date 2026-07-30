import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { Sprout, User, MapPin, Landmark, ShieldCheck, Languages } from 'lucide-react';
import Link from 'next/link';

// Import client component for the editing action
import ProfileForm from './ProfileForm';

const prisma = new PrismaClient();

export default async function ProfilePage() {
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
        }
      }
    });
  }

  // If no farmer, render a mock signup trigger or loading
  if (!farmer) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 min-h-[70vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-md text-center space-y-4">
          <ShieldCheck size={48} className="text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Profile Found</h3>
          <p className="text-xs text-slate-500">
            Please register your farm profile to view this page.
          </p>
          <Link
            href="/onboarding"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition"
          >
            Register Profile
          </Link>
        </div>
      </div>
    );
  }

  const farm = farmer.farms[0];
  const crop = farm?.crops[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800">Farm Profile Settings</h2>
          <p className="text-xs text-slate-500">
            Manage your land configuration, crop history, and personal preferences.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl"
        >
          ← Go to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{farmer.name}</h4>
                <p className="text-xs text-slate-400">{farmer.phone}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Landmark size={16} className="text-slate-400" />
                <span>{farmer.landSizeAcres} Acres ({farmer.category})</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sprout size={16} className="text-emerald-500" />
                <span>Primary Crop: <strong className="text-slate-800">{crop?.cropName || 'None'}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Languages size={16} className="text-slate-400" />
                <span>Language: <strong className="uppercase">{farmer.preferredLanguage}</strong></span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                <ShieldCheck size={12} />
                <span>Data Consent Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form Column */}
        <div className="md:col-span-2">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <ProfileForm farmer={farmer} />
          </div>
        </div>
      </div>
    </div>
  );
}
