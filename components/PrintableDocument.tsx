import React from 'react';
import { AdmissionData, SCHOOL_LOGO_URL } from '../types';

interface PrintableDocumentProps {
  data: AdmissionData;
  id?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({ data, id }) => {
  const logoSrc = data.customLogo || SCHOOL_LOGO_URL;

  // Optimized design tokens for a professional, high-density single-page fit
  const sectionHeaderClass = "bg-black text-white px-3 py-1.5 font-bold text-[11px] uppercase tracking-[0.1em] mb-3 flex items-center justify-between";
  const fieldGroupClass = "mb-2 last:mb-0 border-l border-gray-200 pl-3";
  const labelClass = "text-[8.5px] font-bold text-gray-500 uppercase tracking-tight block mb-0.5";
  const valueClass = "text-[10.5px] font-semibold text-black leading-tight break-words min-h-[14px]";

  return (
    <div 
      id={id || "printable-form"}
      className="bg-white text-black font-sans w-[210mm] h-[297mm] mx-auto relative box-border flex flex-col p-[3mm] border-[4px] border-black overflow-hidden"
    >
      {/* 
          Main Inner Frame:
          - Uses flex flex-col to allow content to flow top to bottom.
          - pb-[15mm] ensures the bottom safe margin for printers.
      */}
      <div className="border border-black flex-1 flex flex-col p-[8mm] pb-[15mm] h-full">
        
        {/* 1. HEADER - School Branding */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-black shrink-0">
          <div className="w-[30mm] h-[38mm] border border-black border-dashed flex items-center justify-center bg-gray-50 shrink-0">
            <span className="text-[7.5px] text-gray-400 font-bold text-center uppercase leading-tight">Student<br/>Passport<br/>Photo</span>
          </div>
          
          <div className="flex-1 text-center px-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Shree Ganesh Education Academy's</p>
            <h1 className="text-[19px] font-black text-black uppercase leading-none tracking-tight">Indrayani International School</h1>
            <h2 className="text-[19px] font-black text-black uppercase leading-none tracking-tight mt-1.5">Indrayani English Medium School</h2>
            <div className="h-[1.5px] w-1/2 bg-black mx-auto my-3"></div>
            <p className="text-[8.5px] font-semibold leading-relaxed max-w-[420px] mx-auto text-gray-600">
              Sector 18, Plot No. 23-26, Near Shivajirao Patil Garden, Koparkhairane, Navi Mumbai 400709
              <br/>
              Contact: 8425919111 / 8422019111
            </p>
          </div>

          <div className="w-[32mm] h-[32mm] flex items-center justify-center shrink-0">
            <img src={logoSrc} alt="School Logo" className="max-w-full max-h-full object-contain grayscale" crossOrigin="anonymous"/>
          </div>
        </div>

        {/* 2. FORM TITLE AREA */}
        <div className="flex items-center justify-between bg-black text-white px-4 py-2 mb-5 shrink-0">
          <span className="text-xs font-black uppercase tracking-widest">Admission Application Form</span>
          <div className="flex gap-6 text-[9.5px] font-bold uppercase">
            <div className="flex gap-2"><span>Form No:</span><span className="border-b border-white min-w-[50px]"></span></div>
            <div className="flex gap-2"><span>Date:</span><span className="border-b border-white min-w-[70px]"></span></div>
          </div>
        </div>

        {/* 3. MAIN CONTENT FLOW - Flex-1 with grow to fill space naturally */}
        <div className="flex-1 flex flex-col space-y-4">
          
          {/* SECTION: STUDENT */}
          <section className="flex-grow">
            <div className={sectionHeaderClass}>
              <span>01. Student Profile</span>
              <span className="text-[7.5px] opacity-70">Mandatory Details</span>
            </div>
            <div className="px-1">
              <div className="mb-3 border-b border-gray-100 pb-1">
                <label className={labelClass}>Full Name of the Applicant (Block Letters)</label>
                <div className="text-[13px] font-black uppercase tracking-tight">{data.fullName || "________________________________________________"}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Aadhar Card Number</label>
                    <div className={valueClass}>{data.studentAadharNumber || 'Not Specified'}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Date of Birth</label>
                    <div className={valueClass}>{formatDate(data.dob) || 'Not Provided'}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Gender / Nationality</label>
                    <div className={valueClass}>{data.gender || '-'} / {data.nationality || 'Indian'}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Place of Birth</label>
                    <div className={valueClass}>{data.placeOfBirth || '-'}</div>
                  </div>
                </div>
                <div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Admission Class / Medium</label>
                    <div className={valueClass}>{data.classApply || '-'} / {data.medium || '-'}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Religion & Caste</label>
                    <div className={valueClass}>{data.religion} {data.caste ? `(${data.caste})` : ''}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Previous School Attended</label>
                    <div className={valueClass}>{data.previousSchool || 'N/A'}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Previous Class</label>
                    <div className={valueClass}>{data.previousClass || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: GUARDIAN */}
          <section className="flex-grow">
            <div className={sectionHeaderClass}>
              <span>02. Parent & Guardian Information</span>
            </div>
            <div className="px-1 grid grid-cols-2 gap-x-8">
              <div>
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Father's / Guardian's Full Name</label>
                  <div className={valueClass}>{data.fatherName || '__________________________'}</div>
                </div>
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Mother's Full Name</label>
                  <div className={valueClass}>{data.motherName || '__________________________'}</div>
                </div>
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Residential Address</label>
                  <div className="text-[9.5px] font-semibold leading-relaxed line-clamp-3 min-h-[30px]">{data.address || '________________________________________________'}</div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Occupation</label>
                    <div className={valueClass}>{data.guardianOcc || '-'}</div>
                  </div>
                  <div className={fieldGroupClass}>
                    <label className={labelClass}>Annual Income</label>
                    <div className={valueClass}>{data.annualIncome || 'Not Stated'}</div>
                  </div>
                </div>
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Primary Contact Number</label>
                  <div className="text-[12px] font-black">{data.parentContact || '__________'}</div>
                </div>
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Relation / Alternate Mobile</label>
                  <div className={valueClass}>{data.relationToGuardian || '-'} / {data.altContact || '-'}</div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: EMERGENCY & DOCS */}
          <div className="grid grid-cols-2 gap-x-8 flex-grow">
            <section>
              <div className={sectionHeaderClass}>
                <span>03. Emergency</span>
              </div>
              <div className="px-1 space-y-2">
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Contact Person Name</label>
                  <div className={valueClass}>{data.emgName || '________________'}</div>
                </div>
                <div className={fieldGroupClass}>
                  <label className={labelClass}>Emergency Mobile No.</label>
                  <div className="text-[11px] font-black">{data.emgNumber || '________________'}</div>
                </div>
              </div>
            </section>
            <section>
              <div className={sectionHeaderClass}>
                <span>Document Checklist</span>
              </div>
              <div className="px-1 grid grid-cols-1 gap-y-1.5 mt-1">
                {[
                  'Birth Certificate / Leaving Certificate (Original)',
                  'Student Aadhar Card (Photo Copy)',
                  'Residential Proof / Electricity Bill',
                  'Passport Size Photographs (2 Nos.)'
                ].map(doc => (
                  <div key={doc} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 border border-black shrink-0"></div>
                    <span className="text-[8.5px] font-bold text-gray-700 uppercase tracking-tight">{doc}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* 4. FOOTER AREA - Anchor declaration and signatures to the bottom */}
        <div className="shrink-0 mt-6 pt-2 border-t border-black">
          <div className="bg-gray-50 p-3 rounded-sm mb-12">
            <h4 className="text-[9px] font-black uppercase mb-1 underline">Declaration:</h4>
            <p className="text-[9px] text-justify text-gray-600 leading-tight italic">
              I hereby declare that the information provided in this form is true to the best of my knowledge. I agree to comply with all school rules and regulations. I understand that admission is provisional and subject to document verification by the management.
            </p>
          </div>

          <div className="flex justify-between items-end px-4 mb-6">
            <div className="flex flex-col items-start">
              <div className="w-48 h-[1px] bg-black mb-1.5"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Signature of Parent</span>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="w-48 h-[1px] bg-black mb-1.5"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Principal's Signature</span>
            </div>
          </div>

          {/* Bottom Branding Bar */}
          <div className="text-center pt-3 border-t border-gray-100">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-800">
              GENERATED VIA ONLINE PORTAL INDRAYANI SCHOOL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};