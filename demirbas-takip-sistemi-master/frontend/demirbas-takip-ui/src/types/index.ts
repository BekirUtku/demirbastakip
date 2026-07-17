export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  email: string;
  userId: number;
}

export interface AuthUser {
  token: string;
  username: string;
  fullName: string;
  email: string;
  userId: number;
}

export enum AssetStatus {
  Kayitli = 0,
  Zimmetli = 1,
  Pasif = 2,
}

export enum AssignmentStatus {
  Aktif = 0,
  IadeEdildi = 1,
}

export enum AnswerType {
  Text = 0,
  Number = 1,
  YesNo = 2,
}

export enum MailType {
  Birthday = 0,
  Test = 1,
  Custom = 2,
}

export interface CategoryQuestion {
  id: number;
  categoryId: number;
  questionText: string;
  answerType: AnswerType;
  answerTypeLabel: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  questions: CategoryQuestion[];
  assetCount: number;
  createdAt: string;
  createdByUserName: string;
}

export interface AssetAnswer {
  categoryQuestionId: number;
  questionText: string;
  answerValue?: string;
  answerType: AnswerType;
}

export interface AssignmentSummary {
  id: number;
  personnelFullName: string;
  assignedAt: string;
  returnedAt?: string;
  notes?: string;
  returnNotes?: string;
  status: string;
}

export interface Asset {
  id: number;
  barcode: string;
  name: string;
  serialNumber?: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  status: AssetStatus;
  statusLabel: string;
  answers: AssetAnswer[];
  assignmentHistory: AssignmentSummary[];
  createdAt: string;
  createdByUserName: string;
}

export interface Department {
  id: number;
  name: string;
  isActive: boolean;
  personnelCount: number;
}

export interface Company {
  id: number;
  name: string;
  companyName: string;
  logoPath?: string;
  address?: string;
  mailAddress?: string;
  isActive: boolean;
}

export interface PersonnelAssignment {
  assignmentId: number;
  assetBarcode: string;
  assetName: string;
  categoryName: string;
  assignedAt: string;
  returnedAt?: string;
  notes?: string;
  returnNotes?: string;
  status: string;
}

export interface Personnel {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  departmentId: number;
  departmentName: string;
  companyId: number;
  companyName: string;
  title?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  employmentDate?: string;
  dismissalDate?: string;
  createdAt: string;
  createdByUserName: string;
  activeAssignments: PersonnelAssignment[];
}

export interface Assignment {
  id: number;
  personnelId: number;
  personnelFullName: string;
  personnelTitle: string;
  departmentName: string;
  companyName: string;
  assetId: number;
  assetBarcode: string;
  assetName: string;
  categoryName: string;
  assignedAt: string;
  returnedAt?: string;
  notes?: string;
  returnNotes?: string;
  status: AssignmentStatus;
  statusLabel: string;
  createdByUserName: string;
  returnedByUserName?: string;
}

export interface AvailableAsset {
  id: number;
  barcode: string;
  name: string;
  categoryName: string;
  serialNumber?: string;
}

export interface DashboardSummary {
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  passiveAssets: number;
  totalPersonnel: number;
  activePersonnel: number;
  categoryCount: number;
  totalAssignments: number;
  activeAssignments: number;
}

export interface MailSettings {
  id: number;
  smtpHost: string;
  port: number;
  fromEmail: string;
  password: string;
  useSsl: boolean;
  sendTime: string;
  birthdayMailTemplate: string;
  birthdayMailSubject: string;
  adminNotificationEmail?: string;
}

export interface BirthdaySummaryItem {
  personnelName: string;
  email: string;
  isSuccess: boolean;
  errorMessage?: string;
  sentAt: string;
}

export interface BirthdaySummary {
  date?: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  items: BirthdaySummaryItem[];
}

export interface MailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  isSuccess: boolean;
  errorMessage?: string;
  sentAt: string;
  mailType: MailType;
  mailTypeLabel: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ---- Fotoğraf Tipleri ----
export enum PhotoType {
  TeslimAninda = 0,
  IadeAninda = 1,
}

export interface AssetPhoto {
  id: number;
  assetId: number;
  filePath: string;
  thumbnailPath: string;
  originalFileName: string;
  fileSizeBytes: number;
  description?: string;
  uploadedAt: string;
  uploadedByUserName: string;
}

export interface AssignmentPhoto {
  id: number;
  assignmentId: number;
  filePath: string;
  thumbnailPath: string;
  originalFileName: string;
  fileSizeBytes: number;
  description?: string;
  photoType: PhotoType;
  uploadedAt: string;
  uploadedByUserName: string;
}

// ---- Rapor Tipleri ----
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssetReportDto {
  id: number;
  barcode: string;
  name: string;
  serialNumber?: string;
  categoryName: string;
  status: string;
  createdAt: string;
  createdByUserName: string;
  currentHolder: string;
  currentHolderCompany: string;
}

export interface AssignmentReportDto {
  id: number;
  assignedAt: string;
  returnedAt?: string;
  personnelFullName: string;
  companyName: string;
  departmentName: string;
  assetName: string;
  assetBarcode: string;
  categoryName: string;
  status: string;
  notes?: string;
  returnNotes?: string;
  createdByUserName?: string;
  returnedByUserName?: string;
}

export interface CompanySummaryDto {
  companyId: number;
  companyName: string;
  activePersonnelCount: number;
  activeAssignmentCount: number;
  departments: DepartmentSummaryDto[];
}

export interface DepartmentSummaryDto {
  departmentName: string;
  personnelCount: number;
  activeAssignmentCount: number;
}

export interface CategoryStockDto {
  categoryId: number;
  categoryName: string;
  totalCount: number;
  registeredCount: number;
  assignedCount: number;
  passiveCount: number;
}

export interface OverdueAssignmentDto {
  id: number;
  assignedAt: string;
  daysHeld: number;
  personnelFullName: string;
  companyName: string;
  departmentName: string;
  assetName: string;
  assetBarcode: string;
  notes?: string;
}

export interface AuditLogDto {
  entityType: string;
  entityName: string;
  action: string;
  actionAt: string;
  userName: string;
}
