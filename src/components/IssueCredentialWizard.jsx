import React, { useState } from 'react';
import { 
  Building2, 
  Plane, 
  GraduationCap, 
  Shield, 
  HeartPulse, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Share2, 
  ShieldCheck, 
  Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Input, Select, Badge } from './ui';

export default function IssueCredentialWizard() {
  const { addCredential, navigateTo, setSelectedCredentialId, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Review, 3: Success
  const [issuedCred, setIssuedCred] = useState(null);
  const [issuing, setIssuing] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const expiry = new Date(today);
    expiry.setFullYear(today.getFullYear() + 3);

    return {
      type: 'Tourism Access Pass',
      issuer: 'Tourism Department',
      category: 'Tourism & Hospitality',
      iconType: 'building',
      holderName: '',
      identifierNumber: '',
      passportNumber: '',
      validFrom: today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validTill: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  });

  const [errors, setErrors] = useState({});

  const credentialTypeOptions = [
    { 
      value: 'Tourism Access Pass', 
      label: 'Tourism Access Pass (Government of India)', 
      issuer: 'Tourism Department', 
      category: 'Tourism & Hospitality', 
      icon: 'building' 
    },
    { 
      value: 'Passport', 
      label: 'Passport (Ministry of External Affairs)', 
      issuer: 'Ministry of External Affairs', 
      category: 'Travel Document', 
      icon: 'passport' 
    },
    { 
      value: 'College Degree', 
      label: 'College Degree (ABC University)', 
      issuer: 'ABC University', 
      category: 'Education', 
      icon: 'academic' 
    },
    { 
      value: 'Aadhaar (Masked)', 
      label: 'Aadhaar (Masked) (Government of India)', 
      issuer: 'Government of India', 
      category: 'National ID', 
      icon: 'id-card' 
    },
    { 
      value: 'Health Certificate', 
      label: 'Health Certificate (Health Department)', 
      issuer: 'Health Department', 
      category: 'Healthcare', 
      icon: 'health' 
    }
  ];

  const handleTypeChange = (selectedVal) => {
    const matched = credentialTypeOptions.find((o) => o.value === selectedVal);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        type: matched.value,
        issuer: matched.issuer,
        category: matched.category,
        iconType: matched.icon
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.holderName.trim()) {
      newErrors.holderName = 'Holder name is required';
    }
    if (!formData.identifierNumber.trim()) {
      newErrors.identifierNumber = 'Identifier or Document Number is required';
    }
    if (!formData.validTill.trim()) {
      newErrors.validTill = 'Validity expiry date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToReview = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleIssueCredential = async () => {
    setIssuing(true);
    try {
      const newCredPayload = {
        title: formData.type,
        idType: formData.type,
        issuer: formData.issuer,
        category: formData.category,
        iconType: formData.iconType,
        holderName: formData.holderName,
        identifierNumber: formData.identifierNumber,
        idNumber: formData.identifierNumber,
        passportNumber: formData.passportNumber,
        issueDate: formData.validFrom,
        expiryDate: formData.validTill,
        validUntil: formData.validTill,
        nationality: 'Indian'
      };

      const created = await addCredential(newCredPayload);
      setIssuedCred(created);
      setCurrentStep(3);
    } catch (err) {
      showToast(`Issuance error: ${err.message}`, 'danger');
    } finally {
      setIssuing(false);
    }
  };

  const getCredentialIcon = (iconType) => {
    switch (iconType) {
      case 'academic': return <GraduationCap size={22} />;
      case 'passport': return <Plane size={22} />;
      case 'building': return <Building2 size={22} />;
      case 'health': return <HeartPulse size={22} />;
      default: return <Shield size={22} />;
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            Issue Credential
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Authority Verifiable Credential Issuance Wizard
          </p>
        </div>

        {currentStep < 3 && (
          <Button variant="ghost" size="sm" onClick={() => navigateTo('wallet')}>
            Cancel
          </Button>
        )}
      </div>

      {/* Stepper matching Reference Screen 6: 1 Details -> 2 Review -> 3 Issue */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          padding: '14px 20px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Review' },
          { num: 3, label: 'Issue' }
        ].map((step, idx) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;

          return (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive ? '#071A3D' : isDone ? 'var(--brand-success)' : 'var(--bg-surface-3)',
                  color: isActive || isDone ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
                  border: isActive ? '2px solid var(--brand-royal-blue)' : 'none'
                }}
              >
                {isDone ? <CheckCircle2 size={16} /> : step.num}
              </div>

              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {step.label}
              </span>

              {idx < 2 && (
                <div style={{ width: '24px', height: '2px', background: isDone ? 'var(--brand-success)' : 'var(--border-subtle)', marginLeft: '8px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Details (Screen 6 in Reference) */}
      {currentStep === 1 && (
        <form 
          onSubmit={handleContinueToReview}
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--card-shadow)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Select Credential Type */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Select Credential Type
            </label>
            <Select
              options={credentialTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            />
          </div>

          {/* Enter Holder Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Enter Holder Details
            </span>

            <Input
              label="Full Name"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              error={errors.holderName}
              placeholder="e.g. Aditi Singh"
              icon={User}
              required={true}
            />

            <Input
              label="Identifier / Passport Number"
              value={formData.identifierNumber}
              onChange={(e) => setFormData({ ...formData, identifierNumber: e.target.value })}
              error={errors.identifierNumber}
              placeholder="e.g. P1234567 or TAP-2025-8841"
              icon={FileText}
              required={true}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Issue Date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                icon={Calendar}
              />
              <Input
                label="Expiry Date"
                value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                error={errors.validTill}
                icon={Calendar}
                required={true}
              />
            </div>
          </div>

          {/* Continue Button matching Reference */}
          <Button
            variant="dark"
            size="lg"
            type="submit"
            fullWidth={true}
            style={{
              background: '#071A3D',
              borderRadius: 'var(--radius-full)',
              marginTop: '10px'
            }}
            icon={ArrowRight}
            iconPosition="right"
          >
            Continue
          </Button>
        </form>
      )}

      {/* STEP 2: Review Preview */}
      {currentStep === 2 && (
        <div 
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--card-shadow)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Review Credential Payload
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Confirm attributes before cryptographically committing to Polygon Amoy
            </p>
          </div>

          {/* Credential Preview Card */}
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface-3) 100%)',
              border: '1.5px solid rgba(37, 99, 235, 0.3)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand-royal-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getCredentialIcon(formData.iconType)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {formData.type}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formData.issuer}
                  </span>
                </div>
              </div>
              <Badge status="valid">Valid</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Holder Name</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formData.holderName}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Identifier</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formData.identifierNumber}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Validity</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formData.validFrom} – {formData.validTill}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Anchor Network</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--brand-royal-blue)' }}>Polygon Amoy</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(1)}
              icon={ArrowLeft}
              style={{ flex: 1 }}
            >
              Back
            </Button>
            <Button
              variant="dark"
              onClick={handleIssueCredential}
              isLoading={issuing}
              style={{ flex: 2, background: '#071A3D', borderRadius: 'var(--radius-full)' }}
              icon={ShieldCheck}
            >
              Sign & Issue Credential
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Issue / Success (Screen 7 in Reference) */}
      {currentStep === 3 && issuedCred && (
        <div 
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--card-shadow-hover)',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          {/* Big Green Circle with White Checkmark matching Reference Screen 7 */}
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <CheckCircle2 size={46} strokeWidth={2.4} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Credential Issued Successfully!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Your {issuedCred.title} has been issued to {issuedCred.holderName}.
            </p>
          </div>

          {/* Credential Summary Card matching Reference Screen 7 */}
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--brand-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {getCredentialIcon(issuedCred.iconType)}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {issuedCred.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {issuedCred.issuer}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Holder</span>
                <strong style={{ color: 'var(--text-primary)' }}>{issuedCred.holderName}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Valid Till</span>
                <strong style={{ color: 'var(--text-primary)' }}>{issuedCred.expiryDate}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons matching Reference Screen 7 */}
          <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button
              variant="dark"
              size="lg"
              fullWidth={true}
              onClick={() => {
                setSelectedCredentialId(issuedCred.id);
                navigateTo('credential-detail', { credentialId: issuedCred.id });
              }}
              style={{
                background: '#071A3D',
                borderRadius: 'var(--radius-full)'
              }}
            >
              View Credential
            </Button>

            <Button
              variant="secondary"
              size="md"
              fullWidth={true}
              icon={Share2}
              onClick={() => {
                navigator.clipboard.writeText(`https://verichain.id/verify/${issuedCred.id}`);
                showToast('Credential verification link copied to clipboard', 'info');
              }}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Share with Holder
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() => {
                setCurrentStep(1);
                setIssuedCred(null);
              }}
              style={{ marginTop: '4px' }}
            >
              Issue Another Credential
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
