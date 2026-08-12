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
  const { t } = useTheme();
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
    <div className={`p-5 rounded-3xl border ${t.card} space-y-5 relative overflow-hidden text-left`} id="support-ticket-form">
      <div className="space-y-1">
        <h3 className={`text-base font-bold font-sans tracking-tight ${t.text}`}>
          Create Support Request
        </h3>
        <p className={`text-xs ${t.textSub}`}>
          Select a category and describe your inquiry below. Our team is available 24/7.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start space-x-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>
        )}

        {/* Category Selection as compact wrap-around chips */}
        <div className="space-y-1.5">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['DEPOSIT', 'WITHDRAWAL', 'VIP', 'ACCOUNT', 'OTHER'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-1.5 px-3 text-[11px] font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                  category === cat
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold'
                    : t.isDark
                    ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-black/5 border-black/5 text-gray-600 hover:bg-black/10'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input with Integrated Attachment Icon */}
        <div className="space-y-1.5">
          <label htmlFor="message-input" className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
            Message details <span className="text-red-500">*</span>
          </label>

          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${t.inset} ${
            t.isDark
              ? 'border-white/5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30'
              : 'border-black/5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20'
          }`}>
            <textarea
              id="message-input"
              required
              rows={4}
              placeholder="Describe your issue with transaction hashes or active wallet details if applicable..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-4 pt-3 pb-2 text-sm bg-transparent outline-none border-0 ${t.text} placeholder-gray-500 dark:placeholder-gray-500 resize-none`}
            />

            <div className={`flex items-center justify-between px-4 py-2 border-t ${t.sep}`}>
              {/* Paperclip Action & attachment name */}
              <div className="flex items-center space-x-2 min-w-0 mr-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all duration-200 flex items-center justify-center cursor-pointer`}
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
                    <FileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className={`text-xs font-mono font-medium truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[240px] text-cyan-600 dark:text-cyan-400`}>
                      {attachment.name}
                    </span>
                    <span className={`text-[10px] shrink-0 ${t.textMuted}`}>
                      ({(attachment.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <span className={`text-[10px] truncate ${t.textMuted}`}>
                    Attach JPG, PNG, PDF (Max 2MB)
                  </span>
                )}
              </div>

              {attachment && (
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 dark:text-gray-300 transition-colors cursor-pointer shrink-0"
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
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
            isSubmitting || !description.trim()
              ? 'bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-black/5 dark:border-white/5 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-600 text-black shadow-lg shadow-cyan-500/10 active:scale-[0.99]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
