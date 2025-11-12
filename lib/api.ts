/**
 * API client for CODIAN backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
}

export interface Assistant {
  id: string;
  assistant_type: string;
  is_active: boolean;
  custom_instructions?: string;
  system_prompt_override?: string;
  tool_config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AssistantsResponse {
  assistants?: Assistant[];
}

export interface Capability {
  id: string;
  capability_type: string;
  status: string;
  setup_completed: boolean;
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CapabilitiesResponse {
  capabilities?: Capability[];
}

export interface AnalyticsReport {
  id: string;
  report_type: string;
  title: string;
  status: string;
  summary?: string;
  insights?: any[];
  recommendations?: any[];
  metrics?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface AnalyticsReportsResponse {
  reports?: AnalyticsReport[];
}

export interface AnalyticsAskResponse {
  answer?: string;
  response?: string;
}

export interface AgentExecution {
  id: string;
  request_type: string;
  status: string;
  result?: any;
  tools_used?: string[];
  steps_executed?: any[];
  created_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface AgentExecutionsResponse {
  executions?: AgentExecution[];
}

export interface ExecuteAgentResponse {
  execution?: AgentExecution;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${API_VERSION}${endpoint}`;
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type for non-GET requests with body
    if (options.method && options.method !== 'GET' && options.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content responses (DELETE requests)
    if (response.status === 204) {
      return {} as T;
    }

    // Try to parse JSON, but handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    full_name?: string;
    tenant_id: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Tenant endpoints
  async getTenant() {
    return this.request('/tenants/me');
  }

  async updateTenant(data: any) {
    return this.request('/tenants/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Assistant endpoints
  async listAssistants(): Promise<AssistantsResponse> {
    return this.request<AssistantsResponse>('/assistants');
  }

  async getAssistant(assistantId: string) {
    return this.request(`/assistants/${assistantId}`);
  }

  async activateAssistant(assistantType: 'digital_marketer' | 'executive_assistant' | 'customer_support') {
    return this.request('/assistants/activate', {
      method: 'POST',
      body: JSON.stringify({ assistant_type: assistantType }),
    });
  }

  async deactivateAssistant(assistantId: string) {
    return this.request(`/assistants/${assistantId}/deactivate`, {
      method: 'POST',
    });
  }

  async updateAssistant(assistantId: string, data: {
    custom_instructions?: string;
    system_prompt_override?: string;
    tool_config?: Record<string, any>;
  }) {
    return this.request(`/assistants/${assistantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Chat endpoints
  async streamChat(
    assistantId: string,
    message: string,
    sessionId?: string,
    onChunk: (chunk: string) => void
  ) {
    const url = `${this.baseUrl}${API_VERSION}/chat/stream`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: message,
        assistant_id: assistantId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'message' && data.content) {
              onChunk(data.content);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }

  async listConversations(assistantId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (assistantId) {
      params.append('assistant_id', assistantId);
    }
    return this.request(`/chat/conversations?${params}`);
  }

  async getConversation(conversationId: string) {
    return this.request(`/chat/conversations/${conversationId}`);
  }

  // Document endpoints
  async uploadDocument(file: File, assistantId?: string, requiredType?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (assistantId) {
      formData.append('assistant_id', assistantId);
    }
    if (requiredType) {
      formData.append('required_type', requiredType);
    }

    const url = `${this.baseUrl}${API_VERSION}/documents/upload`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async listDocuments(assistantId?: string, status?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (assistantId) {
      params.append('assistant_id', assistantId);
    }
    if (status) {
      params.append('status', status);
    }
    return this.request(`/documents?${params}`);
  }

  // Billing endpoints
  async createPaymentIntent(planId: string, amount: number) {
    return this.request('/billing/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, amount }),
    });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId?: string) {
    return this.request('/billing/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ 
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId 
      }),
    });
  }

  async getDocument(documentId: string) {
    return this.request(`/documents/${documentId}`);
  }

  async deleteDocument(documentId: string) {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async getDocumentDownloadUrl(documentId: string, expiresIn = 3600) {
    return this.request(`/documents/${documentId}/download?expires_in=${expiresIn}`);
  }

  // Integration endpoints
  async getIntegrationStatus(assistantId?: string) {
    const params = assistantId ? `?assistant_id=${assistantId}` : '';
    return this.request(`/integrations/status${params}`);
  }

  async listIntegrations(assistantId?: string, platform?: string) {
    const params = new URLSearchParams();
    if (assistantId) params.append('assistant_id', assistantId);
    if (platform) params.append('platform', platform);
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/integrations${query}`);
  }

  async getIntegration(integrationId: string) {
    return this.request(`/integrations/${integrationId}`);
  }

  async disconnectIntegration(integrationId: string) {
    return this.request(`/integrations/${integrationId}/disconnect`, {
      method: 'POST',
    });
  }

  async deleteIntegration(integrationId: string) {
    return this.request(`/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultPage(integrationId: string, pageId: string) {
    return this.request(`/integrations/${integrationId}/default-page`, {
      method: 'PUT',
      body: JSON.stringify({ page_id: pageId }),
    });
  }

  async getOAuthInitUrl(platform: string, assistantId?: string): Promise<string> {
    const params = new URLSearchParams();
    if (assistantId) params.append('assistant_id', assistantId);
    params.append('redirect', 'false'); // Request JSON response instead of redirect
    const query = params.toString();
    
    // Make authenticated request to get OAuth URL
    const response = await this.request<{ url: string }>(`/integrations/oauth/${platform}/init?${query}`);

    if (response.url) {
      return response.url;
    }

    throw new Error('Failed to get OAuth URL');
  }

  // Capability endpoints
  async getCapabilities(assistantId: string): Promise<CapabilitiesResponse> {
    return this.request<CapabilitiesResponse>(`/assistants/${assistantId}/capabilities`);
  }

  async getCapability(capabilityId: string) {
    return this.request(`/capabilities/${capabilityId}`);
  }

  async createCapability(assistantId: string, capabilityType: string, config?: Record<string, any>) {
    return this.request(`/assistants/${assistantId}/capabilities`, {
      method: 'POST',
      body: JSON.stringify({
        capability_type: capabilityType,
        config: config || {},
      }),
    });
  }

  async setupCapability(capabilityId: string, config?: Record<string, any>) {
    return this.request(`/capabilities/${capabilityId}/setup`, {
      method: 'POST',
      body: JSON.stringify(config || {}),
    });
  }

  async getCapabilitySetupStatus(capabilityId: string) {
    return this.request(`/capabilities/${capabilityId}/setup-status`);
  }

  // Agent execution endpoints
  async executeAgent(request: {
    assistant_id: string;
    capability_id?: string;
    request_type: string;
    request_data: Record<string, any>;
  }): Promise<ExecuteAgentResponse> {
    return this.request<ExecuteAgentResponse>('/agent/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAgentExecution(executionId: string): Promise<ExecuteAgentResponse> {
    return this.request<ExecuteAgentResponse>(`/agent/executions/${executionId}`);
  }

  async listAgentExecutions(
    assistantId?: string,
    capabilityId?: string,
    statusFilter?: string,
    limit = 50,
    offset = 0
  ): Promise<AgentExecutionsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (assistantId) params.append('assistant_id', assistantId);
    if (capabilityId) params.append('capability_id', capabilityId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request<AgentExecutionsResponse>(`/agent/executions?${params}`);
  }

  async cancelAgentExecution(executionId: string) {
    return this.request(`/agent/executions/${executionId}/cancel`, {
      method: 'POST',
    });
  }

  // Content endpoints
  async createContent(capabilityId: string, request: {
    topic: string;
    platforms?: string[];
    tone?: string;
    schedule_for?: string;
  }) {
    return this.request(`/capabilities/${capabilityId}/content/create`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listContent(capabilityId: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request(`/capabilities/${capabilityId}/content?${params}`);
  }

  async getContent(contentId: string) {
    return this.request(`/content/${contentId}`);
  }

  async publishContent(contentId: string) {
    return this.request(`/content/${contentId}/publish`, {
      method: 'POST',
    });
  }

  async scheduleContent(contentId: string, scheduledFor: string) {
    return this.request(`/content/${contentId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_for: scheduledFor }),
    });
  }

  // Campaign endpoints
  async listCampaigns(statusFilter?: string) {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    return this.request(`/campaigns?${params}`);
  }

  async getCampaign(campaignId: string) {
    return this.request(`/campaigns/${campaignId}`);
  }

  async approveCampaign(campaignId: string) {
    return this.request(`/campaigns/${campaignId}/approve`, {
      method: 'POST',
    });
  }

  // Analytics endpoints
  async generateAnalyticsReport(capabilityId: string, request: {
    report_type: string;
    start_date?: string;
    end_date?: string;
    data_sources: string[];
  }) {
    return this.request(`/capabilities/${capabilityId}/analytics/generate-report`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAnalyticsDashboard(capabilityId: string) {
    return this.request(`/capabilities/${capabilityId}/analytics/dashboard`);
  }

  async askAnalytics(capabilityId: string, question: string): Promise<AnalyticsAskResponse> {
    return this.request<AnalyticsAskResponse>(`/capabilities/${capabilityId}/analytics/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async listAnalyticsReports(limit = 50, offset = 0): Promise<AnalyticsReportsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request<AnalyticsReportsResponse>(`/analytics/reports?${params}`);
  }

  async getAnalyticsReport(reportId: string) {
    return this.request(`/analytics/reports/${reportId}`);
  }

}

export const apiClient = new ApiClient(API_BASE_URL);

