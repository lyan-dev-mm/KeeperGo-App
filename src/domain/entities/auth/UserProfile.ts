export interface UserProfileEntity {
  uid: string;
  email: string;
  profileType: 'normal' | 'professional' | 'institution';
  phone?: string;
  disabled?: boolean;
  profileImage?: {
    url: string;
    publicId: string;
  };
  generalInfo?: {
    username?: string;
    nombres: string;
    primerApellido: string;
    segundoApellido: string;
    shortDescription?: string;
  };
  professionalInfo?: {
    professionalName: string;
    specialty: string;
    carrera?: string;
    description?: string;
    professionalDetails?: string;
    licenseNumber?: string;
    curp?: string;
    professionalVerified?: boolean;
    institucion?: string;
    academicDetails?: {
      nivelEducativo?: string;
      areaConocimiento?: string;
      subareaConocimiento?: string;
    };
    verification?: {
      professionalVerified: boolean;
      isHealthProfessional: boolean;
      healthCategory: string | null;
      normalizedProfession?: string;
    };
  };
  institutionInfo?: {
    institutionName: string;
    legalName?: string;
    rfc?: string;
    description?: string;
    phone?: string;
    address?: string;
    department?: string;
    facility?: string;
    email?: string;
    taxAddress?: {
      postalCode?: string;
      state?: string;
      municipality?: string;
      fullAddress?: string;
    };
    serviceSchedule?: {
      days?: string;
      hours?: string;
    };
    verification?: {
      status: 'unverified' | 'pending' | 'verified' | 'rejected';
      rfcVerified: boolean;
      legalNameVerified: boolean;
      taxAddressVerified: boolean;
      verifiedAt?: any | null;
      verificationMethod?: 'sat_api' | 'datos_non_stop' | 'manual';
      rejectionReason?: string;
    };
  };
  createdAt?: any;
  updatedAt?: any;
}