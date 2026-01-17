import React, { useState, useEffect } from 'react';
import { getJuryAssignments, submitEvaluation } from '../services/gradingService';
import { formatDate } from '../utils/dateUtils';
import './JuryPage.css';

const JuryPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  // Form state
  const [evaluationForm, setEvaluationForm] = useState({
    juryAssignmentId: null,
    score: '',
    feedback: '',
  });

  /**
   * Load jury assignments on mount
   */
  useEffect(() => {
    loadAssignments();
  }, []);

  /**
   * Load jury assignments
   */
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getJuryAssignments();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError('Failed to load jury assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit or update evaluation
   */
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (!evaluationForm.score) {
        setError('Nota e necesară');
        return;
      }

      await submitEvaluation(
        evaluationForm.juryAssignmentId,
        parseFloat(evaluationForm.score),
        evaluationForm.feedback || null
      );

      setSuccess('Evaluare trimisă!');
      setEvaluationForm({ juryAssignmentId: null, score: '', feedback: '' });
      setExpandedAssignment(null);
      loadAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la trimitere');
    }
  };

  /**
   * Open evaluation form
   */
  const handleOpenEvaluation = (assignmentId, existingScore = null, existingFeedback = '') => {
    setEvaluationForm({
      juryAssignmentId: assignmentId,
      score: existingScore || '',
      feedback: existingFeedback,
    });
    setExpandedAssignment(assignmentId);
  };

  if (loading) {
    return <div className="container"><div className="loading"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="container">
      <div className="jury-header">
        <h1>Atribuiri Jury</h1>
        <p>Evaluează anonim proiectele atribuite ție</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {assignments.length === 0 ? (
        <div className="card">
          <p>Nicio atribuire încă. Vei fi notificat atunci când proiectele necesită evaluare.</p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map(assignment => (
            <div key={assignment.id} className="assignment-card card">
              <div className="assignment-header">
                <div>
                  <h2>{assignment.deliverable?.project?.title}</h2>
                  <p><strong>Titlu:</strong> {assignment.deliverable?.title}</p>
                  <p><strong>Deadline:</strong> {formatDate(assignment.deliverable?.dueDate)}</p>
                  <span className={`status status-${assignment.status}`}>
                    {assignment.status === 'assigned' ? 'În Așteptare Evaluare' : 'Evaluat'}
                  </span>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (expandedAssignment === assignment.id) {
                      setExpandedAssignment(null);
                    } else {
                      setExpandedAssignment(assignment.id);
                      handleOpenEvaluation(assignment.id);
                    }
                  }}
                >
                  {expandedAssignment === assignment.id ? '▼' : '▶'} Details
                </button>
              </div>

              {expandedAssignment === assignment.id && (
                <div className="assignment-details">
                  <div className="deliverable-links">
                    {assignment.deliverable?.videoUrl && (
                      <a href={assignment.deliverable.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Vizionare video
                      </a>
                    )}
                    {assignment.deliverable?.serverUrl && (
                      <a href={assignment.deliverable.serverUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Vizită server
                      </a>
                    )}
                  </div>

                  <div className="evaluation-form-section">
                    <h3>Trimite evaluare</h3>
                    <form onSubmit={handleSubmitEvaluation}>
                      <div className="form-group">
                        <label htmlFor="score">Nota (1-10)</label>
                        <div className="score-input">
                          <input
                            type="number"
                            id="score"
                            min="1"
                            max="10"
                            step="0.01"
                            value={evaluationForm.score}
                            onChange={(e) => setEvaluationForm({ ...evaluationForm, score: parseFloat(e.target.value) || '' })}
                            required
                            placeholder="8.5"
                          />
                          <span className="score-display">
                            {evaluationForm.score && (
                              <span className={`score-badge score-${Math.floor(evaluationForm.score)}`}>
                                {evaluationForm.score}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="feedback">Feedback (Opțional)</label>
                        <textarea
                          id="feedback"
                          value={evaluationForm.feedback}
                          onChange={(e) => setEvaluationForm({ ...evaluationForm, feedback: e.target.value })}
                          placeholder="Furnizează feedback constructiv pentru echipă..."
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-success">
                        Trimite evaluare
                      </button>
                    </form>

                    {assignment.Evaluation && (
                      <div className="previous-evaluation">
                        <h4>Evaluarea ta anterioară</h4>
                        <p><strong>Nota:</strong> {assignment.Evaluation.score}</p>
                        {assignment.Evaluation.feedback && (
                          <p><strong>Feedback:</strong> {assignment.Evaluation.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JuryPage;
