/**
 * SkillList - List of skills with optional add/delete for own profile
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import styles from './SkillList.module.css';

export default function SkillList({ userId, skills: initialSkills, onUpdate }) {
  const { user } = useAuth();
  const [skills, setSkills] = useState(initialSkills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const isOwn = user?.id === userId;

  const refresh = () => {
    if (onUpdate) onUpdate();
    else api.skills.getByUser(userId).then(setSkills);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name || loading) return;
    setLoading(true);
    try {
      await api.skills.add({ skill_name: name });
      setNewSkill('');
      refresh();
    } catch (err) {
      alert(err.error || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this skill?')) return;
    try {
      await api.skills.delete(id);
      refresh();
    } catch (err) {
      alert(err.error || 'Failed to remove skill');
    }
  };

  const list = (onUpdate ? initialSkills : skills) ?? [];

  return (
    <section className={styles.skillList}>
      <h2 className={styles.title}>Skills</h2>
      <ul className={styles.list}>
        {list.map((s) => (
          <li key={s.id} className={styles.item}>
            <span>{s.skill_name}</span>
            {isOwn && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleDelete(s.id)}
                aria-label="Remove skill"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {isOwn && (
        <form onSubmit={handleAdd} className={styles.form}>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            className={styles.input}
            maxLength={100}
          />
          <button type="submit" className={styles.addBtn} disabled={loading || !newSkill.trim()}>
            Add
          </button>
        </form>
      )}
    </section>
  );
}
