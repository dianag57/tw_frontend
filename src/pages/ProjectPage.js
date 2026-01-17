import React, { useState, useEffect } from 'react';
import {
  createProject,
  getUserProjects,
  createDeliverable,
  updateDeliverable,
  openForGrading,
  selectJury,
  getFinalGrade,
  deleteProject,
} from '../services/projectService';
import { formatDate } from '../utils/dateUtils';
import './ProjectPage.css';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeliverableForm, setShowDeliverableForm] = useState(null);
  const [editingDeliverableId, setEditingDeliverableId] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [projectForm, setProjectForm] = useState({ title: '', description: '' });
  const [deliverableForm, setDeliverableForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    videoUrl: '',
    serverUrl: '',
  });
  const [jurySizes, setJurySizes] = useState({});
  const [finalGrades, setFinalGrades] = useState({});

  /**
   * Load projects on component mount
   */
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * Load all user projects
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError('Eroare la încărcarea proiectelor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new project
   */
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await createProject(projectForm.title, projectForm.description);
      setProjectForm({ title: '', description: '' });
      setShowCreateForm(false);
      setSuccess('Proiect creeat cu succes!');
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la crearea proiectului');
    }
  };

  /**
   * Add or update deliverable
   */
  const handleAddDeliverable = async (projectId) => {
    if (!showDeliverableForm) return;

    try {
      setError('');
      setSuccess('');
      
      // If editing an existing deliverable (only updating media)
      if (editingDeliverableId) {
        await updateDeliverable(editingDeliverableId, {
          videoUrl: deliverableForm.videoUrl || '',
          serverUrl: deliverableForm.serverUrl || '',
        });
        setSuccess('Livrabil actualizat!');
      } else {
        // Creating a new deliverable - need all fields
        const formData = {
          ...deliverableForm,
          dueDate: deliverableForm.dueDate ? new Date(deliverableForm.dueDate).toISOString() : '',
        };
        
        await createDeliverable(projectId, formData);
        setSuccess('Livrabil creat cu succes!');
      }
      
      setDeliverableForm({
        title: '',
        description: '',
        dueDate: '',
        videoUrl: '',
        serverUrl: '',
      });
      setShowDeliverableForm(null);
      setEditingDeliverableId(null);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Nu s-a putut adăuga livrabilul');
    }
  };

  /**
   * Open deliverable for grading
   */
  const handleOpenGrading = async (deliverableId) => {
    try {
      setError('');
      setSuccess('');
      await openForGrading(deliverableId);
      setSuccess('Livrabil deschis pentru evaluare!');
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Nu s-a putut deschide livrabilul pentru evaluare');
    }
  };

  /**
   * Select jury for deliverable
   */
  const handleSelectJury = async (deliverableId) => {
    try {
      setError('');
      setSuccess('');
      const size = jurySizes[deliverableId] || 5;
      await selectJury(deliverableId, size);
      setSuccess(`${size} jurați selectați`);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Nu s-a putu aleje juriu');
    }
  };

  /**
   * Get final grade for deliverable
   */
  const handleGetFinalGrade = async (deliverableId) => {
    try {
      setError('');
      const data = await getFinalGrade(deliverableId);
      setFinalGrades(prev => ({
        ...prev,
        [deliverableId]: data.gradeInfo,
      }));
    } catch (err) {
      setError('Nu s-a putut obține nota finală');
    }
  };

  /**
   * Delete project
   */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest proiect? Această acțiune nu poate fi anulată.')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await deleteProject(projectId);
      setSuccess('Proiect șters cu succes!');
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la ștergerea proiectului');
    }
  };

  if (loading) {
    return <div className="container"><div className="loading"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="container">
      <div className="projects-header">
        <h1>Proiectele Mele</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Anulează' : '+ Proiect Nou'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showCreateForm && (
        <div className="card">
          <h3>Creare Proiect Nou</h3>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label>Titlu</label>
              <input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Descriere</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-success">Creare Proiect</button>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <p>Nu ai proiecte încă. Creați unul pentru a începe!</p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div key={project.id} className="project-card card">
              <div className="project-header">
                <div>
                  <h2>{project.title}</h2>
                  <p>{project.description}</p>
                  <span className={`status status-${project.status}`}>{project.status}</span>
                </div>
                <div className="project-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  >
                    {expandedProject === project.id ? '▼' : '▶'} Detalii
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Șterge
                  </button>
                </div>
              </div>

              {expandedProject === project.id && (
                <div className="project-details">
                  <h3>Livrabil</h3>
                  {project.Deliverables && project.Deliverables.length > 0 ? (
                    <div className="deliverables-list">
                      {project.Deliverables.map(deliverable => {
                        const daysUntilDeadline = Math.ceil((new Date(deliverable.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const isDeadlineClose = daysUntilDeadline <= 3 && daysUntilDeadline > 0;
                        const isDeadlinePassed = daysUntilDeadline < 0;
                        
                        return (
                        <div key={deliverable.id} className="deliverable-item">
                          <h4>{deliverable.title}</h4>
                          <p><strong>Stare:</strong> {deliverable.status}</p>
                          <p>
                            <strong>Scadenţă:</strong> {formatDate(deliverable.dueDate)}
                            {isDeadlinePassed && <span style={{color: '#d63031', marginLeft: '0.5rem', fontWeight: 'bold'}}>❌ Deadline a expirat!</span>}
                            {isDeadlineClose && !isDeadlinePassed && <span style={{color: '#ff6b6b', marginLeft: '0.5rem'}}>⚠️ Deadline is close!</span>}
                          </p>
                          {deliverable.description && <p><strong>Descriere:</strong> {deliverable.description}</p>}
                          {deliverable.videoUrl && (
                            <p><strong>Video:</strong> <a href={deliverable.videoUrl} target="_blank" rel="noopener noreferrer">{deliverable.videoUrl}</a></p>
                          )}
                          {deliverable.serverUrl && (
                            <p><strong>Server:</strong> <a href={deliverable.serverUrl} target="_blank" rel="noopener noreferrer">{deliverable.serverUrl}</a></p>
                          )}
                          <div className="deliverable-actions">
                            {deliverable.status === 'pending' && !isDeadlinePassed && (
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setShowDeliverableForm(deliverable.id);
                                  setEditingDeliverableId(deliverable.id);
                                  setDeliverableForm({
                                    title: '',
                                    description: '',
                                    dueDate: '',
                                    videoUrl: '',
                                    serverUrl: '',
                                  });
                                }}
                              >
                                Adaugă media
                              </button>
                            )}
                            {isDeadlinePassed && (
                              <div style={{
                                padding: '10px',
                                backgroundColor: '#ffe0e0',
                                borderLeft: '4px solid #d63031',
                                marginTop: '10px',
                                borderRadius: '4px',
                                color: '#d63031',
                                fontWeight: '500'
                              }}>
                                ❌ Deadline a expirat - nu mai puteți edita această livrare!
                              </div>
                            )}
                            {deliverable.status === 'pending' && (
                              <button
                                className="btn btn-success"
                                onClick={() => handleOpenGrading(deliverable.id)}
                              >
                                Deschis pentru notare
                              </button>
                            )}
                            {deliverable.status === 'open_for_grading' && (!deliverable.JuryAssignments || deliverable.JuryAssignments.length === 0) && (
                              <>
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                  <label>Număr de jurați</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={jurySizes[deliverable.id] || 5}
                                    onChange={(e) => setJurySizes(prev => ({
                                      ...prev,
                                      [deliverable.id]: Math.max(1, parseInt(e.target.value) || 1)
                                    }))}
                                    style={{ width: '80px', padding: '5px' }}
                                  />
                                </div>
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleSelectJury(deliverable.id)}
                                >
                                  Selectează juriul
                                </button>
                              </>
                            )}
                            {deliverable.status === 'open_for_grading' && (
                              <button
                                className="btn btn-info"
                                onClick={() => handleGetFinalGrade(deliverable.id)}
                              >
                                Vezi Nota
                              </button>
                            )}
                          </div>

                          {finalGrades[deliverable.id] && (
                            <div className="grade-display">
                              <p><strong>Nota Finală:</strong> {finalGrades[deliverable.id].finalGrade || 'N/A'}</p>
                              <p><strong>Evaluări Totale:</strong> {finalGrades[deliverable.id].totalEvaluations}</p>
                            </div>
                          )}

                          {showDeliverableForm === deliverable.id && editingDeliverableId === deliverable.id && (
                            <div className="deliverable-form">
                              <h4>Adaugă media</h4>
                              <div className="form-group">
                                <label>URL Video</label>
                                <input
                                  type="url"
                                  placeholder="https://youtube.com/..."
                                  value={deliverableForm.videoUrl}
                                  onChange={(e) => setDeliverableForm({ ...deliverableForm, videoUrl: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label>URL Server</label>
                                <input
                                  type="url"
                                  placeholder="https://project.example.com"
                                  value={deliverableForm.serverUrl}
                                  onChange={(e) => setDeliverableForm({ ...deliverableForm, serverUrl: e.target.value })}
                                />
                              </div>
                              <button
                                className="btn btn-success"
                                onClick={() => handleAddDeliverable(project.id)}
                              >
                                Salvează
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowDeliverableForm(null);
                                  setEditingDeliverableId(null);
                                }}
                                style={{ marginLeft: '0.5rem' }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                        );
                        })}
                    </div>
                  ) : (
                    <p>Nu ai livrabile încă.</p>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowDeliverableForm('new');
                      setEditingDeliverableId(null);
                      setDeliverableForm({
                        title: '',
                        description: '',
                        dueDate: '',
                        videoUrl: '',
                        serverUrl: '',
                      });
                    }}
                    style={{ marginTop: '1rem' }}
                  >
                    + Adaugă livrabil
                  </button>

                  {showDeliverableForm === 'new' && (
                    <div className="deliverable-form">
                      <h4>Livrabil Nou</h4>
                      <div className="form-group">
                        <label>Titlu</label>
                        <input
                          type="text"
                          value={deliverableForm.title}
                          onChange={(e) => setDeliverableForm({ ...deliverableForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Deadline</label>
                        <input
                          type="date"
                          value={deliverableForm.dueDate}
                          onChange={(e) => setDeliverableForm({ ...deliverableForm, dueDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                        {deliverableForm.dueDate && (() => {
                          const daysUntilDeadline = Math.ceil((new Date(deliverableForm.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                          if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
                            return <p style={{color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.5rem'}}>⚠️ Deadline is close ({daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} away)</p>;
                          }
                          return null;
                        })()}
                      </div>
                      <button
                        className="btn btn-success"
                        onClick={() => handleAddDeliverable(project.id)}
                      >
                        Creare Livrabil
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeliverableForm(null);
                          setEditingDeliverableId(null);
                        }}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
