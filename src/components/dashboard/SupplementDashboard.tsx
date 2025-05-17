import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Pill, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Calendar, Clock, Info } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

interface SupplementDashboardProps {
  userId?: string;
}

const SupplementDashboard = ({ userId }: SupplementDashboardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Mock supplement data
  const supplementData = {
    currentStack: [
      {
        id: '1',
        name: 'Magnesium Glycinate',
        dosage: '300mg',
        timing: 'Before bed',
        lastTaken: '10:30 PM',
        compliance: 100, // percentage
        evidenceLevel: 'Green',
        form: 'capsule_powder',
        image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
        form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo'
      },
      {
        id: '2',
        name: 'Vitamin D3+K2',
        dosage: '5000 IU',
        timing: 'With breakfast',
        lastTaken: '8:15 AM',
        compliance: 85,
        evidenceLevel: 'Green',
        form: 'softgel',
        image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg',
        form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gel%20capsule%20ChatGPT%20Image%20May%204,%202025,%2006_50_42%20AM.png?token=7LqcdP_VcICkC1b-0Y4uFq9iapjjnU32JUEitEp3OTY'
      },
      {
        id: '3',
        name: 'Omega-3 Fish Oil',
        dosage: '2000mg',
        timing: 'With dinner',
        lastTaken: '7:00 PM',
        compliance: 90,
        evidenceLevel: 'Green',
        form: 'softgel',
        image_url: 'https://images.pexels.com/photos/4004626/pexels-photo-4004626.jpeg',
        form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gel%20capsule%20ChatGPT%20Image%20May%204,%202025,%2006_50_42%20AM.png?token=7LqcdP_VcICkC1b-0Y4uFq9iapjjnU32JUEitEp3OTY'
      },
      {
        id: '4',
        name: 'Ashwagandha',
        dosage: '600mg',
        timing: 'Morning',
        lastTaken: '8:15 AM',
        compliance: 70,
        evidenceLevel: 'Yellow',
        form: 'capsule_powder',
        image_url: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg',
        form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo'
      }
    ],
    upcomingRefill: {
      date: '2025-06-15',
      supplements: ['Magnesium Glycinate', 'Vitamin D3+K2']
    },
    evidenceSummary: {
      green: 3,
      yellow: 1,
      red: 0
    },
    overallCompliance: 86, // percentage
    insights: [
      "Your magnesium supplementation is consistent and may be contributing to your improved sleep quality",
      "Consider taking Vitamin D3 with a fat-containing meal to improve absorption",
      "Your Omega-3 intake is optimal for heart and brain health",
      "Ashwagandha compliance could be improved to maximize stress reduction benefits"
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Supplement Compliance Card */}
        <div className="md:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-xl bg-[hsl(var(--color-card))] shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Stack Compliance
                </h2>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--color-surface-1))"
                      strokeWidth="8"
                    />
                    {/* Progress circle - compliance percentage */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - supplementData.overallCompliance / 100)}
                    />
                  </svg>
                  {/* Compliance text */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold sm:text-3xl">
                      {supplementData.overallCompliance}%
                    </span>
                    <span className="text-xs text-text-light">compliance</span>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <h3 className="text-base font-semibold text-primary sm:text-lg">Good</h3>
                  <p className="mt-1 text-xs text-text-light sm:text-sm">
                    Your supplement compliance this week
                  </p>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 sm:mt-6">
                <h4 className="text-xs font-medium sm:text-sm">Top Recommendation</h4>
                <p className="mt-1 text-xs text-text-light">
                  Set a morning reminder to take your Ashwagandha to improve compliance.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Evidence Level Summary */}
        <div className="md:col-span-8">
          <div className="h-full rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-text sm:text-lg">Evidence Level Summary</h2>
              <p className="text-xs text-text-light sm:text-sm">Scientific backing for your supplements</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Strong
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Green Tier
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {supplementData.evidenceSummary.green}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      supplements
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Strong clinical evidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-amber-500">
                    Moderate
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Yellow Tier
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {supplementData.evidenceSummary.yellow}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      supplements
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Emerging evidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    None
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Red Tier
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {supplementData.evidenceSummary.red}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      supplements
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Limited or no evidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <p className="text-xs text-text-light">
                  Your supplement stack is based on strong scientific evidence, with 75% of supplements having strong clinical backing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Stack */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Current Supplement Stack</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supplementData.currentStack.map((supplement) => (
            <div 
              key={supplement.id}
              className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                  <ImageWithFallback
                    src={supplement.form_image_url || supplement.image_url}
                    alt={supplement.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{supplement.name}</h3>
                  <p className="text-xs text-text-light">{supplement.dosage} • {supplement.timing}</p>
                </div>
              </div>
              
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-text-light">Compliance</span>
                <span className={`font-medium ${
                  supplement.compliance >= 90 ? 'text-success' : 
                  supplement.compliance >= 70 ? 'text-amber-500' : 
                  'text-error'
                }`}>
                  {supplement.compliance}%
                </span>
              </div>
              
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                <div 
                  className={`h-full ${
                    supplement.compliance >= 90 ? 'bg-success' : 
                    supplement.compliance >= 70 ? 'bg-amber-500' : 
                    'bg-error'
                  }`}
                  style={{ width: `${supplement.compliance}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-text-light" />
                  <span className="text-text-light">Last taken:</span>
                </div>
                <span>{supplement.lastTaken}</span>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-text-light" />
                  <span className="text-text-light">Evidence:</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 ${
                  supplement.evidenceLevel === 'Green' ? 'bg-success/10 text-success' :
                  supplement.evidenceLevel === 'Yellow' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-error/10 text-error'
                }`}>
                  {supplement.evidenceLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Refill */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Upcoming Refill</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            {showDetails ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Next Delivery</h3>
              <p className="text-sm text-text-light">
                {new Date(supplementData.upcomingRefill.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{supplementData.upcomingRefill.supplements.length} supplements</div>
            <div className="text-sm text-text-light">Auto-delivery</div>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-4 border-t border-[hsl(var(--color-border))] pt-4">
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Supplements to be Refilled</h3>
              <div className="space-y-2">
                {supplementData.upcomingRefill.supplements.map((supplement, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-card))] p-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span>{supplement}</span>
                    </div>
                    <span className="text-sm text-text-light">30-day supply</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Supplement Insights</h3>
              <div className="space-y-2">
                {supplementData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplementDashboard;