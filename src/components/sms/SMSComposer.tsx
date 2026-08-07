import React, { useState, useRef, useEffect } from 'react';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { auditLogsService } from '../../services/supabaseService';
import { useBarangays } from '../../hooks/useBarangays';
import { Send, FileText, Users, MapPin, Sparkles, MessageSquare, Search, ChevronDown, X } from 'lucide-react';

/* ─── Searchable Select Component ─── */
interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function SearchableSelect({ id, options, value, onChange, placeholder = '-- Select --', required }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none flex items-center justify-between gap-2 text-left transition-all ${isOpen ? 'ring-1 ring-teal-500 border-teal-300' : ''}`}
      >
        <span className={selectedLabel ? 'text-slate-800' : 'text-slate-400'}>
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }}
              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Hidden native input for form required validation */}
      {required && <input type="text" value={value} required className="sr-only" tabIndex={-1} readOnly />}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search here..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400 text-[11px] font-medium">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-teal-50/60 ${
                    opt.value === value ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const SMS_TEMPLATES = [
  {
    title: 'Paalala sa Pamimigay ng Pension',
    text: 'Magandang araw [name]! Nais po naming ipaalala na ang pamimigay ng inyong Social Pension ngayong buwan ay gaganapin sa [barangay] Barangay Hall sa darating na Hulyo 25, 2026, 9:00 AM. Mangyaring dalhin ang inyong OSCA ID at sariling ballpen. Salamat po mula sa LGU Juban MSWDO.'
  },
  {
    title: 'Paalala sa Libreng Gamot (Quarterly)',
    text: 'Magandang araw [name]! May libreng maintenance medicine para sa Hypertension na ipamamahagi sa [barangay] Barangay Hall o Health Center sa Martes, Hulyo 21, 2026. Mangyaring pumunta upang makuha ang inyong quarterly supply. Salamat po mula sa Juban Municipal Health Office.'
  },
  {
    title: 'Aprubado na ang Senior Citizen ID',
    text: 'Magandang araw [name]! Ang inyong aplikasyon para sa Senior Citizen ID ay APRUBADO na. Maaari na po ninyong kunin ang inyong physical NFC ID card sa OSCA Office, Juban Municipal Hall simula Lunes. Mangyaring magdala ng kopya ng inyong registration form. Salamat po!'
  },
  {
    title: 'Paalala sa Birthday Cash Voucher',
    text: 'Magandang araw [name]! Ang inyong Barangay Birthday Cash Voucher na nagkakahalaga ng Php 500.00 ay maaari na po ninyong i-claim sa inyong barangay hall simula bukas. Maligayang Kaarawan po! Mula sa [barangay] Barangay Council.'
  }
];

export default function SMSComposer() {
  const { barangays: barangaysData } = useBarangays();
  const { seniors, sendSMS, sendBatchSMS } = useSeniorsStore();
  const { currentUser } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);

  const [recipientType, setRecipientType] = useState<'individual' | 'barangay' | 'all'>('individual');
  const [selectedSeniorId, setSelectedSeniorId] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- MOCK SMS GATEWAY API INTEGRATION ---
  /**
   * INTEGRATING REAL GATEWAYS (e.g., Semaphore.co, Twilio, Globe Labs):
   * 
   * To connect this composer to a real SMS Gateway:
   * 1. Create a server-side route `/api/sms/send`.
   * 2. Store your Semaphore API key securely in `.env` (without `VITE_` prefix).
   * 3. Send a POST request to Semaphore:
   *    fetch('https://api.semaphore.co/api/v4/messages', {
   *       method: 'POST',
   *       body: new URLSearchParams({
   *          apikey: process.env.SEMAPHORE_API_KEY,
   *          number: recipientPhone,
   *          message: parsedMessage,
   *          sendername: 'CARMONALGU'
   *       })
   *    });
   */

  const handleSelectTemplate = (templateText: string) => {
    setMessage(templateText);
    showToast('SMS template loaded! Tokens ([name], [barangay]) will parse dynamically on send.', 'info');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('No message entered.', 'error');
      return;
    }
    if (!currentUser) return;

    setIsSending(true);

    try {
      if (recipientType === 'individual') {
        const targetSenior = seniors.find((s) => s.id === selectedSeniorId);
        if (!targetSenior) {
          showToast('Please select a senior citizen recipient.', 'error');
          setIsSending(false);
          return;
        }

        if (!targetSenior.contactNumber) {
          showToast(`No mobile contact number for ${targetSenior.firstName}.`, 'error');
          setIsSending(false);
          return;
        }

        // Parse placeholders
        const parsedMessage = message
          .replace(/\[name\]/g, targetSenior.firstName)
          .replace(/\[barangay\]/g, targetSenior.barangay);

        const success = await sendSMS(
          `${targetSenior.firstName} ${targetSenior.lastName}`,
          targetSenior.contactNumber,
          targetSenior.barangay,
          parsedMessage,
          currentUser.fullName
        );

        if (success) {
          showToast(`SMS successfully sent to ${targetSenior.firstName}!`, 'success');

          // Notify all users
          auditLogsService.log({
            action: 'SMS',
            entity: 'SMS',
            details: `Nagpadala ng SMS kay ${targetSenior.firstName} ${targetSenior.lastName} (${targetSenior.barangay})`,
            actorName: currentUser?.fullName || 'System',
            actorRole: currentUser?.role || 'user',
            barangay: targetSenior.barangay,
            severity: 'info',
          });
          setSelectedSeniorId('');
          setMessage('');
        }
      } else {
        // Barangay or All batch SMS
        const targetBrgyName = recipientType === 'all' ? 'All' : selectedBarangay;
        const count = await sendBatchSMS(targetBrgyName, message, currentUser.fullName);
        
        if (count > 0) {
          showToast(`Broadcast sent! SMS successfully sent to ${count} Senior Citizens.`, 'success');

          // Notify all users
          auditLogsService.log({
            action: 'SMS',
            entity: 'SMS',
            details: `Nag-broadcast ng SMS sa ${count} Senior Citizens`,
            actorName: currentUser?.fullName || 'System',
            actorRole: currentUser?.role || 'user',
            severity: 'info',
          });
          setMessage('');
        } else {
          showToast('No valid recipients with contact numbers found in the selected barangay.', 'warning');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while sending the SMS.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Filter seniors who have contact numbers
  const seniorsWithContact = seniors.filter((s) => s.contactNumber);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Compose Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <form onSubmit={handleSend} className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm md:text-base">SMS Dispatch Composer</h4>
            <p className="text-[11px] text-slate-400">Select target receivers, load preset layouts, and trigger broadcasts</p>
          </div>

          {/* Select Recipient Categories */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Recipient (Receivers)</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRecipientType('individual')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all
                  ${recipientType === 'individual' 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Users size={13} />
                <span>Single Senior</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('barangay')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all
                  ${recipientType === 'barangay' 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'}`}
              >
                <MapPin size={13} />
                <span>Kada Barangay</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('all')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all
                  ${recipientType === 'all' 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Sparkles size={13} />
                <span>All (Bulk)</span>
              </button>
            </div>
          </div>

          {/* Contextual Recipient Selectors */}
          {recipientType === 'individual' && (
            <div className="space-y-2">
              <label htmlFor="senior-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Senior Citizen</label>
              <SearchableSelect
                id="senior-select"
                value={selectedSeniorId}
                onChange={(val) => setSelectedSeniorId(val)}
                placeholder="-- Select from registry --"
                required
                options={seniorsWithContact.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName} (${s.contactNumber} - ${s.barangay})`
                }))}
              />
            </div>
          )}

          {recipientType === 'barangay' && (
            <div className="space-y-2 animate-fadeIn">
              <label htmlFor="barangay-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Barangay</label>
              <SearchableSelect
                id="barangay-select"
                value={selectedBarangay}
                onChange={(val) => setSelectedBarangay(val)}
                placeholder="All Barangays (LGU Juban)"
                required
                options={[
                  { value: 'All', label: 'All Barangays (LGU Juban)' },
                  ...barangaysData.map((b) => ({
                    value: b.name,
                    label: `${b.name} (Est. ${b.seniorCount} seniors)`
                  }))
                ]}
              />
            </div>
          )}

          {/* Message Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="sms-message" className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nilalaman ng Mensahe (Message)</label>
              <span className={`text-[10px] font-mono font-bold ${message.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                {message.length} Characters ({Math.ceil(message.length / 160)} SMS parts)
              </span>
            </div>
            <textarea
              id="sms-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here... You can use [name] and [barangay] tokens for auto-replace."
              rows={6}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
            <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed">
              💡 <strong>Note:</strong> The variables <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">[name]</code> and <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">[barangay]</code> will be automatically replaced with the senior's name and address before sending.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-xs font-bold text-white rounded-xl shadow-lg shadow-teal-600/10 transition-all duration-150 active:scale-98 flex items-center justify-center gap-2"
          >
            <Send size={13} className={isSending ? 'animate-bounce' : ''} />
            <span>{isSending ? 'Sending SMS...' : 'Send Message (Send Broadcast)'}</span>
          </button>
        </form>
      </div>

      {/* Templates Library panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-teal-600">
            <FileText size={16} />
            <h4 className="font-bold text-xs uppercase tracking-wide text-teal-700">Mga Handa nang Sulat (LGU Preset)</h4>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Mga opisyal na template ng mensahe para sa mabilis na pagpili</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {SMS_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectTemplate(tpl.text)}
              className="w-full text-left p-3.5 bg-slate-50 hover:bg-teal-50/20 border border-slate-200/80 hover:border-teal-500/50 rounded-xl transition-all duration-150 group active:scale-99"
            >
              <div className="flex items-center gap-1.5 text-teal-600 group-hover:text-teal-700 transition-colors">
                <MessageSquare size={12} />
                <h5 className="font-bold text-[10.5px] truncate">{tpl.title}</h5>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal line-clamp-3 mt-1.5 font-sans italic">
                "{tpl.text}"
              </p>
              <span className="inline-block text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 mt-2.5 opacity-0 group-hover:opacity-100 transition-all">
                I-load ito (Load Template)
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
