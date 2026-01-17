/**
 * Professor Service
 * API calls for professor-specific views
 */

import api from './api';

/**
 * Get all projects
 */
export const getAllProjects = async () => {
  const response = await api.get('/professor/projects');
  return response.data;
};

/**
 * Get project evaluations
 */
export const getProjectEvaluations = async (projectId) => {
  const response = await api.get(`/professor/projects/${projectId}/evaluations`);
  return response.data;
};

/**
 * Get deliverable statistics
 */
export const getDeliverableStats = async (deliverableId) => {
  const response = await api.get(`/professor/deliverables/${deliverableId}/stats`);
  return response.data;
};
