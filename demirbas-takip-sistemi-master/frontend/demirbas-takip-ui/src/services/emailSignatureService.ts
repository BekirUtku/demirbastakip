import api from './api';

export interface PreviewRequest {
  personnelId: number;
  locationId: number;
}

export const previewEmailSignature = async (
  data: PreviewRequest
) => {
  const response = await api.post(
    '/email-signatures/preview',
    data
  );

  return response.data;
};


export const downloadEmailSignature = async (
  data: PreviewRequest
) => {
  const response = await api.post(
    '/email-signatures/download',
    data,
    {
      responseType: 'blob',
    }
  );

  return response.data;
};