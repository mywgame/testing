/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-100 flex space-x-6 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-4 text-xs font-bold font-mono uppercase tracking-wider relative cursor-pointer focus:outline-none transition-colors duration-150 ${
              isActive ? 'text-blue-600 font-extrabold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

interface AccordionItemProps {
  id: string;
  question: string;
  answer: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`border rounded-[24px] sm:rounded-[32px] transition-all duration-300 overflow-hidden ${
        isOpen
          ? 'border-blue-500/30 bg-blue-50/10 shadow-xs'
          : 'border-gray-100 bg-gray-50/30 hover:bg-gray-50/60 hover:border-blue-100/80'
      }`}
      role="listitem"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-6 py-5 text-left flex items-center justify-between space-x-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="flex items-center space-x-3.5 text-left">
          <HelpCircle className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className="font-display font-semibold text-gray-950 text-xs sm:text-sm tracking-wide leading-snug">
            {question}
          </span>
        </div>
        <div className={`w-6 h-6 rounded-lg bg-white border border-gray-100 text-gray-400 flex items-center justify-center transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600 border-blue-100 bg-blue-50/30' : ''}`}>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 pt-1 border-t border-gray-50/80 text-xs sm:text-sm text-gray-500 leading-relaxed font-sans text-left">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Accordion: React.FC<{ items: AccordionItemProps[]; className?: string }> = ({
  items,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`} role="list">
      {items.map((item) => (
        <AccordionItem key={item.id} {...item} />
      ))}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between border-t border-gray-50 pt-4 px-4 ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
        <div>
          <p className="text-xs text-gray-500">
            Showing page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-900">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-xs -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-200 bg-white text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4.5 py-2 border text-xs font-bold cursor-pointer ${
                    isActive
                      ? 'z-10 bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-200 bg-white text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[]; onNavigate?: (href: string) => void; className?: string }> = ({
  items,
  onNavigate,
  className = '',
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs font-semibold text-gray-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1 flex-shrink-0" />}
              {isLast || !item.href ? (
                <span className="text-gray-900 font-bold">{item.label}</span>
              ) : (
                <button
                  onClick={() => onNavigate && item.href && onNavigate(item.href)}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
