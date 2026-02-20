import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Car, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';

const steps = [
  { id: 'license', label: 'License', icon: FileText },
  { id: 'verification', label: 'NIN', icon: User },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

export default function DriverOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [ninNumber, setNinNumber] = useState('');

  const handleNext = () => {
    if (currentStep === 0 && (!licenseNumber || !licenseExpiry)) {
      toast.error('Please fill in all license details');
      return;
    }
    if (currentStep === 1 && !ninNumber) {
      toast.error('Please enter your NIN');
      return;
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
        .from('drivers')
        .insert({
          user_id: user.id,
          license_number: licenseNumber,
          license_expiry: licenseExpiry,
          nin_number: ninNumber,
          verification_status: 'pending'
        });

      if (error) throw error;

      await refreshProfile();
      toast.success('Driver profile created! Pending verification.');
      navigate('/driver');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create driver profile');
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
              <p className="text-sm text-muted-foreground">Driver Onboarding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive ? 'bg-accent text-accent-foreground' : ''}
                    ${isCompleted ? 'text-accent' : 'text-muted-foreground'}
                  `}>
                    <Icon size={18} />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-accent' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 0: License Details */}
          {currentStep === 0 && (
            <motion.div
              key="license"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">Driver's License</h2>
                <p className="text-muted-foreground mt-2">
                  Enter your valid driver's license information
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="licenseNumber"
                      placeholder="ABC123456789"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">Expiry Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    License must be valid for at least 6 months
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: NIN Verification */}
          {currentStep === 1 && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">NIN Verification</h2>
                <p className="text-muted-foreground mt-2">
                  Provide your National Identification Number for identity verification
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h4 className="font-medium text-accent">Why we need your NIN</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your NIN helps us verify your identity and build trust with passengers. 
                    All drivers must be verified before they can accept trips.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nin">NIN (11 digits) *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="nin"
                      placeholder="12345678901"
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="pl-10"
                      maxLength={11}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your NIN will be verified against NIMC records
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Complete */}
          {currentStep === 2 && (
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
                <h2 className="text-2xl font-bold">Ready to Submit!</h2>
                <p className="text-muted-foreground mt-2">
                  Review your information and submit your application
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 text-left space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Expiry</p>
                  <p className="font-medium">{licenseExpiry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIN</p>
                  <p className="font-medium">{ninNumber}</p>
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
          {currentStep > 0 && currentStep < 2 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          )}
          {currentStep === 0 && <div />}
          
          {currentStep < 2 ? (
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
