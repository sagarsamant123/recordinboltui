import React, { useState, useEffect } from 'react';
import { Portal } from './Portal';
import { X, Mail, User, MessageSquare } from 'lucide-react';

interface EmailRequestModalProps {
  sid: string;
  title: string;
  createdTime: string;
  onClose: () => void;
}

export const EmailRequestModal: React.FC<EmailRequestModalProps> = ({
  sid,
  title,
  createdTime,
  onClose
}) => {
  const [name, setName] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-written email content
  const emailSubject = "Recording Deletion Request";
  const preWrittenBody = `Recording Details:
- Title: ${title}
- Recording ID: ${sid}
- Created Time: ${createdTime}
- Request Date: ${new Date().toLocaleDateString()}

Dear Support Team,

I would like to request the deletion of the above recording.`;

  const closingText = `Thank you for your assistance.

Best regards`;

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Validate form
  const validateForm = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  // Handle form submission
  const handleSendEmail = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Compose the complete email body
      let completeBody = preWrittenBody;
      
      if (additionalMessage.trim()) {
        completeBody += `\n\nReason for deletion request:\n${additionalMessage.trim()}`;
      }
      
      completeBody += `\n\nRequested by: ${name.trim()}\n\n${closingText}`;

      // Create mailto URL
      const subject = encodeURIComponent(emailSubject);
      const body = encodeURIComponent(completeBody);
      const mailtoUrl = `mailto:ptimer60@gmail.com?subject=${subject}&body=${body}`;

      // Open email client
      window.open(mailtoUrl);
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden my-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recording Deletion Request</h2>
                <p className="text-sm text-gray-600">Review and send your deletion request</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {/* Email Preview Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 lg:max-h-80 overflow-y-auto">
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">To:</span>
                  <span className="ml-2 text-sm text-gray-900">ptimer60@gmail.com</span>
                </div>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Subject:</span>
                  <span className="ml-2 text-sm text-gray-900">{emailSubject}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {preWrittenBody}
                  </pre>
                  {additionalMessage.trim() && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason for deletion request:</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{additionalMessage}</p>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-800">
                      Requested by: {name.trim() || '[Your name will appear here]'}
                    </p>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans mt-2">
                      {closingText}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* User Input Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
              
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    nameError ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-600">{nameError}</p>
                )}
              </div>

              {/* Additional Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Additional Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y min-h-[100px]"
                  rows={3}
                  placeholder="Please provide any additional context or reason for the deletion request..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be included in the email to provide more context for your request.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};