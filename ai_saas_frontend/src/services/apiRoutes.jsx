const API_BASE = "/api";

export const authRoutes = {
  register: `${API_BASE}/auth/`,                                 // POST → criar usuário
  login: `${API_BASE}/auth/login`,                               // POST → login
  logout: `${API_BASE}/auth/logout`,                             // POST → logout (JWT)
  verifyPassword: `${API_BASE}/auth/verify-password`,            // POST → verificar senha atual
  requestPasswordReset: `${API_BASE}/auth/request-password-reset`, // POST → solicitar link reset
  resetPassword: (token) => `${API_BASE}/auth/reset-password/${token}`, // POST → redefinir com token
};

export const emailRoutes = {
  requestEmailCode: `${API_BASE}/email/request-email-code`,      // POST → solicita código de verificação (cadastro)
  verifyEmailCode: `${API_BASE}/email/verify-email-code`,        // POST → verifica código de verificação
  sendSecurityCode: `${API_BASE}/email/send-security-code`,      // POST → envia código de segurança (JWT)
  verifySecurityCode: `${API_BASE}/email/verify-security-code`,  // POST → verifica código de segurança (JWT)
};

export const profileRoutes = {
  updatePhoto: (userId) => `${API_BASE}/users/${userId}/perfil-photo`, // PUT → atualiza foto (JWT)
  deletePhoto: (userId) => `${API_BASE}/users/${userId}/perfil-photo`, // DELETE → remove foto (JWT)
};

export const userRoutes = {
  getUser: (userId) => `${API_BASE}/users/${userId}`,            // GET user info
  updateUser: (userId) => `${API_BASE}/users/${userId}`,         // PUT update user
  deleteUser: (userId) => `${API_BASE}/users/${userId}`,         // DELETE user
  getCurrentUser: () => `${API_BASE}/users/me`,                  // GET logged user
};

export const adminRoutes = {
  listUsers: () => `${API_BASE}/admin/users`,                    // GET all users (admin only)
};

export const projectRoutes = {
  list: `${API_BASE}/projects/`,                     // GET → lista projetos do usuário logado
  create: `${API_BASE}/projects/`,                   // POST → cria projeto
  get: (projectId) => `${API_BASE}/projects/${projectId}`,        // GET → detalhes
  update: (projectId) => `${API_BASE}/projects/${projectId}`,     // PUT → atualizar
  delete: (projectId) => `${API_BASE}/projects/${projectId}`,     // DELETE → remover
  addContent: (projectId) => `${API_BASE}/projects/${projectId}/add-content`,   // POST → vincular conteúdo
  removeContent: (projectId) => `${API_BASE}/projects/${projectId}/remove-content`, // POST → desvincular conteúdo
  updateContents: (projectId) => `${API_BASE}/projects/${projectId}/update-contents`,
};

export const generatedContentRoutes = {
  list: `${API_BASE}/contents/`,                // GET → lista todos conteúdos do usuário
  create: `${API_BASE}/contents/`,              // POST → criar conteúdo gerado
  get: (contentId) => `${API_BASE}/contents/${contentId}`,   // GET → detalhes conteúdo
  delete: (contentId) => `${API_BASE}/contents/${contentId}`, // DELETE → deletar conteúdo
};

export const notificationRoutes = {
  list: `${API_BASE}/notifications`,
  create: `${API_BASE}/notifications`,
  markRead: `${API_BASE}/notifications/mark-read`, // marca todas
  markSingle: (id) => `${API_BASE}/notifications/${id}/mark-read`, // marca só 1
  delete: (id) => `${API_BASE}/notifications/${id}` // delete uma
};