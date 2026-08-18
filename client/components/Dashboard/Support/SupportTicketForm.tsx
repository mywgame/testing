/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Paperclip, FileText, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';

interface SupportTicketFormProps {
  onSubmit: (ticketData: {
    subject: string;
    description: string;
    category: 'DEPOSIT' | 'WITHDRAWAL' | 'VIP' | 'ACCOUNT' | 'OTHER';
    attachment?: File;
  }) => void;
  isSubmitting: boolean;
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ onSubmit, isSubmitting }) => {
  const { isDark } = useTheme();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'VIP' | 'ACCOUNT' | 'OTHER'>('DEPOSIT');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Validation Rules
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  const validateAndSetFile = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file format. Please upload JPG, JPEG, PNG, or PDF files only.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 2 MB limit. Please choose a smaller file.');
      return false;
    }

    setAttachment(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please fill in your message details.');
      return;
    }

    // Auto-generate subject for compatibility with database representation
    const categoryLabel = category.charAt(0) + category.slice(1).toLowerCase();
    const snippet = description.trim().substring(0, 40);
    const suffix = description.trim().length > 40 ? '...' : '';
    const autoSubject = `${categoryLabel} Assistance - "${snippet}${suffix}"`;

    onSubmit({
      subject: autoSubject,
      description: description.trim(),
      category,
      attachment: attachment || undefined,
    });

    // Reset Form
    setDescription('');
    setCategory('DEPOSIT');
    setAttachment(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl text-left ${
        isDark
          ? 'bg-[#10142e]/95 border-purple-500/20 shadow-purple-950/40'
          : 'bg-white border-purple-100 shadow-purple-900/10'
      }`}
      id="support-ticket-form"
    >
      <div className="space-y-1">
        <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Create Support Request
        </h3>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Select a category and describe your inquiry below. Our team is available 24/7.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {error && (
          <div className="flex items-start space-x-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>
        )}

        {/* Category Selection as compact wrap-around chips */}
        <div className="space-y-1.5">
          <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['DEPOSIT', 'WITHDRAWAL', 'VIP', 'ACCOUNT', 'OTHER'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-1.5 px-3.5 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer ${
                  category === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-md shadow-purple-900/30'
                    : isDark
                    ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-purple-500/30'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input with Integrated Attachment Icon */}
        <div className="space-y-1.5">
          <label htmlFor="message-input" className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Message details <span className="text-purple-400">*</span>
          </label>

          <div
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isDark
                ? 'bg-[#0a0d24] border-white/10 focus-within:border-purple-400/80 focus-within:ring-1 focus-within:ring-purple-500/20'
                : 'bg-slate-50 border-slate-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/20 focus-within:bg-white'
            }`}
          >
            <textarea
              id="message-input"
              required
              rows={4}
              placeholder="Describe your issue with transaction hashes or active wallet details if applicable..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-4 pt-3.5 pb-2 text-sm bg-transparent outline-none border-0 ${
                isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
              } resize-none`}
            />

            <div
              className={`flex items-center justify-between px-4 py-2.5 border-t ${
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'
              }`}
            >
              {/* Paperclip Action & attachment name */}
              <div className="flex items-center space-x-2 min-w-0 mr-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-purple-300 hover:bg-white/10'
                      : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  title="Attach screenshot or PDF (Max 2MB)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {attachment ? (
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-xs font-mono font-medium truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[240px] text-purple-400">
                      {attachment.name}
                    </span>
                    <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      ({(attachment.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <span className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Attach JPG, PNG, PDF (Max 2MB)
                  </span>
                )}
              </div>

              {attachment && (
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
            isSubmitting || !description.trim()
              ? isDark
                ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-[0.99]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting Support Request...</span>
            </>
          ) : (
            <>
              <span>Submit Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
