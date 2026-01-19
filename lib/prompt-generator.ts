// Generador automático de system prompts para agentes de IA

export interface AgentFormData {
  name: string;
  category: string;
  description?: string;
  criteria: {
    experience: {
      weight: number;
      minYears: number;
      importance: 'low' | 'medium' | 'high';
    };
    technicalSkills: {
      weight: number;
      required: string[];
      desired: string[];
      certifications: string[];
    };
    education: {
      weight: number;
      minLevel: 'none' | 'high-school' | 'bachelor' | 'master' | 'phd';
      required: boolean;
    };
    softSkills: {
      weight: number;
      keySkills: string[];
    };
    progression: {
      weight: number;
    };
  };
  thresholds: {
    ideal: number;
    potential: number;
    review: number;
  };
}

// Mapeo de niveles educativos a texto legible
const educationLevelMap: Record<string, string> = {
  'none': 'Sin requisito específico',
  'high-school': 'Preparatoria',
  'bachelor': 'Licenciatura',
  'master': 'Maestría',
  'phd': 'Doctorado'
};

// Mapeo de importancia a descripción
const importanceMap: Record<string, string> = {
  'low': 'Baja - Se valora pero no es crítica',
  'medium': 'Media - Importante pero flexible',
  'high': 'Alta - Crítica para el puesto'
};

// Mapeo de categorías a contexto especializado
const categoryContextMap: Record<string, string> = {
  'desarrollo': 'Desarrollo de Software y Tecnología',
  'gerencia': 'Liderazgo y Gestión de Proyectos',
  'diseño': 'Diseño UX/UI y Creatividad',
  'marketing': 'Marketing Digital y Estrategia',
  'finanzas': 'Contabilidad y Finanzas',
  'rrhh': 'Recursos Humanos y Reclutamiento',
  'operaciones': 'Operaciones y Logística',
  'soporte': 'Soporte Técnico y Atención al Cliente',
  'otro': 'Evaluación General'
};

export function generateSystemPrompt(agentData: AgentFormData): string {
  const { name, category, description, criteria, thresholds } = agentData;
  
  // Contexto del agente
  const categoryContext = categoryContextMap[category] || categoryContextMap['otro'];
  const agentContext = description || `Evaluación de candidatos para el rol de ${name}`;
  
  // Construir sección de experiencia
  const experienceSection = buildExperienceSection(criteria.experience);
  
  // Construir sección de habilidades técnicas
  const technicalSkillsSection = buildTechnicalSkillsSection(criteria.technicalSkills);
  
  // Construir sección de educación
  const educationSection = buildEducationSection(criteria.education);
  
  // Construir sección de habilidades blandas
  const softSkillsSection = buildSoftSkillsSection(criteria.softSkills);
  
  // Construir sección de progresión
  const progressionSection = buildProgressionSection(criteria.progression);
  
  // Construir sección de clasificación
  const classificationSection = buildClassificationSection(thresholds);
  
  // Construir notas importantes
  const importantNotes = buildImportantNotes(criteria, category);
  
  // Ensamblar el prompt completo
  const prompt = `Eres un Agente de Reclutamiento Especializado en ${categoryContext}.

ROL ESPECÍFICO: ${name}
${description ? `CONTEXTO: ${description}` : ''}

METODOLOGÍA DE EVALUACIÓN (Total: 100 puntos):

${experienceSection}

${technicalSkillsSection}

${educationSection}

${softSkillsSection}

${progressionSection}

${classificationSection}

${importantNotes}

IMPORTANTE - FORMATO DE RESPUESTA:
Responde SOLO con un JSON válido en este formato (sin texto adicional, sin markdown, solo JSON):
{
  "score": 85,
  "classification": "ideal",
  "summary": "El candidato tiene experiencia sólida en...",
  "strengths": ["Fortaleza 1", "Fortaleza 2"],
  "concerns": ["Preocupación 1", "Preocupación 2"]
}

Asegúrate de que:
- El score sea un número entero entre 0 y 100
- La classification sea exactamente: "ideal", "potential", "review" o "no-fit"
- El summary sea un texto descriptivo de 2-3 oraciones
- strengths y concerns sean arrays de strings con al menos 1 elemento cada uno`;

  return prompt;
}

