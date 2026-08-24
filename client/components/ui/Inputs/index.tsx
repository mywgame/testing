/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Search, ChevronDown } from 'lucide-react';

export interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseInputProps {}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-wide mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-4 py-3 text-sm font-medium border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-150 ${
          error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] font-semibold text-red-600 font-sans">{error}</p>}
      {!error && helperText && <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans font-medium">{helperText}</p>}
    </div>
  );
};

export const PasswordInput: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 text-left w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-wide mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full pl-4 pr-11 py-3 text-sm font-medium border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-150 ${
            error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded p-1"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[10px] font-semibold text-red-600 font-sans">{error}</p>}
      {!error && helperText && <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans font-medium">{helperText}</p>}
    </div>
  );
};

export const SearchInput: React.FC<InputProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        className={`w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150 ${className}`}
        {...props}
      />
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-wide mb-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-4 py-3 text-sm font-medium border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-all duration-150 ${
          error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] font-semibold text-red-600 font-sans">{error}</p>}
      {!error && helperText && <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans font-medium">{helperText}</p>}
    </div>
  );
};

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex items-start space-x-2.5 text-left">
      <input
        type="checkbox"
        id={id}
        className={`mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-white/20 focus:ring-blue-500 bg-gray-50 dark:bg-white/10 ${className}`}
        {...props}
      />
      <label htmlFor={id} className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex items-center space-x-2.5 text-left">
      <input
        type="radio"
        id={id}
        className={`w-4 h-4 text-blue-600 border-gray-300 dark:border-white/20 focus:ring-blue-500 bg-gray-50 dark:bg-white/10 ${className}`}
        {...props}
      />
      <label htmlFor={id} className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

export interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex items-center space-x-3 text-left">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={(e) => onChange && onChange(e as any)}
        className={`relative inline-flex h-5.5 w-10.5 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/20'
        } ${className}`}
        {...props}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 select-none">
          {label}
        </span>
      )}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="space-y-1.5 text-left w-full relative">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-wide mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full pl-4 pr-10 py-3 text-sm font-medium border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-[#101426] text-gray-900 dark:text-white appearance-none transition-all duration-150 ${
            error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#101426] text-gray-900 dark:text-white font-medium">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-[10px] font-semibold text-red-600 font-sans">{error}</p>}
      {!error && helperText && <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans font-medium">{helperText}</p>}
    </div>
  );
};

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute ${
              align === 'right' ? 'right-0' : 'left-0'
            } mt-2 w-56 rounded-2xl bg-white dark:bg-[#0c0d24] border border-gray-100 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 text-gray-900 dark:text-white`}
            role="menu"
          >
            <div className="py-1" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
