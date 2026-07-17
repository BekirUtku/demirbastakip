export interface EmailSignaturePreview {
  html: string;
  personnelName: string;
  companyName: string;
}

export interface SignatureLocation {
  id: number;
  type: string;
  name: string;
  displayName: string;
  addressLine1?: string;
  addressLine2?: string;
  lokumPhone?: string;
  ogasPhone?: string;
  isActive: boolean;
}

export interface EmailSignatureRequest {
  personnelId: number;
  locationId: number;
}

export interface GeneratedSignatureFile {
  fileName: string;
  contentType: string;
  data: string;
}