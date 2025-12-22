
export interface AdmissionData {
  customLogo?: string;
  // Student Info
  fullName: string;
  studentAadharNumber: string;
  medium: string;
  classApply: string;
  previousClass: string;
  previousSchool: string;
  dob: string;
  placeOfBirth: string;
  gender: string;
  nationality: string;
  religion: string;
  caste: string;

  // Guardian Info
  fatherName: string;
  motherName: string;
  address: string;
  guardianOcc: string;
  relationToGuardian: string;
  parentContact: string;
  altContact: string;
  annualIncome: string;

  // Emergency Contact
  emgName: string;
  emgNumber: string;
}

export const INITIAL_DATA: AdmissionData = {
  customLogo: '',
  fullName: '',
  studentAadharNumber: '',
  medium: '',
  classApply: '',
  previousClass: '',
  previousSchool: '',
  dob: '',
  placeOfBirth: '',
  gender: '',
  nationality: '',
  religion: '',
  caste: '',
  fatherName: '',
  motherName: '',
  address: '',
  guardianOcc: '',
  relationToGuardian: '',
  parentContact: '',
  altContact: '',
  annualIncome: '',
  emgName: '',
  emgNumber: '',
};

export const SAMPLE_DATA: AdmissionData = {
  customLogo: '',
  fullName: 'Aarav Rajesh Sharma',
  studentAadharNumber: '123456789012',
  medium: 'English',
  classApply: '5th',
  previousClass: '4th',
  previousSchool: 'Little Angels Primary School',
  dob: '2014-05-15',
  placeOfBirth: 'Pune, Maharashtra',
  gender: 'Male',
  nationality: 'Indian',
  religion: 'Hindu',
  caste: 'Maratha',
  fatherName: 'Rajesh Kumar Sharma',
  motherName: 'Priya Rajesh Sharma',
  address: 'Flat 402, Krishna Heights, Sector 19, Koparkhairane, Navi Mumbai - 400709',
  guardianOcc: 'Software Engineer',
  relationToGuardian: 'Father',
  parentContact: '9876543210',
  altContact: '9988776655',
  annualIncome: '9,00,000',
  emgName: 'Suresh Sharma',
  emgNumber: '9123456789',
};

// Default School Logo URL
export const SCHOOL_LOGO_URL = "https://i.ibb.co/qYyLwtLr/LOGO-IN.png";
