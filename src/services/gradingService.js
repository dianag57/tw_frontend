/**
 * Grading Service
 * API calls related to jury assignments and grading
 */

import api from './api';

/**
 * Get jury assignments for current user
 */
export const getJuryAssignments = async () => {
  const response = await api.get('/jury/assignments');
  return response.data;
};

/**
 * Submit evaluation
 */
export const submitEvaluation = async (juryAssignmentId, score, feedback = '') => {
  const response = await api.post('/evaluations', {
    juryAssignmentId,
    score,
    feedback,
  });
  return response.data;
};

/**
 * Get evaluation details
 */
export const getEvaluation = async (id) => {
  const response = await api.get(`/evaluations/${id}`);
  return response.data;
};
