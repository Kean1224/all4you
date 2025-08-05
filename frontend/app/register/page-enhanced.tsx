'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface RegistrationForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  idNumber: string
  address: string
  city: string
  postalCode: string
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
}

interface FileUploads {
  idDocument: File | null
  proofOfAddress: File | null
  bankStatement: File | null
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<RegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
    address: '',
    city: '',
    postalCode: '',
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false
  })

  const [files, setFiles] = useState<FileUploads>({
    idDocument: null,
    proofOfAddress: null,
    bankStatement: null
  })

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  })

  const validatePassword = (password: string) => {
    let score = 0
    let feedback = ''

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    switch (score) {
      case 0:
      case 1:
        feedback = 'Very weak'
        break
      case 2:
        feedback = 'Weak'
        break
      case 3:
        feedback = 'Fair'
        break
      case 4:
        feedback = 'Good'
        break
      case 5:
        feedback = 'Strong'
        break
    }

    setPasswordStrength({ score, feedback })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (name === 'password') {
      validatePassword(value)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof FileUploads) => {
    const file = e.target.files?.[0] || null
    
    // Validate file size (5MB limit)
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (file && !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setError('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }))
    setError('')
  }

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields')
      return false
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter and confirm your password')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.idNumber || !formData.address || !formData.city || !formData.postalCode) {
      setError('Please fill in all address and ID information')
      return false
    }

    if (!files.idDocument || !files.proofOfAddress || !files.bankStatement) {
      setError('Please upload all required FICA documents')
      return false
    }

    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy')
      return false
    }

    return true
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateStep2()) {
      setLoading(false)
      return
    }

    try {
      const submitData = new FormData()
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString())
      })

      // Add files
      if (files.idDocument) submitData.append('idDocument', files.idDocument)
      if (files.proofOfAddress) submitData.append('proofOfAddress', files.proofOfAddress)
      if (files.bankStatement) submitData.append('bankStatement', files.bankStatement)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-with-fica`, {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?message=registration_success')
        }, 3000)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your account has been created and is pending FICA verification. 
              You will receive an email confirmation shortly.
            </p>
            <p className="mt-4 text-sm text-blue-600">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Your All4You Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 2: {step === 1 ? 'Personal Information' : 'FICA Verification'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score < 3 ? 'text-red-600' : 
                        passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score < 3 ? 'bg-red-500' : 
                          passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to FICA Verification
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                  ID Number *
                </label>
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code *
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* FICA Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">FICA Documents Required</h3>
                
                <div>
                  <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700">
                    ID Document (Copy of ID or Passport) *
                  </label>
                  <input
                    id="idDocument"
                    name="idDocument"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'idDocument')}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.idDocument && (
                    <p className="mt-1 text-sm text-green-600">✓ {files.idDocument.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="proofOfAddress" className="block text-sm font-medium text-gray-700">
                    Proof of Address (Utility bill or bank statement) *
                  </label>
                  <input
                    id="proofOfAddress"
                    name="proofOfAddress"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'proofOfAddress')}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.proofOfAddress && (
                    <p className="mt-1 text-sm text-green-600">✓ {files.proofOfAddress.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bankStatement" className="block text-sm font-medium text-gray-700">
                    Bank Statement (Last 3 months) *
                  </label>
                  <input
                    id="bankStatement"
                    name="bankStatement"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'bankStatement')}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.bankStatement && (
                    <p className="mt-1 text-sm text-green-600">✓ {files.bankStatement.name}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
                    I accept the <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> *
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="privacyAccepted"
                    name="privacyAccepted"
                    type="checkbox"
                    required
                    checked={formData.privacyAccepted}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacyAccepted" className="ml-2 block text-sm text-gray-900">
                    I accept the Privacy Policy *
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="marketingConsent"
                    name="marketingConsent"
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
                    I consent to receive marketing communications
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
