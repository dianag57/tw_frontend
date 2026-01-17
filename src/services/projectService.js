/**
 * Project Service
 * API calls related to projects and deliverables
 */

import api from './api';

/**
 * Create a new project
 */
export const createProject = async (title, description) => {
  const response = await api.post('/projects', { title, description });
  return response.data;
};

/**
 * Get all user projects
 */
export const getUserProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

/**
 * Get project by ID
 */
export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

/**
 * Update project
 */
export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
};

/**
 * Activate project
 */
export const activateProject = async (id) => {
  const response = await api.post(`/projects/${id}/activate`);
  return response.data;
};

/**
 * Delete project
 */
export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

/**
 * Create deliverable
 */
export const createDeliverable = async (projectId, data) => {
  const response = await api.post(`/projects/${projectId}/deliverables`, data);
  return response.data;
};

/**
 * Get deliverable
 */
export const getDeliverable = async (id) => {
  const response = await api.get(`/projects/deliverables/${id}`);
  return response.data;
};

/**
 * Update deliverable
 */
export const updateDeliverable = async (id, data) => {
  const response = await api.put(`/projects/deliverables/${id}`, data);
  return response.data;
};

/**
 * Open deliverable for grading
 */
export const openForGrading = async (id) => {
  const response = await api.post(`/projects/deliverables/${id}/open-grading`);
  return response.data;
};

/**
 * Close deliverable grading
 */
export const closeGrading = async (id) => {
  const response = await api.post(`/projects/deliverables/${id}/close-grading`);
  return response.data;
};

/**
 * Select jury for deliverable
 */
export const selectJury = async (deliverableId, jurySize = 5) => {
  const response = await api.post(`/deliverables/${deliverableId}/select-jury`, { jurySize });
  return response.data;
};

/**
 * Get final grade
 */
export const getFinalGrade = async (deliverableId) => {
  const response = await api.get(`/deliverables/${deliverableId}/grade`);
  return response.data;
};
