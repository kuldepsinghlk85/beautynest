'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-brand-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
            WE ARE HERE FOR YOU
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Get in Touch with BeautyNest
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Have questions about doorstep bookings, packages, or joining as a certified beautician?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-5">
              <h3 className="text-lg font-serif font-bold text-gray-900">
                Lucknow Operational Office
              </h3>
              
              <div className="flex items-start gap-3 text-xs text-gray-700">
                <MapPin className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 mb-0.5">Headquarters</strong>
                  B-34, Kapoorthala Chauraha, Sector L, Aliganj, Lucknow, UP – 226024
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-gray-700">
                <Phone className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 mb-0.5">Phone Support</strong>
                  +91 98765 43210 (Mon - Sun, 8:00 AM - 9:00 PM)
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-gray-700">
                <Mail className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 mb-0.5">Email Inquiries</strong>
                  care@beautynest.in / partner@beautynest.in
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action */}
            <a
              href="https://wa.me/919876543210?text=Hi%20BeautyNest,%20I%20would%20like%20to%20know%20more%20about%20your%20doorstep%20services"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Chat on WhatsApp</h4>
                  <p className="text-[11px] text-emerald-700">Instant answers from our customer concierge</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full">
                Chat Now
              </span>
            </a>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Our support team usually replies in under 15 minutes during salon hours.
              </p>

              {submitted ? (
                <div className="p-8 text-center space-y-3 bg-pink-50 rounded-2xl border border-pink-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Message Received!</h4>
                  <p className="text-xs text-gray-600">
                    Thank you for reaching out. Our Lucknow concierge representative will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-4 py-2.5 text-xs bg-brand-bg/50 border border-pink-200 rounded-xl outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (+91)</label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        className="w-full px-4 py-2.5 text-xs bg-brand-bg/50 border border-pink-200 rounded-xl outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Area in Lucknow</label>
                    <input
                      type="text"
                      placeholder="e.g. Aliganj / Gomti Nagar / Indira Nagar"
                      className="w-full px-4 py-2.5 text-xs bg-brand-bg/50 border border-pink-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Message or Query</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us what service you are interested in or your question..."
                      className="w-full p-3 text-xs bg-brand-bg/50 border border-pink-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3 rounded-full font-bold text-xs shadow-pink-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
