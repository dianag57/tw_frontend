/**
 * Professor Page
 * Professor view of all project evaluations
 */

import React, { useState, useEffect } from 'react';
import {
  getAllProjects,
  getProjectEvaluations,
  getDeliverableStats,
} from '../services/professorService';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import './ProfessorPage.css';

const ProfessorPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedDeliverable, setExpandedDeliverable] = useState(null);
  const [evaluationData, setEvaluationData] = useState({});
  const [statsData, setStatsData] = useState({});

  /**
   * Load all projects on mount
   */
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * Load all active projects
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load evaluations for a project
   */
  const handleLoadEvaluations = async (projectId) => {
    try {
      setError('');
      const data = await getProjectEvaluations(projectId);
      setEvaluationData(prev => ({
        ...prev,
        [projectId]: data,
      }));
    } catch (err) {
      setError('Failed to load evaluations');
    }
  };

  /**
   * Load statistics for a deliverable
   */
  const handleLoadStats = async (deliverableId) => {
    try {
      setError('');
      const data = await getDeliverableStats(deliverableId);
      setStatsData(prev => ({
        ...prev,
        [deliverableId]: data,
      }));
    } catch (err) {
      setError('Failed to load statistics');
    }
  };

  /**
   * Render score distribution chart
   */
  const renderScoreDistribution = (scores) => {
    const distribution = {};
    scores.forEach(score => {
      const rounded = Math.round(score);
      distribution[rounded] = (distribution[rounded] || 0) + 1;
    });

    return (
      <div className="score-distribution">
        {Object.keys(distribution)
          .sort((a, b) => a - b)
          .map(score => (
            <div key={score} className="distribution-bar">
              <div className="bar-label">{score}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${(distribution[score] / scores.length) * 100}%` }}
                ></div>
              </div>
              <div className="bar-count">{distribution[score]}</div>
            </div>
          ))}
      </div>
    );
  };

  if (loading) {
    return <div className="container"><div className="loading"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="container">
      <div className="professor-header">
        <h1>📊 Tablou de Bord Profesor</h1>
        <p>Evaluări Anonime Proiecte</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {projects.length === 0 ? (
        <div className="card">
          <p>Nicio proiect activ de revizuit încă.</p>
        </div>
      ) : (
        <div className="projects-review">
          {projects.map(project => (
            <div key={project.id} className="project-review-card card">
              <div className="project-review-header">
                <div>
                  <h2>{project.title}</h2>
                  <p className="created-by">Creat de: {project.creator?.fullName}</p>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setExpandedProject(expandedProject === project.id ? null : project.id);
                    if (expandedProject !== project.id) {
                      handleLoadEvaluations(project.id);
                    }
                  }}
                >
                  {expandedProject === project.id ? '▼' : '▶'} Vezi Evaluări
                </button>
              </div>

              {expandedProject === project.id && evaluationData[project.id] && (
                <div className="project-review-details">
                  {evaluationData[project.id].evaluations.map(delivEval => (
                    <div key={delivEval.deliverable.id} className="deliverable-review">
                      <div className="deliverable-review-header">
                        <div>
                          <h3>{delivEval.deliverable.title}</h3>
                          <p><strong>Stare:</strong> {delivEval.deliverable.status}</p>
                          <p><strong>Scadenţă:</strong> {formatDate(delivEval.deliverable.dueDate)}</p>
                        </div>
                        <div className="grade-summary">
                          {delivEval.finalGrade !== null && (
                            <div className={`final-grade grade-${Math.round(delivEval.finalGrade)}`}>
                              {delivEval.finalGrade.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="evaluations-list">
                        <h4>Individual Evaluations (Anonymous)</h4>
                        {delivEval.evaluations.length > 0 ? (
                          <table>
                            <thead>
                              <tr>
                                <th>Score</th>
                                <th>Submitted</th>
                                <th>Feedback</th>
                              </tr>
                            </thead>
                            <tbody>
                              {delivEval.evaluations.map((evaluation, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <span className={`score-badge score-${Math.round(evaluation.score)}`}>
                                      {evaluation.score}
                                    </span>
                                  </td>
                                  <td>{formatDateTime(evaluation.createdAt)}</td>
                                  <td>{evaluation.feedback ? evaluation.feedback.substring(0, 50) + '...' : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No evaluations yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessorPage;
