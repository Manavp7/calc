'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Building, Mail, Phone, ChevronRight, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import { countryCodes } from '@/lib/countryCodes';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { clientName: string; companyName: string; email: string; phone: string }) => void;
    variant?: 'modal' | 'inline';
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, variant = 'modal' }: LeadCaptureModalProps) {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [formData, setFormData] = useState({
        clientName: '',
        companyName: '',
        email: '',
        countryCode: countryCodes[0].dial_code,
        phone: '',
    });
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // ... validation and handlers ...
    const validateDetails = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.clientName.trim()) newErrors.clientName = 'Name is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateDetails()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            if (res.ok) {
                setStep('otp');
                setErrors({});
            } else {
                const data = await res.json();
                setErrors({ submit: data.error || 'Failed to send OTP' });
            }
        } catch (error) {
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim() || otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            if (res.ok) {
                // Combine country code and phone for submission
                const fullPhone = `${formData.countryCode} ${formData.phone}`;
                onSubmit({ ...formData, phone: fullPhone });
            } else {
                const data = await res.json();
                setErrors({ otp: data.error || 'Invalid OTP' });
            }
        } catch (error) {
            setErrors({ otp: 'Verification failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const Content = (
        <motion.div
            key="content"
            initial={variant === 'modal' ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={variant === 'modal' ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 0, y: -20 }}
            className={variant === 'modal' ? "fixed inset-0 z-[101] flex items-center justify-center p-4" : "w-full max-w-lg mx-auto relative"}
        >
            <div className={`glass rounded-3xl p-8 w-full relative overflow-hidden ring-1 ring-white/10 ${variant === 'modal' ? 'max-w-lg shadow-2xl' : 'shadow-xl'}`}>
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -z-10" />

                <div className="flex flex-col items-center justify-center mb-8 text-center bg-transparent">
                    <div className="w-full relative">
                        <h2 className="text-3xl font-bold gradient-text mb-2">
                            {step === 'details' ? 'Unlock Your Estimate' : 'Verify Your Email'}
                        </h2>
                        <p className="text-gray-400">
                            {step === 'details'
                                ? 'Enter your details to see the full breakdown.'
                                : `We sent a code to ${formData.email}`}
                        </p>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute -top-2 -right-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {step === 'details' ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className={`w-full bg-white/10 border ${errors.clientName ? 'border-red-500' : 'border-white/20'} rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-gray-400`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.clientName && <p className="text-red-400 text-xs ml-1 mt-1">{errors.clientName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className={`w-full bg-white/10 border ${errors.companyName ? 'border-red-500' : 'border-white/20'} rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-gray-400`}
                                    placeholder="Acme Inc."
                                />
                            </div>
                            {errors.companyName && <p className="text-red-400 text-xs ml-1 mt-1">{errors.companyName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-gray-400`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs ml-1 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Phone Number</label>
                            <div className="relative flex gap-2">
                                <div className="relative w-1/3">
                                    <select
                                        value={formData.countryCode}
                                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                        className="w-full h-full bg-white/10 border border-white/20 rounded-xl px-3 text-white appearance-none focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                                    >
                                        {countryCodes.map((country) => (
                                            <option key={country.code} value={country.dial_code} className="bg-gray-900 text-white">
                                                {country.flag} {country.dial_code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full bg-white/10 border ${errors.phone ? 'border-red-500' : 'border-white/20'} rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-gray-400`}
                                        placeholder="0000000000"
                                    />
                                </div>
                            </div>
                            {errors.phone && <p className="text-red-400 text-xs ml-1 mt-1">{errors.phone}</p>}
                        </div>

                        {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? 'Sending Code...' : 'Continue'}
                            {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Enter Verification Code</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    className={`w-full bg-white/10 border ${errors.otp ? 'border-red-500' : 'border-white/20'} rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-primary-500 transition-colors text-center tracking-widest text-2xl font-bold placeholder:text-gray-400`}
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>
                            {errors.otp && <p className="text-red-400 text-xs ml-1 mt-1">{errors.otp}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Unlock Estimate'}
                            {!isLoading && <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('details')}
                            className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                        >
                            Change details
                        </button>
                    </form>
                )}
            </div>
        </motion.div>
    );

    if (variant === 'inline') {
        return Content;
    }

    // Portal for modal variant
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    {Content}
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
