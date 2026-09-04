import { useEffect, useState } from 'react';
import type { Role } from '../../data/types';

const roles: { role: Role; label: string; evidence: string }[] = [
  { role: 'student', label: 'Student', evidence: 'Students are the source for perceived clarity, the learning experience, engagement, whether resources were reachable and feedback usable, and satisfaction.' },
  { role: 'faculty', label: 'Lecturer', evidence: 'Lecturers are the source for what is actually done in teaching and assessment: methods, technology used, feedback practice, and the constraints on it.' },
  { role: 'institution', label: 'Academic / Administrative Staff', evidence: 'Administrators are the source for curriculum governance, declared provision and access barriers, moderation, monitoring and quality-assurance process.' },
];

const defaultHint = 'Each role is positioned to provide evidence the others cannot. Your selection determines the instrument; it does not change the model.';

export const RoleSelect = ({ onSelect }: { onSelect: (r: Role) => void }) => {
  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < roles.length) onSelect(roles[i].role);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSelect]);
  return (
    <div className="column">
      <p className="section-label">Role selection</p>
      <h1 className="screen-title">How are you participating in this review?</h1>
      <div className="role-grid">
        {roles.map((r) => (
          <button
            key={r.role}
            type="button"
            className="role-card"
            onClick={() => onSelect(r.role)}
            onMouseEnter={() => setHint(r.evidence)}
            onMouseLeave={() => setHint(null)}
            onFocus={() => setHint(r.evidence)}
            onBlur={() => setHint(null)}
          >
            <span className="role-card__name">{r.label}</span>
          </button>
        ))}
      </div>
      <p className="role-hint" aria-live="polite">
        {hint ?? defaultHint}
      </p>
    </div>
  );
};
