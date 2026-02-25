/**
 * Build payload for POST /api/ai-agents from vacancy form data.
 * Used by "Crear agente desde esta vacante" in vacancy forms.
 */

const educationLevelToMinLevel: Record<string, 'none' | 'high-school' | 'bachelor' | 'master' | 'phd'> = {
  'Secundaria': 'high-school',
  'Universitaria': 'bachelor',
  'Estudiante universitario': 'bachelor',
  'Técnico': 'high-school',
  'Master (Con Maestría)': 'master',
};

export interface VacancyFormDataLike {
  title?: string;
  mainFunctions?: string;
  requiredProfessions?: string[];
  preferredProfession?: string;
  experienceYearsMin?: string | number;
  experienceYearsMax?: string | number;
  educationLevel?: string;
  evaluationAreas?: Array<{ area?: string; percentage?: string | number }>;
  requiredSkills?: string[];
  desiredSkills?: string[];
  thresholds?: { ideal: number; potential: number; review: number };
}

export function buildAgentPayloadFromVacancy(formData: VacancyFormDataLike): {
  name: string;
  category: string;
  description: string;
  criteria: {
    experience: { weight: number; minYears: number; importance: 'low' | 'medium' | 'high' };
    technicalSkills: { weight: number; required: string[]; desired: string[]; certifications: string[] };
    education: { weight: number; minLevel: 'none' | 'high-school' | 'bachelor' | 'master' | 'phd'; required: boolean };
    softSkills: { weight: number; keySkills: string[] };
    progression: { weight: number };
  };
  thresholds: { ideal: number; potential: number; review: number };
} {
  const title = formData.title?.trim() || 'Puesto';
  const name = `Agente - ${title}`;
  const descParts = [formData.mainFunctions || ''];
  const reqProfs = Array.isArray(formData.requiredProfessions) ? formData.requiredProfessions.filter(Boolean) : [];
  if (reqProfs.length) descParts.push(`Profesiones requeridas: ${reqProfs.join(', ')}.`);
  if (formData.preferredProfession) descParts.push(`Preferible: ${formData.preferredProfession}.`);
  const minY = typeof formData.experienceYearsMin === 'number' ? formData.experienceYearsMin : parseInt(String(formData.experienceYearsMin || 0), 10) || 0;
  const maxY = typeof formData.experienceYearsMax === 'number' ? formData.experienceYearsMax : formData.experienceYearsMax;
  descParts.push(`Años de experiencia: ${minY} - ${maxY ?? 'N/A'}.`);
  const description = descParts.filter(Boolean).join(' ');

  let requiredSkills = Array.isArray(formData.requiredSkills) ? [...formData.requiredSkills] : [];
  const desiredSkills = Array.isArray(formData.desiredSkills) ? [...formData.desiredSkills] : [];
  if (requiredSkills.length === 0 && Array.isArray(formData.evaluationAreas)) {
    requiredSkills = formData.evaluationAreas.map((ea) => ea?.area?.trim()).filter(Boolean) as string[];
  } else if (Array.isArray(formData.evaluationAreas)) {
    formData.evaluationAreas.forEach((ea) => {
      const area = ea?.area?.trim();
      if (area && !requiredSkills.includes(area)) requiredSkills.push(area);
    });
  }

  const thresholds = formData.thresholds || { ideal: 80, potential: 65, review: 50 };

  return {
    name,
    category: 'otro',
    description,
    criteria: {
      experience: {
        weight: 25,
        minYears: minY,
        importance: 'medium',
      },
      technicalSkills: {
        weight: 30,
        required: requiredSkills,
        desired: desiredSkills,
        certifications: [],
      },
      education: {
        weight: 15,
        minLevel: educationLevelToMinLevel[formData.educationLevel || ''] || 'none',
        required: !!formData.educationLevel,
      },
      softSkills: {
        weight: 15,
        keySkills: [],
      },
      progression: {
        weight: 15,
      },
    },
    thresholds,
  };
}
