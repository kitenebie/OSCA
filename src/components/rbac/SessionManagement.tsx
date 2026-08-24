import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { sessionService, UserSession } from '../../services/sessionService';
import { auditLogsService } from '../../services/supabaseService';
import {
  Shield,
  RefreshCw,
  LogOut,
  Monitor,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Trash2,
  Search,
  Activity,
  Globe,
  MapPin,
  Laptop,
} from 'lucide-react';

interface SessionWithUser extends UserSession {
  userName?: string;
  userRole?: string;
}

export default function SessionManagement() {
  const { users, currentUser, sessionToken } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  const [sessions, setSessions] = useState<SessionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmTerminate, setConfirmTerminate] = useState<string | null>(null);

  // Fetch all active sessions
  const fetchSessions = async (showRefreshFeedback = false) => {
    if (showRefreshFeedback) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const activeSessions = await sessionService.getAllActiveSessions();

      // Enrich sessions with user info
      const enriched: SessionWithUser[] = activeSessions.map((session) => {
        const user = users.find((u) => u.id === session.userId);
        return {
          ...session,
          userName: user?.fullName || 'Unknown User',
          userRole: user?.role || 'unknown',
        };
      });

      setSessions(enriched);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      showToast('Failed to load active sessions.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [users]);

  // Force-terminate a session
  const handleTerminateSession = async (session: SessionWithUser) => {
    // Prevent terminating own session
    if (session.sessionToken === sessionToken) {
      showToast('You cannot terminate your own active session from here. Use the Logout button instead.', 'warning');
      setConfirmTerminate(null);
      return;
    }

    try {
      const success = await sessionService.forceTerminateSession(session.id, currentUser?.fullName || 'Admin');
      if (success) {
        showToast(`Session for "${session.userName}" has been terminated.`, 'success');
        setSessions((prev) => prev.filter((s) => s.id !== session.id));

        // Audit log: admin force-terminated a session
        auditLogsService.log({
          action: 'SESSION_TERMINATE',
          entity: 'Session',
          details: `Admin force-terminated session for: ${session.userName} (${session.userRole}) | Device: ${session.deviceName || 'N/A'} | IP: ${session.ipAddress || 'N/A'}`,
          actorName: currentUser?.fullName || 'Admin',
          actorRole: currentUser?.role || 'super-admin',
          barangay: '',
          severity: 'danger',
        });
      } else {
        showToast('Failed to terminate session.', 'error');
      }
    } catch {
      showToast('Error terminating session.', 'error');
    }
    setConfirmTerminate(null);
  };

  // Terminate all sessions except own
  const handleTerminateAll = async () => {
    const otherSessions = sessions.filter((s) => s.sessionToken !== sessionToken);
    if (otherSessions.length === 0) {
      showToast('No other active sessions to terminate.', 'info');
      return;
    }

    let terminated = 0;
    for (const session of otherSessions) {
      const success = await sessionService.forceTerminateSession(session.id, currentUser?.fullName || 'Admin');
      if (success) terminated++;
    }

    showToast(`Terminated ${terminated} session(s). Only your session remains active.`, 'success');

    // Audit log: bulk terminate
    if (terminated > 0) {
      auditLogsService.log({
        action: 'SESSION_TERMINATE_ALL',
        entity: 'Session',
        details: `Admin bulk-terminated ${terminated} active session(s)`,
        actorName: currentUser?.fullName || 'Admin',
        actorRole: currentUser?.role || 'super-admin',
        barangay: '',
        severity: 'danger',
      });
    }
    fetchSessions(true);
  };

  // Filter sessions by search (now includes device name, IP, location)
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.userName?.toLowerCase().includes(q) ||
      s.userRole?.toLowerCase().includes(q) ||
      s.userId.toLowerCase().includes(q) ||
      s.deviceName?.toLowerCase().includes(q) ||
      s.ipAddress?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q)
    );
  });

  // Time formatting
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m remaining`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m remaining`;
  };

  const getExpiryColor = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const minsLeft = (expiry.getTime() - now.getTime()) / 60000;
    if (minsLeft <= 0) return 'text-red-500 bg-red-50 border-red-100';
    if (minsLeft <= 10) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'brgy-admin':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'encoder':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="text-teal-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading active sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Active Sessions</h3>
            <p className="text-[11px] text-slate-400">
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''} across all users
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSessions(true)}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleTerminateAll}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-red-100"
          >
            <Trash2 size={13} />
            Terminate All Others
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, role, device, IP, or location..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all"
        />
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <WifiOff size={20} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 font-medium">No active sessions found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try a different search term.' : 'All sessions have expired or been terminated.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSessions.map((session) => {
            const isOwnSession = session.sessionToken === sessionToken;
            return (
              <div
                key={session.id}
                className={`relative bg-white border rounded-2xl p-4 transition-all hover:shadow-sm ${
                  isOwnSession
                    ? 'border-teal-200 bg-teal-50/30 ring-1 ring-teal-100'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                  {/* Left: User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isOwnSession ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <User size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {session.userName}
                        </p>
                        {isOwnSession && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            <Wifi size={9} />
                            You
                          </span>
                        )}
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${getRoleBadge(session.userRole)}`}>
                          {session.userRole?.replace('-', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          Login: {formatTime(session.createdAt)}
                        </span>
                        {session.rememberMe && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <CheckCircle size={10} />
                            Remember Me
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Expiry + Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Expiry Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${getExpiryColor(session.expiresAt)}`}>
                      <Activity size={10} />
                      {getTimeRemaining(session.expiresAt)}
                    </span>

                    {/* Terminate Button */}
                    {!isOwnSession && (
                      <>
                        {confirmTerminate === session.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTerminateSession(session)}
                              className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold rounded-lg transition-all"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmTerminate(null)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmTerminate(session.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all border border-red-100 hover:border-red-200"
                            title="Force terminate session"
                          >
                            <LogOut size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Device Info Row */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Device/PC Name */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
                      <Laptop size={12} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Device</p>
                        <p className="text-[11px] text-slate-700 font-medium truncate">
                          {session.deviceName || 'Unknown device'}
                        </p>
                      </div>
                    </div>

                    {/* IP Address */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
                      <Globe size={12} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">IP Address</p>
                        <p className="text-[11px] text-slate-700 font-medium font-mono truncate">
                          {session.ipAddress || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Location</p>
                        <p className="text-[11px] text-slate-700 font-medium truncate">
                          {session.location || 'Unknown location'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session ID (subtle) */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-300 font-mono">
                  <span>SID: {session.id.slice(0, 8)}...{session.id.slice(-4)}</span>
                  <span>Last Activity: {formatTime(session.lastActivity)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-700 leading-relaxed">
          <strong>Note:</strong> Terminating a session will immediately log out the user on their next activity check (within 30 seconds).
          Sessions with "Remember Me" enabled will automatically re-authenticate unless the refresh token has also expired (30-day limit).
          Device info is captured at login time and may not reflect current location if the user has moved.
        </div>
      </div>
    </div>
  );
}
