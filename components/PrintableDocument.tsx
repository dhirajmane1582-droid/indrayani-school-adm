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

  // More spacious, professional styles
  const sectionHeaderClass = "font-bold text-sm uppercase border-b-2 border-gray-300 mb-4 pb-1 text-gray-800 flex items-center gap-2 mt-2";
  const sectionNumberClass = "bg-gray-800 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]";
  
  const labelClass = "text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1";
  const valueClass = "border-b border-gray-300 font-semibold text-[12px] text-black min-h-[1.6rem] flex items-end pb-0.5 px-1 w-full leading-tight";
  const fieldGroupClass = "flex flex-col mb-4";

  return (
    <div 
      id={id || "printable-form"}
      className="bg-white text-black font-sans p-[15mm] w-[210mm] min-h-[297mm] mx-auto relative box-border flex flex-col"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
        <div className="w-[25mm] h-[32mm] border-2 border-gray-300 border-dashed flex items-center justify-center bg-gray-50 rounded-sm shrink-0">
            <span className="text-[9px] text-gray-400 font-medium text-center leading-tight">Paste<br/>Passport<br/>Photo</span>
        </div>
        
        <div className="flex-1 text-center px-4">
          <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Shree Ganesh Education Academy's</h1>
          <h2 className="text-xl font-black text-gray-900 uppercase leading-none mb-1 tracking-tight">Indrayani International School</h2>
          <h2 className="text-xl font-black text-gray-900 uppercase leading-none mb-2 tracking-tight">Indrayani English Medium School</h2>
          <p className="text-[9px] text-gray-600 leading-tight">
            Sector 18, Plot No. 23-26, Near Shivajirao Patil Garden, Koparkhairane, Navi Mumbai - 400709
          </p>
          <p className="text-[9px] text-gray-600 font-medium mt-0.5">
              Tel: 8425919111 / 8422019111
          </p>
          <div className="mt-3 inline-block bg-gray-900 text-white px-6 py-1 text-xs font-bold uppercase tracking-widest rounded-sm">
            Admission Form
          </div>
        </div>

        <div className="w-[25mm] h-[25mm] shrink-0">
            <img src={logoSrc} alt="Logo" className="w-full h-full object-contain grayscale" crossOrigin="anonymous"/>
        </div>
      </div>

      {/* Office Use & Form Details */}
      <div className="mb-8 bg-gray-100 p-3 rounded-sm border border-gray-200 flex justify-between text-[11px]">
          <div className="flex gap-2 items-center">
            <span className="font-bold text-gray-600 uppercase text-[10px]">Form No:</span>
            <span className="w-20 border-b border-gray-400"></span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold text-gray-600 uppercase text-[10px]">Date:</span>
            <span className="w-24 border-b border-gray-400"></span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold text-gray-600 uppercase text-[10px]">Class Applied:</span>
            <span className="font-bold text-black border-b border-gray-400 px-3 min-w-[3rem] text-center">{data.classApply}</span>
          </div>
      </div>

      {/* 1. Student Info */}
      <section className="mb-6">
        <div className={sectionHeaderClass}>
          <span className={sectionNumberClass}>1</span>
          Student Details
        </div>
        <div className="grid grid-cols-12 gap-x-6">
          <div className={`col-span-8 ${fieldGroupClass}`}>
            <label className={labelClass}>Full Name of Student</label>
            <div className={valueClass}>{data.fullName}</div>
          </div>
          <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Aadhar Number</label>
              <div className={valueClass}>{data.studentAadharNumber}</div>
          </div>

          <div className={`col-span-3 ${fieldGroupClass}`}>
              <label className={labelClass}>Date of Birth</label>
              <div className={valueClass}>{formatDate(data.dob)}</div>
          </div>
          <div className={`col-span-3 ${fieldGroupClass}`}>
              <label className={labelClass}>Gender</label>
              <div className={valueClass}>{data.gender}</div>
          </div>
          <div className={`col-span-3 ${fieldGroupClass}`}>
              <label className={labelClass}>Place of Birth</label>
              <div className={valueClass}>{data.placeOfBirth}</div>
          </div>
          <div className={`col-span-3 ${fieldGroupClass}`}>
              <label className={labelClass}>Nationality</label>
              <div className={valueClass}>{data.nationality}</div>
          </div>

          <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Religion</label>
              <div className={valueClass}>{data.religion}</div>
          </div>
          <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Caste</label>
              <div className={valueClass}>{data.caste}</div>
          </div>
            <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Medium</label>
              <div className={valueClass}>{data.medium}</div>
          </div>

            <div className={`col-span-6 ${fieldGroupClass}`}>
              <label className={labelClass}>Previous School</label>
              <div className={valueClass}>{data.previousSchool}</div>
          </div>
            <div className={`col-span-6 ${fieldGroupClass}`}>
              <label className={labelClass}>Previous Class</label>
              <div className={valueClass}>{data.previousClass}</div>
          </div>
        </div>
      </section>

      {/* 2. Guardian Info */}
      <section className="mb-6">
        <div className={sectionHeaderClass}>
          <span className={sectionNumberClass}>2</span>
          Guardian Details
        </div>
        <div className="grid grid-cols-12 gap-x-6">
          <div className={`col-span-6 ${fieldGroupClass}`}>
            <label className={labelClass}>Father's / Guardian's Name</label>
            <div className={valueClass}>{data.fatherName}</div>
          </div>
          <div className={`col-span-6 ${fieldGroupClass}`}>
              <label className={labelClass}>Mother's Name</label>
              <div className={valueClass}>{data.motherName}</div>
          </div>

          <div className={`col-span-12 ${fieldGroupClass}`}>
              <label className={labelClass}>Residential Address</label>
              <div className={`${valueClass} min-h-[3.2rem] items-start pt-1 leading-snug`}>{data.address}</div>
          </div>

            <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Occupation</label>
              <div className={valueClass}>{data.guardianOcc}</div>
          </div>
            <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Annual Income</label>
              <div className={valueClass}>{data.annualIncome}</div>
          </div>
            <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Relation</label>
              <div className={valueClass}>{data.relationToGuardian}</div>
          </div>

          <div className={`col-span-6 ${fieldGroupClass}`}>
              <label className={labelClass}>Primary Contact</label>
              <div className={valueClass}>{data.parentContact}</div>
          </div>
          <div className={`col-span-6 ${fieldGroupClass}`}>
              <label className={labelClass}>Alternate Contact</label>
              <div className={valueClass}>{data.altContact}</div>
          </div>
        </div>
      </section>

      {/* 3. Emergency Info */}
      <section className="mb-auto">
        <div className={sectionHeaderClass}>
          <span className={sectionNumberClass}>3</span>
          Emergency Contact
        </div>
        <div className="grid grid-cols-12 gap-x-6">
            <div className={`col-span-8 ${fieldGroupClass}`}>
              <label className={labelClass}>Contact Person Name</label>
              <div className={valueClass}>{data.emgName}</div>
          </div>
            <div className={`col-span-4 ${fieldGroupClass}`}>
              <label className={labelClass}>Emergency Mobile</label>
              <div className={valueClass}>{data.emgNumber}</div>
          </div>
        </div>
      </section>

      {/* Footer / Declaration - Pushed to bottom by mb-auto on previous section if there is space */}
      <div className="mt-8">
          <div className="border-t-2 border-gray-200 pt-5">
            <h4 className="text-[11px] font-bold uppercase mb-2 text-gray-800 tracking-wide">Declaration</h4>
            <p className="text-[10px] text-justify text-gray-600 leading-relaxed mb-12">
              I hereby declare that the information provided above is correct to the best of my knowledge. I have read and understood the rules and regulations of the school and agree to abide by them. I understand that the admission is subject to the availability of seats and management's discretion.
            </p>

            <div className="flex justify-between items-end px-12 mb-6">
              <div className="flex flex-col items-center gap-2">
                  <div className="w-48 border-b border-gray-400"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Parent's Signature</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                  <div className="w-48 border-b border-gray-400"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Principal's Signature</span>
              </div>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm flex justify-between items-center">
            <p className="text-[9px] font-bold text-gray-600 uppercase">Documents Attached:</p>
            <div className="flex gap-6 text-[9px] text-gray-800 font-medium">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-400 bg-white"></div> Birth Certificate / LC</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-400 bg-white"></div> Aadhar Card</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-400 bg-white"></div> Address Proof</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-400 bg-white"></div> Photos (2)</span>
            </div>
          </div>
          
          <div className="text-center mt-2 text-[8px] text-gray-400">
             Generated via Online Portal • Indrayani International School
          </div>
      </div>
    </div>
  );
};