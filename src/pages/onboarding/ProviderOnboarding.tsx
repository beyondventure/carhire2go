import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, FileText, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';
import { SERVICE_CITIES } from '@/lib/constants';

type ProviderType = 'individual' | 'company';

const steps = [
  { id: 'type', label: 'Type', icon: Building2 },
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'verification', label: 'Verification', icon: User },
  { id: 'bank', label: 'Bank', icon: CreditCard },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [providerType, setProviderType] = useState<ProviderType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  
  // Individual verification
  const [ninNumber, setNinNumber] = useState('');
  
  // Company verification
  const [cacNumber, setCacNumber] = useState('');
  
  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const toggleServiceArea = (city: string) => {
    setServiceAreas(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city) 
        : [...prev, city]
    );
  };

  const handleNext = () => {
    if (currentStep === 0 && !providerType) {
      toast.error('Please select a provider type');
      return;
    }
    if (currentStep === 1 && (!businessName || serviceAreas.length === 0)) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (currentStep === 2) {
      if (providerType === 'individual' && !ninNumber) {
        toast.error('Please enter your NIN');
        return;
      }
      if (providerType === 'company' && !cacNumber) {
        toast.error('Please enter your CAC registration number');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('providers')
        .insert({
          user_id: user.id,
          provider_type: providerType!,
          business_name: businessName,
          business_address: businessAddress,
          service_areas: serviceAreas,
          nin_number: providerType === 'individual' ? ninNumber : null,
          cac_number: providerType === 'company' ? cacNumber : null,
          bank_name: bankName || null,
          account_number: accountNumber || null,
          account_name: accountName || null,
          verification_status: 'pending'
        });

      if (error) throw error;

      await refreshProfile();
      toast.success('Provider profile created! Pending verification.');
      navigate('/provider');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create provider profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">InstantRyde</h1>
              <p className="text-sm text-muted-foreground">Provider Onboarding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                    ${isActive ? 'bg-accent text-accent-foreground' : ''}
                    ${isCompleted ? 'text-accent' : 'text-muted-foreground'}
                  `}>
                    <Icon size={18} />
                    <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-accent' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 0: Provider Type */}
          {currentStep === 0 && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">What type of provider are you?</h2>
                <p className="text-muted-foreground mt-2">
                  Choose between individual or company registration
                </p>
              </div>

              <div className="grid gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProviderType('individual')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    providerType === 'individual' 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Individual Provider</h3>
                      <p className="text-muted-foreground mt-1">
                        For individuals who own vehicles and want to offer car hire services. 
                        You'll need to provide your NIN (National Identification Number) for verification.
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProviderType('company')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    providerType === 'company' 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Company Provider</h3>
                      <p className="text-muted-foreground mt-1">
                        For registered businesses offering car hire services. 
                        You'll need to provide your CAC (Corporate Affairs Commission) registration number.
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Business Details */}
          {currentStep === 1 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">Business Details</h2>
                <p className="text-muted-foreground mt-2">
                  Tell us about your {providerType === 'company' ? 'company' : 'business'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    {providerType === 'company' ? 'Company Name' : 'Business Name'} *
                  </Label>
                  <Input
                    id="businessName"
                    placeholder={providerType === 'company' ? 'ABC Car Rentals Ltd' : 'John\'s Car Hire'}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    placeholder="Enter your business address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Areas * (Select cities you operate in)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SERVICE_CITIES.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleServiceArea(city)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          serviceAreas.includes(city)
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">Verification</h2>
                <p className="text-muted-foreground mt-2">
                  {providerType === 'individual' 
                    ? 'Provide your NIN for identity verification'
                    : 'Provide your CAC registration details'}
                </p>
              </div>

              {providerType === 'individual' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-medium text-accent">NIN Verification Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your National Identification Number (NIN) is required to verify your identity. 
                      This helps build trust with customers.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nin">NIN (11 digits) *</Label>
                    <Input
                      id="nin"
                      placeholder="12345678901"
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your NIN will be verified against NIMC records
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-medium text-accent">CAC Registration Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your CAC registration number is required to verify your company. 
                      This ensures only legitimate businesses operate on our platform.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cac">CAC Registration Number *</Label>
                    <Input
                      id="cac"
                      placeholder="RC123456"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value.toUpperCase())}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your CAC registration number (e.g., RC123456 or BN123456)
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Bank Details */}
          {currentStep === 3 && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">Bank Details</h2>
                <p className="text-muted-foreground mt-2">
                  Where should we send your earnings?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="First Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John Doe"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  You can skip this step and add bank details later from your settings.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">Almost Done!</h2>
                <p className="text-muted-foreground mt-2">
                  Review your information and submit your application
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 text-left space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Provider Type</p>
                  <p className="font-medium capitalize">{providerType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Areas</p>
                  <p className="font-medium">{serviceAreas.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {providerType === 'individual' ? 'NIN' : 'CAC Number'}
                  </p>
                  <p className="font-medium">
                    {providerType === 'individual' ? ninNumber : cacNumber}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Your profile will be reviewed within 24-48 hours. 
                You'll be notified once verified.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          {currentStep > 0 && currentStep < 4 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          )}
          {currentStep === 0 && <div />}
          
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="btn-primary ml-auto">
              Next
              <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              className="btn-primary ml-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