function buildExperienceSection(experience: AgentFormData['criteria']['experience']): string {
  const { weight, minYears, importance } = experience;
  const importanceDesc = importanceMap[importance];
  
  let section = `1. EXPERIENCIA RELEVANTE (${weight} puntos):`;
  
  if (minYears > 0) {
    section += `\n   - ${minYears}+ años de experiencia: ${Math.round(weight * 0.8)} pts`;
    section += `\n   - ${Math.max(1, minYears - 2)}-${minYears} años: ${Math.round(weight * 0.5)} pts`;
    section += `\n   - <${Math.max(1, minYears - 2)} años: ${Math.round(weight * 0.2)} pts`;
  } else {
    section += `\n   - Experiencia relevante: ${Math.round(weight * 0.8)} pts`;
    section += `\n   - Proyectos personales/portafolio: ${Math.round(weight * 0.5)} pts`;
    section += `\n   - Sin experiencia pero con potencial: ${Math.round(weight * 0.2)} pts`;
  }
  
  section += `\n   - Importancia: ${importanceDesc}`;
  section += `\n   - Evalúa proyectos similares, tecnologías relevantes y crecimiento profesional`;
  
  return section;
}

function buildTechnicalSkillsSection(technicalSkills: AgentFormData['criteria']['technicalSkills']): string {
  const { weight, required, desired, certifications } = technicalSkills;
  
  let section = `2. HABILIDADES TÉCNICAS (${weight} puntos):`;
  
  if (required.length > 0) {
    const requiredWeight = Math.round(weight * 0.6);
    const perSkillWeight = Math.round(requiredWeight / required.length);
    section += `\n   - Skills obligatorios (${requiredWeight} pts total):`;
    required.forEach((skill, index) => {
      section += `\n     • ${skill}: ${perSkillWeight} pts`;
    });
    section += `\n     • Si falta algún skill obligatorio: -${Math.round(requiredWeight * 0.3)} pts por cada uno`;
  } else {
    section += `\n   - Skills técnicos relevantes: ${Math.round(weight * 0.6)} pts`;
  }
  
  if (desired.length > 0) {
    const desiredWeight = Math.round(weight * 0.3);
    const perDesiredWeight = Math.round(desiredWeight / desired.length);
    section += `\n   - Skills deseables (${desiredWeight} pts total, bonus):`;
    desired.forEach((skill) => {
      section += `\n     • ${skill}: +${perDesiredWeight} pts`;
    });
  }
  
  if (certifications.length > 0) {
    const certWeight = Math.round(weight * 0.1);
    const perCertWeight = Math.max(1, Math.round(certWeight / certifications.length));
    section += `\n   - Certificaciones relevantes (${certWeight} pts total, bonus):`;
    certifications.forEach((cert) => {
      section += `\n     • ${cert}: +${perCertWeight} pts`;
    });
  }
  
  if (required.length === 0 && desired.length === 0 && certifications.length === 0) {
    section += `\n   - Evalúa habilidades técnicas generales relevantes al puesto`;
  }
  
  return section;
}

function buildEducationSection(education: AgentFormData['criteria']['education']): string {
  const { weight, minLevel, required } = education;
  const levelText = educationLevelMap[minLevel] || minLevel;
  
  let section = `3. EDUCACIÓN (${weight} puntos):`;
  
  if (required) {
    section += `\n   - ${levelText} OBLIGATORIO: ${Math.round(weight * 0.9)} pts`;
    section += `\n   - Sin ${levelText}: 0 pts (descalificante)`;
  } else {
    section += `\n   - ${levelText} o superior: ${Math.round(weight * 0.8)} pts`;
    
    // Calcular niveles inferiores
    const levelOrder = ['none', 'high-school', 'bachelor', 'master', 'phd'];
    const currentIndex = levelOrder.indexOf(minLevel);
    if (currentIndex > 0) {
      const lowerLevel = levelOrder[currentIndex - 1];
      section += `\n   - ${educationLevelMap[lowerLevel]}: ${Math.round(weight * 0.5)} pts`;
    }
    
    section += `\n   - Autodidacta con portafolio/proyectos: ${Math.round(weight * 0.4)} pts`;
    section += `\n   - Bootcamp o cursos especializados: ${Math.round(weight * 0.3)} pts`;
  }
  
  return section;
}

