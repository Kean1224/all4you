'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cell: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    capital: false,
    number: false,
    special: false,
    isValid: false
  });
  
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [idCopy, setIdCopy] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Password validation function
  const validatePassword = (pwd: string) => {
    const strength = {
      length: pwd.length >= 8,
      capital: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      isValid: false
    };
    
    strength.isValid = strength.length && strength.capital && strength.number && strength.special;
    return strength;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'password') {
      const strength = validatePassword(value as string);
      setPasswordStrength(strength);
    }
  };

  const handleFileUpload = (field: 'proofOfAddress' | 'idCopy', file: File | null) => {
    if (field === 'proofOfAddress') {
      setProofOfAddress(file);
    } else {
      setIdCopy(file);
    }
  };

  const validateStep1 = () => {
    const { name, email, cell, password, confirmPassword, termsAccepted } = formData;
    
    if (!name.trim()) {
      setStatus('❌ Please enter your full name.');
      return false;
    }
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('❌ Please enter a valid email address.');
      return false;
    }
    
    if (!cell.trim() || !/^[\d\s\-\+\(\)]{10,15}$/.test(cell.replace(/\s/g, ''))) {
      setStatus('❌ Please enter a valid phone number.');
      return false;
    }
    
    if (!passwordStrength.isValid) {
      setStatus('❌ Password must be at least 8 characters with uppercase, number, and special character.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setStatus('❌ Passwords do not match.');
      return false;
    }
    
    if (!termsAccepted) {
      setStatus('❌ Please accept the Terms & Conditions.');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!proofOfAddress) {
      setStatus('❌ Please upload your proof of address.');
      return false;
    }
    
    if (!idCopy) {
      setStatus('❌ Please upload your ID document.');
      return false;
    }
    
    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(proofOfAddress.type)) {
      setStatus('❌ Proof of address must be JPG, PNG, or PDF.');
      return false;
    }
    
    if (!allowedTypes.includes(idCopy.type)) {
      setStatus('❌ ID document must be JPG, PNG, or PDF.');
      return false;
    }
    
    // File size validation (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (proofOfAddress.size > maxSize || idCopy.size > maxSize) {
      setStatus('❌ Files must be smaller than 5MB.');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        setStatus('');
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setStatus('');
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    setStatus('Creating your account...');
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('cell', formData.cell);
      submitData.append('password', formData.password);
      submitData.append('proofOfAddress', proofOfAddress as File);
      submitData.append('idCopy', idCopy as File);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        body: submitData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setStatus(`❌ ${data.error || 'Registration failed.'}`);
        return;
      }
      
      // Handle verification required response
      if (data.status === 'verification_required') {
        setStatus(`✅ ${data.message}`);
        setVerificationPending(true);
        setRegisteredEmail(data.email);
      } else {
        setStatus('✅ Account created successfully!');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ Verification email sent again!');
      } else {
        setStatus(`❌ ${data.error || 'Failed to resend verification.'}`);
      }
    } catch (error) {
      setStatus('❌ Network error. Please try again.');
    }
  };

  // If verification is pending, show verification message
  if (verificationPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-white to-blue-200 py-10 px-4">
        <div className="max-w-md w-full bg-white/90 p-8 rounded-2xl shadow-xl border border-yellow-200">
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to:<br />
              <strong className="text-blue-600">{registeredEmail}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please click the verification link in your email to complete your registration.
              This link will expire in 24 hours.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                📨 Resend Verification Email
              </button>
              
              <Link
                href="/login"
                className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
          
          {status && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              status.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {status}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-200 via-white to-blue-200 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2 px-4">
            <span>Account Details</span>
            <span>FICA Documents</span>
          </div>
        </div>

        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-yellow-200">
          <h1 className="text-3xl font-bold text-yellow-700 mb-6 text-center">
            Create Your Account
          </h1>

          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Cell Phone Number *</label>
                <input
                  type="tel"
                  value={formData.cell}
                  onChange={(e) => handleInputChange('cell', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter your cell phone number"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Create a strong password"
                  required
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 text-xs space-y-1">
                    <div className={`${passwordStrength.length ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.length ? '✓' : '✗'} At least 8 characters
                    </div>
                    <div className={`${passwordStrength.capital ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.capital ? '✓' : '✗'} One uppercase letter
                    </div>
                    <div className={`${passwordStrength.number ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.number ? '✓' : '✗'} One number
                    </div>
                    <div className={`${passwordStrength.special ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.special ? '✓' : '✗'} One special character
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-yellow-600 hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and understand that FICA documents are required for verification.
                </label>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Next: Upload Documents →
              </button>
            </div>
          )}

          {/* Step 2: FICA Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">📋 FICA Compliance Required</h3>
                <p className="text-sm text-blue-700">
                  As per South African law, we require FICA (Financial Intelligence Centre Act) documents 
                  to verify your identity before you can participate in auctions.
                </p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  📄 Proof of Address *
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Upload a recent utility bill, bank statement, or municipal account (not older than 3 months)
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload('proofOfAddress', e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                {proofOfAddress && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ {proofOfAddress.name} ({(proofOfAddress.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  🆔 ID Document *
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Upload a clear copy of your South African ID book/card or passport
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload('idCopy', e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                {idCopy && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ {idCopy.name} ({(idCopy.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">🔒 Document Security</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your documents are encrypted and stored securely</li>
                  <li>• Only authorized admin staff can view your documents</li>
                  <li>• Documents are only used for identity verification</li>
                  <li>• Accepted formats: JPG, PNG, PDF (max 5MB each)</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              status.includes('✅') ? 'bg-green-100 text-green-700' : 
              status.includes('❌') ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {status}
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-600 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
