import React from 'react';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Bine ai venit!</h1>
          <p>Salut, <strong>{user?.fullName}</strong>!</p>
        </div>

        <div className="dashboard-grid">
          {user?.role === 'student' && (
            <>
              <div className="dashboard-card">
                <h3>Proiecte</h3>
                <p>Creează și gestionează proiectele tale. Trimite livrabile cu videoclipuri sau link-uri de server.</p>
                <a href="/projects" className="btn btn-primary">Mergi la Proiecte</a>
              </div>

              <div className="dashboard-card">
                <h3>Acordă note</h3>
                <p>Vizualizează atribuirile tale de juriu și trimite note anonime pentru proiecte.</p>
                <a href="/jury" className="btn btn-primary">Vezi Atribuirile</a>
              </div>
            </>
          )}

          {user?.role === 'professor' && (
            <div className="dashboard-card">
              <h3>Tablou de Bord Profesor</h3>
              <p>Vizualizează toate evaluările proiectelor.</p>
              <a href="/professor" className="btn btn-primary">Vezi Evaluări</a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
