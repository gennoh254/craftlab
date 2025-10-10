const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// HTTP client with interceptors
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('craftlab_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('craftlab_token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    userType: string;
  }) => apiClient.post<any>('/auth/register', userData),

  login: (credentials: { email: string; password: string }) => 
    apiClient.post<any>('/auth/login', credentials),

  logout: () => apiClient.post<any>('/auth/logout'),

  getCurrentUser: () => apiClient.get<any>('/auth/me'),

  refreshToken: () => apiClient.post<any>('/auth/refresh')
};

// Profile API
export const profileAPI = {
  getProfile: (userId: string) => apiClient.get<any>(`/profiles/${userId}`),
  
  updateProfile: (userId: string, profileData: any) =>
    apiClient.put<any>(`/profiles/${userId}`, profileData),

  uploadProfilePicture: (userId: string, file: File) =>
    apiClient.uploadFile<any>(`/profiles/${userId}/picture`, file),

  generateCV: (userId: string) => apiClient.post<any>(`/profiles/${userId}/generate-cv`),

  getPortfolio: (userId: string) => apiClient.get<any>(`/profiles/${userId}/portfolio`)
};

// Certificates API
export const certificatesAPI = {
  getCertificates: (userId: string) => apiClient.get<any>(`/certificates?userId=${userId}`),
  
  uploadCertificate: (file: File, metadata: any) =>
    apiClient.uploadFile<any>('/certificates/upload', file),

  verifyCertificate: (certificateId: string) =>
    apiClient.post<any>(`/certificates/${certificateId}/verify`),

  deleteCertificate: (certificateId: string) =>
    apiClient.delete<any>(`/certificates/${certificateId}`)
};

// Opportunities API
export const opportunitiesAPI = {
  getOpportunities: (filters?: any) => apiClient.get<any>('/opportunities'),
  
  getMatches: (userId: string) => apiClient.get<any>(`/opportunities/matches/${userId}`),
  
  applyToOpportunity: (opportunityId: string, applicationData: any) =>
    apiClient.post<any>(`/opportunities/${opportunityId}/apply`, applicationData),

  getApplications: (userId: string) => apiClient.get<any>(`/applications?userId=${userId}`)
};

// AI API
export const aiAPI = {
  analyzeProfile: (userId: string) => apiClient.post<any>(`/ai/analyze-profile/${userId}`),
  
  generateMatches: (userId: string) => apiClient.post<any>(`/ai/generate-matches/${userId}`),
  
  getInsights: (userId: string) => apiClient.get<any>(`/ai/insights/${userId}`)
};

export default apiClient;