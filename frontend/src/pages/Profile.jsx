import { useState } from 'react';
import {
  User, Shield, Key, Mail, Building, MapPin, CheckCircle2,
  Lock, Users, Clock, Edit2, ShieldAlert
} from 'lucide-react';

const teamMembers = [
  { name: 'Sahul S.', role: 'Lead Risk Analyst & Data Scientist', email: 'sahul.analyst@ibm-risk.ai', status: 'Online', badge: 'Admin' },
  { name: 'Dr. Elena Rostova', role: 'Principal Demographer', email: 'elena.rostova@census-research.org', status: 'Active', badge: 'Reviewer' },
  { name: 'Marcus Chen', role: 'ML Infrastructure Engineer', email: 'marcus.chen@analytics-hub.io', status: 'Offline', badge: 'Editor' },
];

const permissions = [
  { name: 'Raw IPUMS Microdata Access', desc: 'Query and export anonymized census microdata records', level: 'Full Access' },
  { name: 'Model Retraining & Triggering', desc: 'Trigger Logistic Regression pipeline execution & hyperparameter sweeps', level: 'Full Access' },
  { name: 'Threshold Sensitivity Tuning', desc: 'Modify high-risk probability classification cutoffs', level: 'Full Access' },
  { name: 'CSV & Executive Report Export', desc: 'Generate and download state-level and individual prediction sheets', level: 'Full Access' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-indigo-400" />
            Analyst Profile & Role-Based Access
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage user credentials, security authorizations, team collaborators, and audit history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="admin-card p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-xl">
              SS
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Sahul S.</h2>
            <p className="text-xs font-medium text-indigo-400">Lead Risk Analyst & Data Scientist</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Role: System Administrator (RBAC L4)
            </span>
          </div>

          <div className="w-full pt-4 border-t space-y-2.5 text-xs text-left" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Mail size={14} className="text-gray-400" />
              <span>sahul.analyst@ibm-risk.ai</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Building size={14} className="text-gray-400" />
              <span>IBM Migration Risk Intelligence Lab</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <MapPin size={14} className="text-gray-400" />
              <span>United States / India Cohort</span>
            </div>
          </div>
        </div>

        {/* Permissions & Security Matrix */}
        <div className="admin-card p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              <h3 className="section-title">Security Permissions & Access Control</h3>
            </div>
            <span className="badge badge-low">Active Session</span>
          </div>

          <div className="space-y-3">
            {permissions.map((perm, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border flex items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{perm.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{perm.desc}</p>
                </div>
                <span className="badge badge-indigo flex-shrink-0 text-[10px]">
                  {perm.level}
                </span>
              </div>
            ))}
          </div>

          {/* Team Collaborators */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={14} /> Team & Collaboration Roster
            </h4>
            <div className="space-y-2">
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <div>
                    <span className="font-bold text-white block">{member.name}</span>
                    <span className="text-[11px] text-gray-400">{member.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral text-[10px]">{member.badge}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
