export interface UserProfileEntity {
  uid: string;
  email: string;
  profileType: 'normal' | 'professional' | 'institution';
  phone?: string;
  profileImage?: {
    url: string;
    publicId: string;
  };
  generalInfo?: {
    username: string;
    shortDescription?: string;
  };
  professionalInfo?: {
    professionalName: string;
    specialty: string;
    description?: string;
    professionalDetails?: string;
    licenseNumber?: string;
    curp?: string;
    professionalVerified?: boolean;
  };
  institutionInfo?: {
    institutionName: string;
    description?: string;
    phone?: string;
    address?: string;
    department?: string;
    facility?: string;
    email?: string;
    serviceSchedule?: {
      days?: string;
      hours?: string;
    };
  };
  createdAt?: any;
  updatedAt?: any;
}
