import React, { useState, useEffect, useRef } from 'react';
import { AdmissionData, INITIAL_DATA, SCHOOL_LOGO_URL } from '../types';
import { generatePDF } from '../services/pdfService';
import { PrintableDocument } from './PrintableDocument';
import { FileText, Trash2, Loader2, Save, AlertCircle, Eye, X, History, Upload, Image as ImageIcon, HelpCircle, Phone, MessageCircle, MapPin } from 'lucide-react';

const CLASS_OPTIONS = [
  "Nursery", "Jr. KG", "Sr. KG",
  "1st", "2nd", "3rd", "4th", "5th",
  "6th", "7th", "8th", "9th", "10th"
];

const PREV_CLASS_OPTIONS = [
  "Not Applicable", "Playgroup",
  ...CLASS_OPTIONS
];

const DRAFT_KEY_PREFIX = 'admission_form_draft_';

export const AdmissionForm: React.FC = () => {
  // Initialize with INITIAL_DATA so the form is blank and ready for the user
  const [formData, setFormData] = useState<AdmissionData>({ ...INITIAL_DATA });
  const [errors, setErrors] = useState<Partial<Record<keyof AdmissionData, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<string[]>([]);
  
  // Tooltip states and refs
  const [showBirthHelp, setShowBirthHelp] = useState(false);
  const [showDobHelp, setShowDobHelp] = useState(false);
  const birthHelpRef = useRef<HTMLDivElement>(null);
  const dobHelpRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside for tooltips
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (birthHelpRef.current && !birthHelpRef.current.contains(event.target as Node)) {
        setShowBirthHelp(false);
      }
      if (dobHelpRef.current && !dobHelpRef.current.contains(event.target as Node)) {
        setShowDobHelp(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getSavedDrafts = () => {
    const drafts: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
            drafts.push(key.replace(DRAFT_KEY_PREFIX, ''));
        }
    }
    setSavedDrafts(drafts.sort());
  };

  const handleOpenDraftsModal = () => {
      getSavedDrafts();
      setShowDraftsModal(true);
  };

  const validateField = (name: keyof AdmissionData, value: string): string => {
    const requiredFields: (keyof AdmissionData)[] = [
      'fullName', 'medium', 'classApply', 'dob', 'placeOfBirth', 
      'gender', 'nationality', 'religion', 'fatherName', 'motherName', 'address', 'parentContact'
    ];

    if (requiredFields.includes(name) && !value.trim()) {
      return 'This field is required';
    }

    // Phone validation
    if (['parentContact', 'altContact', 'emgNumber'].includes(name) && value.trim()) {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) {
        return 'Please enter a valid mobile number (10 digits)';
      }
    }

    // Aadhar validation (optional, but must be 12 digits if entered)
    if (name === 'studentAadharNumber' && value.trim()) {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 12) {
        return 'Aadhar number must be 12 digits';
      }
    }

    // DOB validation
    if (name === 'dob' && value) {
       const date = new Date(value);
       const now = new Date();
       if (date > now) {
           return 'Date of birth cannot be in the future';
       }
    }

    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof AdmissionData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Strict validation for Aadhar Number: Digits only, max 12 chars
    if (name === 'studentAadharNumber') {
      const sanitized = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      
      if (errors[name as keyof AdmissionData]) {
         setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }
    
    // Sanitize phone numbers: Digits only, max 10
    if (['parentContact', 'altContact', 'emgNumber'].includes(name)) {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      
      if (errors[name as keyof AdmissionData]) {
         setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    // Sanitize Annual Income: Allow numbers, dots, and commas only
    if (name === 'annualIncome') {
      const sanitized = value.replace(/[^0-9.,]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      
      if (errors[name as keyof AdmissionData]) {
         setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    // Sanitize Name Fields: Allow only letters, spaces, and dots
    if (['fullName', 'fatherName', 'motherName', 'emgName'].includes(name)) {
      const sanitized = value.replace(/[^a-zA-Z\s.]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      
      if (errors[name as keyof AdmissionData]) {
         setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof AdmissionData]) {
       setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert("File is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, customLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if(window.confirm('Remove custom logo and revert to default?')) {
        setFormData(prev => ({ ...prev, customLogo: '' }));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      // Use spread to ensure a fresh object is set
      setFormData({ ...INITIAL_DATA });
      setErrors({});
      // Reset file input value so onChange works if same file is selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveDraft = () => {
    let draftName = formData.fullName.trim();
    if (!draftName) {
        draftName = prompt('Please enter a name for this draft (e.g., student name):');
        if (!draftName) {
            alert('Save cancelled. A name is required to save a draft.');
            return;
        }
    }
    
    try {
      const key = `${DRAFT_KEY_PREFIX}${draftName}`;
      localStorage.setItem(key, JSON.stringify(formData));
      alert(`Draft saved for "${draftName}"!`);
    } catch (e) {
      alert('Failed to save draft. Local storage might be full or disabled.');
    }
  };

  const handleLoadDraft = (name: string) => {
    const key = `${DRAFT_KEY_PREFIX}${name}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        if (window.confirm(`This will overwrite your current entries with the draft for "${name}". Continue?`)) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(parsed);
                setErrors({});
                setShowDraftsModal(false);
            } catch (e) {
                alert('Error loading draft data.');
            }
        }
    }
  };

  const handleDeleteDraft = (name: string) => {
    if (window.confirm(`Are you sure you want to delete the draft for "${name}"?`)) {
        const key = `${DRAFT_KEY_PREFIX}${name}`;
        localStorage.removeItem(key);
        setSavedDrafts(prev => prev.filter(d => d !== name));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof AdmissionData, string>> = {};
    let isValid = true;
    
    // Check all fields
    (Object.keys(INITIAL_DATA) as (keyof AdmissionData)[]).forEach(key => {
        if (key === 'customLogo') return;
        const error = validateField(key, formData[key] || '');
        if (error) {
            newErrors[key] = error;
            isValid = false;
        }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleGeneratePdf = async () => {
    if (!validateForm()) {
      alert("Please check the form for errors marked in red.");
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-500');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (!window.confirm('Are you sure you want to generate the PDF?')) {
      return;
    }

    setIsGenerating(true);
    // Allow React to render the updated PrintableDocument before capturing
    setTimeout(async () => {
      try {
        await generatePDF('printable-form-source', `admission_${formData.fullName.replace(/\s+/g, '_') || 'form'}.pdf`);
      } catch (e: any) {
        console.error(e);
        alert(`Failed to generate PDF: ${e.message || 'Unknown error'}`);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const getInputClass = (name: keyof AdmissionData) => {
    const base = "w-full p-2.5 rounded-lg border outline-none transition-all bg-white";
    if (errors[name]) {
        return `${base} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    }
    return `${base} border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20`;
  };

  const ErrorMsg = ({ name }: { name: keyof AdmissionData }) => (
    errors[name] ? <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[name]}</p> : null
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Hidden container for the actual PDF generation (kept in DOM) 
          Using fixed positioning with 0 size to prevent layout shifts or scrollbars */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        {/* We use a specific ID for the source to avoid conflict with the preview instance */}
        {/* Fixed width ensures PDF generates with correct proportions regardless of screen size */}
        <div style={{ width: '210mm', minHeight: '297mm' }}>
            <PrintableDocument data={formData} id="printable-form-source" />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shrink-0 z-10">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-accent" />
                PDF Preview
              </h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-100 flex justify-center">
               <div className="origin-top">
                  {/* Responsive Scaling to ensure it fits on mobile screens */}
                  <div className="scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 shadow-xl bg-white origin-top transition-transform duration-200">
                    <PrintableDocument data={formData} id="printable-form-preview" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b shrink-0 bg-white">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <History className="w-5 h-5 text-accent" />
                        Manage Saved Drafts
                    </h3>
                    <button onClick={() => setShowDraftsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto bg-gray-50 flex-1">
                    {savedDrafts.length > 0 ? (
                        <ul className="space-y-2">
                            {savedDrafts.map(name => (
                                <li key={name} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                    <span className="font-medium text-gray-800 truncate pr-2">{name}</span>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button onClick={() => handleLoadDraft(name)} className="text-sm font-semibold text-accent hover:underline">Load</button>
                                        <button onClick={() => handleDeleteDraft(name)} className="text-sm font-semibold text-danger hover:underline">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted py-8">No saved drafts found.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        {/* Updated Header with Gradient for Blue & Green Uniform Colors */}
        <header className="relative bg-gradient-to-r from-accent to-brand-green p-4 sm:p-6 border-b border-blue-600 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          
          {/* Action Buttons: Call, WhatsApp & Location */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex flex-col gap-3">
             <a 
               href="tel:9930129455" 
               className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full backdrop-blur-sm transition-all border border-white/30 shadow-lg active:scale-95 animate-pulse hover:animate-none flex items-center justify-center"
               title="Call School Now"
             >
               <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
             </a>
             <a 
               href="https://wa.me/919930129455" 
               target="_blank"
               rel="noopener noreferrer"
               className="bg-green-500/30 hover:bg-green-500/50 text-white p-2.5 rounded-full backdrop-blur-sm transition-all border border-white/30 shadow-lg active:scale-95 flex items-center justify-center"
               title="WhatsApp School"
             >
               <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
             </a>
             <a 
               href="https://maps.app.goo.gl/Dxm1vC6sMmTsZPer9" 
               target="_blank"
               rel="noopener noreferrer"
               className="bg-red-500/30 hover:bg-red-500/50 text-white p-2.5 rounded-full backdrop-blur-sm transition-all border border-white/30 shadow-lg active:scale-95 flex items-center justify-center"
               title="Locate School"
             >
               <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
             </a>
          </div>

          {/* Logo Upload Section */}
          <div className="relative group shrink-0">
             <label className="cursor-pointer block">
                <div className="w-16 h-16 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-md relative">
                  <img src={formData.customLogo || SCHOOL_LOGO_URL} alt="Logo" className="w-full h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden"
                  ref={fileInputRef}
                />
             </label>
             {formData.customLogo && (
               <button 
                 onClick={handleRemoveLogo}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm z-10"
                 title="Reset Logo"
               >
                 <X className="w-3 h-3" />
               </button>
             )}
          </div>

          <div className="w-full">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-blue-100 mb-1">Shree Ganesh Education Academy's</div>
            <h1 className="text-base sm:text-lg font-bold uppercase leading-tight text-white">
              Indrayani International School
            </h1>
            <h1 className="text-base sm:text-lg font-bold uppercase leading-tight text-white">
              Indrayani English Medium School
            </h1>
            
            {/* Added Address and Phone Number */}
            <div className="mt-2 space-y-0.5">
              <p className="text-[10px] sm:text-xs text-blue-50 font-medium leading-tight opacity-95">
                Sector 18, Plot No. 23-26, Near Shivajirao Patil Garden, Koparkhairane, Navi Mumbai 400709
              </p>
              <p className="text-[10px] sm:text-xs text-blue-50 font-medium opacity-95">
                Phone: 8425919111 / 8422019111
              </p>
            </div>

            <p className="text-blue-100 text-xs mt-3 pt-3 border-t border-white/10 sm:border-none sm:pt-1 font-semibold flex items-center justify-center sm:justify-start gap-1">
              Online Admission Portal
            </p>
          </div>
        </header>

        <form className="p-6 md:p-8" onSubmit={(e) => e.preventDefault()} noValidate autoComplete="off">
          <div className="space-y-8">
            
            {/* Action Bar for Testing & Saving */}
            <div className="flex justify-end flex-wrap gap-2">
              <button 
                  type="button" 
                  onClick={handleOpenDraftsModal}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <History className="w-3 h-3" />
                  Manage Drafts
                </button>
              
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
              >
                <Save className="w-3 h-3" />
                Save Draft
              </button>
            </div>
            
            {/* Section 1 */}
            <section className="border border-blue-100 rounded-xl p-5 bg-blue-50">
              {/* Gradient Section Header */}
              <h2 className="bg-gradient-to-r from-accent to-brand-green text-white p-3 rounded-lg font-bold text-lg mb-6 flex items-center gap-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs text-accent font-bold">1</span>
                Student Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    placeholder="e.g. John Doe" 
                    className={getInputClass('fullName')}
                    required 
                    autoFocus
                  />
                  <ErrorMsg name="fullName" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1">Student Aadhar Number</label>
                  <input 
                    name="studentAadharNumber" 
                    value={formData.studentAadharNumber} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    placeholder="12 digits (no spaces)" 
                    className={getInputClass('studentAadharNumber')}
                  />
                  <ErrorMsg name="studentAadharNumber" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Medium <span className="text-red-500">*</span></label>
                  <select 
                    name="medium" 
                    value={formData.medium} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getInputClass('medium')}
                  >
                    <option value="">Select Medium</option>
                    <option value="English">English</option>
                    <option value="Semi-English">Semi-English</option>
                  </select>
                  <ErrorMsg name="medium" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Class Applying For <span className="text-red-500">*</span></label>
                  <select
                    name="classApply"
                    value={formData.classApply}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getInputClass('classApply')}
                    required
                  >
                    <option value="">Select Class</option>
                    {CLASS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ErrorMsg name="classApply" />
                </div>

                {/* Previous School */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Previous School</label>
                  <input 
                    name="previousSchool" 
                    value={formData.previousSchool} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="School Name" 
                    className={getInputClass('previousSchool')}
                  />
                  <ErrorMsg name="previousSchool" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Previous Class</label>
                  <select
                    name="previousClass"
                    value={formData.previousClass}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getInputClass('previousClass')}
                  >
                    <option value="">Select Previous Class</option>
                    {PREV_CLASS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ErrorMsg name="previousClass" />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1 flex items-center gap-1">
                    Date of Birth <span className="text-red-500">*</span>
                    <div className="relative" ref={dobHelpRef}>
                      <button 
                        type="button" 
                        onClick={() => setShowDobHelp(!showDobHelp)}
                        className="focus:outline-none transition-colors hover:text-blue-600"
                        title="Click for help"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      
                      {showDobHelp && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-800 text-white text-[11px] p-3 rounded-xl shadow-xl z-50 text-center font-normal tracking-wide leading-relaxed animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex items-start justify-between gap-2">
                               <span className="flex-1">Date Of Birth Should Be Same As On Birth Certificate</span>
                               <button 
                                 type="button"
                                 onClick={(e) => { 
                                    e.stopPropagation(); 
                                    e.preventDefault(); 
                                    setShowDobHelp(false); 
                                 }} 
                                 className="text-slate-400 hover:text-white shrink-0"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                             </div>
                             <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </div>
                  </label>
                  <input 
                    type="date"
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    className={getInputClass('dob')}
                    required 
                  />
                  <ErrorMsg name="dob" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1 flex items-center gap-1">
                    Place of Birth <span className="text-red-500">*</span>
                    <div className="relative" ref={birthHelpRef}>
                      <button 
                        type="button" 
                        onClick={() => setShowBirthHelp(!showBirthHelp)}
                        className="focus:outline-none transition-colors hover:text-blue-600"
                        title="Click for help"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      
                      {showBirthHelp && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-800 text-white text-[11px] p-3 rounded-xl shadow-xl z-50 text-center font-normal tracking-wide leading-relaxed animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex items-start justify-between gap-2">
                               <span className="flex-1">Enter City/Village, Taluka & District</span>
                               <button 
                                 type="button"
                                 onClick={(e) => { 
                                    e.stopPropagation(); 
                                    e.preventDefault(); 
                                    setShowBirthHelp(false); 
                                 }} 
                                 className="text-slate-400 hover:text-white shrink-0"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                             </div>
                             <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </div>
                  </label>
                  <input 
                    name="placeOfBirth" 
                    value={formData.placeOfBirth} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="e.g. Pune, Haveli" 
                    className={getInputClass('placeOfBirth')}
                  />
                  <ErrorMsg name="placeOfBirth" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Gender <span className="text-red-500">*</span></label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getInputClass('gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <ErrorMsg name="gender" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Nationality <span className="text-red-500">*</span></label>
                  <input 
                    name="nationality" 
                    value={formData.nationality} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="e.g. Indian" 
                    className={getInputClass('nationality')}
                  />
                  <ErrorMsg name="nationality" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Religion <span className="text-red-500">*</span></label>
                  <input 
                    name="religion" 
                    value={formData.religion} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Religion" 
                    className={getInputClass('religion')}
                  />
                  <ErrorMsg name="religion" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Caste</label>
                  <input 
                    name="caste" 
                    value={formData.caste} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Caste" 
                    className={getInputClass('caste')}
                  />
                  <ErrorMsg name="caste" />
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="border border-blue-100 rounded-xl p-5 bg-blue-50">
              {/* Gradient Section Header */}
              <h2 className="bg-gradient-to-r from-accent to-brand-green text-white p-3 rounded-lg font-bold text-lg mb-6 flex items-center gap-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs text-accent font-bold">2</span>
                Guardian Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Father / Guardian Name <span className="text-red-500">*</span></label>
                  <input 
                    name="fatherName" 
                    value={formData.fatherName} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Full Name" 
                    className={getInputClass('fatherName')}
                  />
                  <ErrorMsg name="fatherName" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Mother Name <span className="text-red-500">*</span></label>
                  <input 
                    name="motherName" 
                    value={formData.motherName} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Full Name" 
                    className={getInputClass('motherName')}
                  />
                  <ErrorMsg name="motherName" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1">Residential Address <span className="text-red-500">*</span></label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Full Residential Address" 
                    rows={2}
                    className={getInputClass('address')}
                  />
                  <ErrorMsg name="address" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Occupation</label>
                  <input 
                    name="guardianOcc" 
                    value={formData.guardianOcc} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Guardian Occupation" 
                    className={getInputClass('guardianOcc')}
                  />
                  <ErrorMsg name="guardianOcc" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Relation to Student</label>
                  <input 
                    name="relationToGuardian" 
                    value={formData.relationToGuardian} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="e.g. Father, Mother" 
                    className={getInputClass('relationToGuardian')}
                  />
                  <ErrorMsg name="relationToGuardian" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Annual Income</label>
                  <input 
                    name="annualIncome" 
                    value={formData.annualIncome} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Approx Annual Income" 
                    className={getInputClass('annualIncome')}
                  />
                  <ErrorMsg name="annualIncome" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Parent Contact <span className="text-red-500">*</span></label>
                  <input 
                    type="tel"
                    name="parentContact" 
                    value={formData.parentContact} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Mobile Number" 
                    className={getInputClass('parentContact')}
                    required
                  />
                  <ErrorMsg name="parentContact" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Alternate Contact</label>
                  <input 
                    type="tel"
                    name="altContact" 
                    value={formData.altContact} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Alternate Number" 
                    className={getInputClass('altContact')}
                  />
                  <ErrorMsg name="altContact" />
                </div>
              </div>
            </section>

             {/* Section 3 */}
             <section className="border border-blue-100 rounded-xl p-5 bg-blue-50">
              {/* Gradient Section Header */}
              <h2 className="bg-gradient-to-r from-accent to-brand-green text-white p-3 rounded-lg font-bold text-lg mb-6 flex items-center gap-2 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs text-accent font-bold">3</span>
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Contact Name</label>
                  <input 
                    name="emgName" 
                    value={formData.emgName} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Name" 
                    className={getInputClass('emgName')}
                  />
                  <ErrorMsg name="emgName" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Contact Number</label>
                  <input 
                    type="tel"
                    name="emgNumber" 
                    value={formData.emgNumber} 
                    onChange={handleInputChange}
                    onBlur={handleBlur} 
                    placeholder="Mobile" 
                    className={getInputClass('emgNumber')}
                  />
                  <ErrorMsg name="emgNumber" />
                </div>
              </div>
            </section>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-bold text-sm uppercase">Required Documents</h4>
                <p className="text-yellow-700 text-sm font-medium mt-1">
                  ATTACH BIRTH CERTIFICATE/LC, ADDRESS PROOF, STUDENT AADHAR CARD TO THIS FORM.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 flex flex-col-reverse sm:flex-row items-center gap-4 border-t border-gray-100 pt-6">
            <button 
              type="button" 
              onClick={handleClear}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-red-100 text-danger hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Clear Form
            </button>
            <div className="flex-1"></div>
            
            <button 
              type="button" 
              onClick={() => setShowPreview(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border-2 border-brand-green text-brand-green hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Eye className="w-5 h-5" />
              Preview PDF
            </button>

            <button 
              type="button" 
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-accent text-white hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
          
          <p className="text-center text-xs text-muted mt-6">
            The generated PDF includes school branding, photo placeholders, and signature areas ready for printing.
          </p>
        </form>
      </div>
    </div>
  );
};