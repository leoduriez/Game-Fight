import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import characterService from '../services/characterService';
import CharacterTable from '../src/components/admin/CharacterTable';
import CharacterForm from '../src/components/admin/CharacterForm';
import Modal from '../src/components/ui/Modal';
import Button from '../src/components/ui/Button';

const AdminDashboard = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await characterService.getAllCharacters();
      setCharacters(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des personnages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCharacter(null);
    setIsModalOpen(true);
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCharacter) {
        await characterService.updateCharacter(editingCharacter._id, formData);
        setSuccessMessage('Personnage modifié avec succès !');
      } else {
        await characterService.createCharacter(formData);
        setSuccessMessage('Personnage créé avec succès !');
      }
      
      setIsModalOpen(false);
      setEditingCharacter(null);
      await loadCharacters();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
      return;
    }

    try {
      await characterService.deleteCharacter(id);
      setSuccessMessage('Personnage supprimé avec succès !');
      await loadCharacters();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (character) => {
    try {
      if (character.isActive) {
        await characterService.deactivateCharacter(character._id);
        setSuccessMessage('Personnage désactivé avec succès !');
      } else {
        await characterService.updateCharacter(character._id, { isActive: true });
        setSuccessMessage('Personnage activé avec succès !');
      }
      
      await loadCharacters();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🛠️ Dashboard Administrateur</h1>
        <Button onClick={handleCreate} variant="primary">
          <Plus size={20} />
          Créer un personnage
        </Button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : (
        <CharacterTable
          characters={characters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCharacter ? 'Modifier le personnage' : 'Créer un personnage'}
        size="large"
      >
        <CharacterForm
          character={editingCharacter}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
