import React, { useState } from 'react';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import barangaysData from '../../Dummy/data/barangays.json';
import { Send, FileText, Users, MapPin, Sparkles, MessageSquare } from 'lucide-react';

const SMS_TEMPLATES = [
  {
    title: 'Pension Distribution Notice',
    text: 'Magandang araw [name]! Nais naming ipaalala na ang pamamahagi ng inyong Social Pension para sa buwang ito ay gaganapin sa [barangay] Barangay Hall sa darating na Hulyo 25, 2026, 9:00 AM. Magdala ng inyong OSCA ID at sariling ballpen. Salamat mula sa LGU Juban MSWDO.'
  },
  {
    title: 'Quarterly Medicine Subsidy Notice',
    text: 'Magandang araw [name]! May libreng Hypertension maintenance medicine subsidy na ipamamahagi sa [barangay] Barangay Hall o Health Center sa Martes, Hulyo 21, 2026. Mangyaring pumunta para makuha ang inyong quarterly supply. Salamat mula sa Juban Municipal Health Office.'
  },
  {
    title: 'ID Card Approved & Ready',
    text: 'Magandang araw [name]! Ang inyong aplikasyon para sa Senior Citizen ID ay APRUBADO na. Maaari ninyong makuha ang inyong physical NFC ID card sa OSCA Office, Juban Municipal Hall simula Lunes. Magdala ng kopya ng inyong registration form. Salamat!'
  },
  {
    title: 'LGU Birthday Cash Voucher Notice',
    text: 'Magandang araw [name]! Ang inyong Barangay Birthday Cash Voucher na nagkakahalagang Php 500.00 ay maaari niyo nang i-claim sa inyong barangay hall simula bukas. Maligayang Kaarawan! Mula sa [barangay] Barangay Council.'
  }
];

export default function SMSComposer() {
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
      showToast('Walang isinulat na mensahe.', 'error');
      return;
    }
    if (!currentUser) return;

    setIsSending(true);

    try {
      if (recipientType === 'individual') {
        const targetSenior = seniors.find((s) => s.id === selectedSeniorId);
        if (!targetSenior) {
          showToast('Mangyaring pumili ng senior citizen recipient.', 'error');
          setIsSending(false);
          return;
        }

        if (!targetSenior.contactNumber) {
          showToast(`Walang mobile contact number si ${targetSenior.firstName}.`, 'error');
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
          showToast(`SMS matagumpay na naipadala kay ${targetSenior.firstName}!`, 'success');
          setSelectedSeniorId('');
          setMessage('');
        }
      } else {
        // Barangay or All batch SMS
        const targetBrgyName = recipientType === 'all' ? 'All' : selectedBarangay;
        const count = await sendBatchSMS(targetBrgyName, message, currentUser.fullName);
        
        if (count > 0) {
          showToast(`Broadcast sent! Matagumpay na naikalat ang SMS sa ${count} na Senior Citizens.`, 'success');
          setMessage('');
        } else {
          showToast('Walang nahanap na valid recipient na may contact number sa barangay na pinili.', 'warning');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Nagkaroon ng aberya sa pagsend ng SMS.', 'error');
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
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pumili ng Recipient (Receivers)</label>
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
                <span>Isang Senior</span>
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
                <span>Lahat (Bulk)</span>
              </button>
            </div>
          </div>

          {/* Contextual Recipient Selectors */}
          {recipientType === 'individual' && (
            <div className="space-y-2">
              <label htmlFor="senior-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pumili ng Senior Citizen</label>
              <select
                id="senior-select"
                value={selectedSeniorId}
                onChange={(e) => setSelectedSeniorId(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">-- Pumili mula sa rehistro --</option>
                {seniorsWithContact.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.contactNumber} - {s.barangay})
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === 'barangay' && (
            <div className="space-y-2 animate-fadeIn">
              <label htmlFor="barangay-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pumili ng Barangay</label>
              <select
                id="barangay-select"
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="All">Lahat ng Barangay (LGU Juban)</option>
                {barangaysData.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} (Est. {b.seniorCount} seniors)
                  </option>
                ))}
              </select>
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
              placeholder="Isulat dito ang mensahe... Pwede gumamit ng [name] at [barangay] tokens para sa auto-replace."
              rows={6}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
            <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed">
              💡 <strong>Tagubilin:</strong> Ang variables na <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">[name]</code> at <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">[barangay]</code> ay kusa na naming papalitan ng pangalan at tirahan ng senior bago i-send.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-xs font-bold text-white rounded-xl shadow-lg shadow-teal-600/10 transition-all duration-150 active:scale-98 flex items-center justify-center gap-2"
          >
            <Send size={13} className={isSending ? 'animate-bounce' : ''} />
            <span>{isSending ? 'Ipinapadala ang mga SMS (Sending...)' : 'Ipadala ang Mensahe (Send Broadcast)'}</span>
          </button>
        </form>
      </div>

      {/* Templates Library panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-teal-600">
            <FileText size={16} />
            <h4 className="font-bold text-xs uppercase tracking-wide text-teal-700">LGU Preset Templates</h4>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Official communication presets for quick layouts selection</p>
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
