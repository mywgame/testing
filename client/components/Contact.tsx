import React, { useState } from 'react';
import { Mail, Clock, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import { contactDetails } from '../utils/landingData.ts';

const EASE = [0.16, 1, 0.3, 1] as const;

export const Contact: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && message.trim()) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 3500);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5 relative overflow-hidden">
      {/* Premium glowing background gradients */}
      <div
        className="pointer-events-none absolute -inset-[40%] opacity-40 z-0"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(233,30,140,0.18), transparent 55%), radial-gradient(circle at 75% 70%, rgba(21,101,240,0.22), transparent 55%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Thesis Pitch & Directory */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-xs font-mono text-brand-cyan font-bold uppercase tracking-widest block">
                Establish Connection
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                Building a GPU farm, solar platform, or crypto prop firm?
              </h2>
              <p className="text-sm sm:text-base text-ink-300 leading-relaxed font-sans">
                Tell us about your utilization numbers, interconnection queue, PPA pipeline, or algorithmic trading track record — not your pitch deck. Our operators are standing by 24/7.
              </p>
            </div>

            {/* List Details Card */}
            <div className="glass-panel p-6 bg-white/[0.01] border border-white/5 space-y-6">
              
              {/* Working Hours */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-brand-cyan shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase block tracking-wider">Support Desk Hours</span>
                  <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {contactDetails.workingHours}
                  </p>
                </div>
              </div>

              {/* Support Email */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-brand-magenta-light shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase block tracking-wider">General & Technical Support</span>
                  <a href={`mailto:${contactDetails.supportEmail}`} className="text-xs sm:text-sm font-bold text-brand-cyan hover:underline leading-tight block">
                    {contactDetails.supportEmail}
                  </a>
                </div>
              </div>

              {/* Business Mail */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-brand-cyan shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase block tracking-wider">Institutional Partnerships</span>
                  <a href={`mailto:${contactDetails.businessEmail}`} className="text-xs sm:text-sm font-bold text-brand-cyan hover:underline leading-tight block">
                    {contactDetails.businessEmail}
                  </a>
                </div>
              </div>

              {/* Secure Hotline */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-brand-cyan shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase block tracking-wider">Secure Hotline Desk</span>
                  <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {contactDetails.phonePlaceholder}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-brand-cyan shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase block tracking-wider">Corporate Office Locations</span>
                  <p className="text-xs sm:text-sm font-bold text-white leading-tight font-sans">
                    {contactDetails.officeLocationPlaceholder}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Visual Inquiry Form */}
          <div className="lg:col-span-7 glass-panel p-8 bg-white/[0.01] border border-white/5 text-left w-full relative">
            <h3 className="font-display font-extrabold text-white text-lg sm:text-xl mb-2">Corporate Inquiry Portal</h3>
            <p className="text-xs sm:text-sm text-ink-300 mb-6 font-sans">
              Submit your specific asset constraints or interconnection plans below to initiate secure communications.
            </p>

            {formSubmitted ? (
              <div className="py-12 px-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">Inquiry Transmitted Successfully</h4>
                <p className="text-xs sm:text-sm text-ink-300 max-w-sm mx-auto leading-relaxed font-sans">
                  We have registered your ticket under a secure hashing envelope. A priority partner manager will email you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6" id="contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider block">Representative Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexander Mercer"
                      className="w-full bg-white/[0.02] border border-white/5 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-ink-500 transition-all font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mercer@capstone-funds.com"
                      className="w-full bg-white/[0.02] border border-white/5 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-ink-500 transition-all font-sans"
                      required
                    />
                  </div>
                  
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider block">Specific Inquiry Details</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details on target investment scale, regional capacity plans, or interconnection dates..."
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-ink-500 transition-all font-sans resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gradient hover:shadow-[0_12px_30px_-10px_rgba(233,30,140,0.45)] text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Transmit Encrypted Inquiry</span>
                  <Send className="w-4 h-4" />
                </button>

                {/* Secure communication tag */}
                <div className="flex items-center justify-center space-x-2 text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider pt-2 border-t border-white/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Communications are fully encrypted and confidential.</span>
                </div>
              </form>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