function buildSoftSkillsSection(softSkills: AgentFormData['criteria']['softSkills']): string {
  const { weight, keySkills } = softSkills;
  
  let section = `4. HABILIDADES BLANDAS (${weight} puntos):`;
  
  if (keySkills.length > 0) {
    const perSkillWeight = Math.round(weight / keySkills.length);
    section += `\n   - Evalúa las siguientes habilidades clave:`;
    keySkills.forEach((skill) => {
      section += `\n     • ${skill}: ${perSkillWeight} pts`;
    });
    section += `\n   - Busca evidencia en descripción de proyectos, logros y experiencia`;
  } else {
    section += `\n   - Evalúa habilidades blandas generales: comunicación, trabajo en equipo, adaptabilidad`;
    section += `\n   - Busca evidencia en la experiencia y logros del candidato`;
  }
  
  return section;
}

function buildProgressionSection(progression: AgentFormData['criteria']['progression']): string {
  const { weight } = progression;
  
  return `5. PROGRESIÓN PROFESIONAL (${weight} puntos):
   - Crecimiento constante en roles anteriores: ${Math.round(weight * 0.5)} pts
   - Estabilidad laboral (2+ años por empresa): +${Math.round(weight * 0.2)} pts
   - Ascensos y responsabilidades crecientes: +${Math.round(weight * 0.2)} pts
   - Logros medibles y resultados cuantificables: +${Math.round(weight * 0.1)} pts`;
}

function buildClassificationSection(thresholds: AgentFormData['thresholds']): string {
  const { ideal, potential, review } = thresholds;
  
  return `CLASIFICACIÓN:
- ${ideal}-100 = "ideal" → Candidato excepcional, cumple todos los requisitos y más. Entrevistar inmediatamente.
- ${potential}-${ideal - 1} = "potential" → Buen candidato, cumple la mayoría de requisitos. Considerar para segunda ronda.
- ${review}-${potential - 1} = "review" → Candidato con potencial pero con áreas de mejora. Revisar manualmente.
- 0-${review - 1} = "no-fit" → No cumple requisitos mínimos. No proceder con el proceso.`;
}

function buildImportantNotes(criteria: AgentFormData['criteria'], category: string): string {
  let notes = 'NOTAS IMPORTANTES:';
  
  // Notas basadas en importancia de experiencia
  if (criteria.experience.importance === 'high') {
    notes += '\n- La experiencia es CRÍTICA para este puesto. Prioriza candidatos con experiencia relevante.';
  } else if (criteria.experience.importance === 'low') {
    notes += '\n- La experiencia es flexible. Valora el potencial y la capacidad de aprendizaje.';
  }
  
  // Notas basadas en educación
  if (criteria.education.required) {
    notes += `\n- El nivel educativo (${educationLevelMap[criteria.education.minLevel]}) es OBLIGATORIO.`;
  }
  
  // Notas basadas en skills técnicos
  if (criteria.technicalSkills.required.length > 0) {
    notes += `\n- Skills obligatorios: ${criteria.technicalSkills.required.join(', ')}. La falta de estos reduce significativamente el score.`;
  }
  
  // Notas específicas por categoría
  switch (category) {
    case 'desarrollo':
      notes += '\n- Prioriza experiencia práctica y portafolio sobre títulos académicos.';
      notes += '\n- Valora proyectos reales, contribuciones open-source y capacidad de resolver problemas técnicos.';
      break;
    case 'gerencia':
      notes += '\n- Busca evidencia de liderazgo, gestión de equipos y resultados medibles.';
      notes += '\n- Valora experiencia con presupuestos, plazos y stakeholders.';
      break;
    case 'diseño':
      notes += '\n- El portafolio es CRÍTICO. Evalúa calidad, proceso y versatilidad.';
      notes += '\n- Valora capacidad de justificar decisiones de diseño y trabajo colaborativo.';
      break;
    case 'marketing':
      notes += '\n- Busca resultados medibles: ROI, conversiones, métricas de campañas.';
      notes += '\n- Valora experiencia con herramientas de analytics y data-driven decision making.';
      break;
    case 'finanzas':
      notes += '\n- La precisión y cumplimiento normativo son críticos.';
      notes += '\n- Valora experiencia con cierres, auditorías y software contable.';
      break;
    case 'rrhh':
      notes += '\n- La confidencialidad y ética profesional son fundamentales.';
      notes += '\n- Valora experiencia en reclutamiento, relaciones laborales y desarrollo organizacional.';
      break;
  }
  
  notes += '\n- Sé objetivo y específico en las fortalezas y preocupaciones.';
  notes += '\n- Considera el potencial de crecimiento y adaptabilidad.';
  
  return notes;
}
