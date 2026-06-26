import React from 'react';

const Profile = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Profile Settings</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input type="text" defaultValue="+1 555-0199" className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input type="email" defaultValue="john.doe@example.com" disabled className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 text-slate-500 cursor-not-allowed" />
          </div>
        </div>
        <button onClick={() => alert("Profile updated")} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-bold transition-all">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Profile;
