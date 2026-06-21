import type {
  Assignment,
  ChantierPhoto,
  ChantierReserve,
  ProgressUpdate,
  ReservePriority,
} from "../types/domain";
import { apiClient } from "./apiClient";

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export interface CreateAssignmentPayload {
  userId: string;
  functionLabel: string;
}

export interface CreateProgressPayload {
  comment: string;
  percent?: number;
}

export interface CreateReservePayload {
  title: string;
  description?: string;
  priority: ReservePriority;
}

export interface UploadPhotosPayload {
  files: File[];
  category: ChantierPhoto["category"];
  comment?: string;
}

export interface CreatePhotoPayload {
  fileName: string;
  category: ChantierPhoto["category"];
  comment?: string;
  fileUrl?: string;
}

export async function fetchAssignableUsers(): Promise<AssignableUser[]> {
  const { data } = await apiClient.get<AssignableUser[]>("/users/assignable");
  return data;
}

export async function fetchChantierAssignments(
  chantierId: string,
): Promise<Assignment[]> {
  const { data } = await apiClient.get<Assignment[]>(
    `/chantiers/${chantierId}/assignments`,
  );
  return data;
}

export async function fetchChantierProgress(
  chantierId: string,
): Promise<ProgressUpdate[]> {
  const { data } = await apiClient.get<ProgressUpdate[]>(
    `/chantiers/${chantierId}/progress`,
  );
  return data;
}

export async function fetchChantierReserves(
  chantierId: string,
): Promise<ChantierReserve[]> {
  const { data } = await apiClient.get<ChantierReserve[]>(
    `/chantiers/${chantierId}/reserves`,
  );
  return data;
}

export async function fetchChantierPhotos(
  chantierId: string,
): Promise<ChantierPhoto[]> {
  const { data } = await apiClient.get<ChantierPhoto[]>(
    `/chantiers/${chantierId}/photos`,
  );
  return data;
}

export async function createAssignment(
  chantierId: string,
  payload: CreateAssignmentPayload,
): Promise<Assignment> {
  const { data } = await apiClient.post<Assignment>(
    `/chantiers/${chantierId}/assignments`,
    payload,
  );
  return data;
}

export async function createProgressUpdate(
  chantierId: string,
  payload: CreateProgressPayload,
): Promise<ProgressUpdate> {
  const { data } = await apiClient.post<ProgressUpdate>(
    `/chantiers/${chantierId}/progress`,
    payload,
  );
  return data;
}

export async function createReserve(
  chantierId: string,
  payload: CreateReservePayload,
): Promise<ChantierReserve> {
  const { data } = await apiClient.post<ChantierReserve>(
    `/chantiers/${chantierId}/reserves`,
    payload,
  );
  return data;
}

export async function uploadPhotos(
  chantierId: string,
  payload: UploadPhotosPayload,
): Promise<ChantierPhoto[]> {
  const formData = new FormData();
  payload.files.forEach((file) => formData.append("files", file));
  formData.append("category", payload.category);
  if (payload.comment) {
    formData.append("comment", payload.comment);
  }
  const { data } = await apiClient.post<ChantierPhoto[]>(
    `/chantiers/${chantierId}/photos/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function deletePhoto(photoId: string): Promise<void> {
  await apiClient.delete(`/photos/${photoId}`);
}

export async function createPhoto(
  chantierId: string,
  payload: CreatePhotoPayload,
): Promise<ChantierPhoto> {
  const { data } = await apiClient.post<ChantierPhoto>(
    `/chantiers/${chantierId}/photos`,
    payload,
  );
  return data;
}

export async function takeReserveCharge(
  chantierId: string,
  reserveId: string,
): Promise<ChantierReserve> {
  const { data } = await apiClient.patch<ChantierReserve>(
    `/chantiers/${chantierId}/reserves/${reserveId}/prise-en-charge`,
  );
  return data;
}

export async function validateReserveLevee(
  chantierId: string,
  reserveId: string,
): Promise<ChantierReserve> {
  const { data } = await apiClient.patch<ChantierReserve>(
    `/chantiers/${chantierId}/reserves/${reserveId}/levee`,
  );
  return data;
}
