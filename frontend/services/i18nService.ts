import { SupportedLanguage, WorkspaceTab, EventType } from '../types';

export interface LanguageMetadata {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  locale: string;
  aiPromptLanguageName: string;
}

export const SUPPORTED_LANGUAGES: LanguageMetadata[] = [
  { code: 'en', nativeName: 'English (India)', englishName: 'English', locale: 'en-IN', aiPromptLanguageName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', locale: 'hi-IN', aiPromptLanguageName: 'Hindi (Devanagari script)' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', locale: 'mr-IN', aiPromptLanguageName: 'Marathi (Devanagari script)' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', locale: 'fr-FR', aiPromptLanguageName: 'French' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', locale: 'es-ES', aiPromptLanguageName: 'Spanish' },
];

type TranslationKeys = {
  appSubtitle: string;
  newEventBtn: string;
  activeFolios: string;
  planningModules: string;
  openAiProducer: string;
  localPersistenceNotice: string;
  activeFolioLabel: string;
  aiBlueprintWizard: string;
  aiCopilot: string;
  guardrailActiveBadge: string;
  daysToCurtainCall: string;
  askAiAudit: string;
  eventDate: string;
  setting: string;
  guestList: string;
  targetCap: string;
  perGuest: string;
  financialLedger: string;
  openLedger: string;
  committedOf: string;
  utilized: string;
  buffer: string;
  overBudget: string;
  runOfShowMilestones: string;
  milestonesDone: string;
  vendorTeam: string;
  vendorsSecured: string;
  colorStoryTitle: string;
  signatureMenuTitle: string;
  inclusivityTitle: string;
  dietaryLabel: string;
  accessibilityLabel: string;
  culturalLabel: string;
  translatePlanBtn: string;
  translatingPlan: string;
  contingencyEnforcedBadge: string;
  tabNames: Record<WorkspaceTab, string>;
  eventTypeNames: Record<EventType, string>;
};

export const UI_TRANSLATIONS: Record<SupportedLanguage, TranslationKeys> = {
  en: {
    appSubtitle: 'Bespoke Indian & Global Event Atelier',
    newEventBtn: 'New Event',
    activeFolios: 'Active Event Folios',
    planningModules: 'Planning Modules',
    openAiProducer: 'Open AI Producer Desk',
    localPersistenceNotice: 'Folios auto-save locally with PromptWars Guardrails.',
    activeFolioLabel: 'Active Folio:',
    aiBlueprintWizard: 'AI Blueprint Wizard',
    aiCopilot: 'AI Copilot',
    guardrailActiveBadge: 'Guardrails Verified • 5-10% Contingency',
    daysToCurtainCall: 'days to celebration',
    askAiAudit: 'Ask AI Producer for Executive Audit',
    eventDate: 'Muhurat / Date',
    setting: 'Venue & City',
    guestList: 'Guest Count',
    targetCap: 'Total Budget Cap',
    perGuest: '/guest',
    financialLedger: 'Financial Ledger (100% Cap Lock)',
    openLedger: 'Open Ledger',
    committedOf: 'committed of',
    utilized: 'Utilized',
    buffer: 'buffer',
    overBudget: 'over cap',
    runOfShowMilestones: 'Timeline & Muhurat Cues',
    milestonesDone: 'Milestones Done',
    vendorTeam: 'Karigar & Vendor Roster',
    vendorsSecured: 'Vendors Secured',
    colorStoryTitle: 'Curated Color Story & Decor Palette',
    signatureMenuTitle: 'Signature Culinary & Feast Notes',
    inclusivityTitle: 'Cultural, Dietary & Accessibility Matrix',
    dietaryLabel: 'Dietary Accommodations (Jain / Sattvic / Vegan)',
    accessibilityLabel: 'Accessibility & Senior Care',
    culturalLabel: 'Cultural Rituals & Customs',
    translatePlanBtn: 'Translate Folio to Selected Language',
    translatingPlan: 'Translating Folio via Gemini...',
    contingencyEnforcedBadge: '5–10% Emergency Contingency Locked',
    tabNames: {
      [WorkspaceTab.OVERVIEW]: 'Overview & Blueprint',
      [WorkspaceTab.BUDGET]: 'Budget Ledger (₹)',
      [WorkspaceTab.TIMELINE]: 'Run of Show & Timeline',
      [WorkspaceTab.VENDORS]: 'Vendor & Task Checklist',
      [WorkspaceTab.STUDIO]: 'Creative AI Studio',
      [WorkspaceTab.DIAGNOSTICS]: 'Guardrails & QA Suite',
    },
    eventTypeNames: {
      [EventType.WEDDING]: 'Wedding (Vivah)',
      [EventType.BIRTHDAY]: 'Milestone Birthday',
      [EventType.COMMUNITY]: 'Community Utsav',
    },
  },
  hi: {
    appSubtitle: 'भारतीय एवं ग्लोबल उत्सव नियोजन स्टुडियो',
    newEventBtn: 'नया आयोजन',
    activeFolios: 'सक्रिय आयोजन फ़ोलियो',
    planningModules: 'नियोजन मॉड्यूल',
    openAiProducer: 'AI प्रोड्यूसर डेस्क खोलें',
    localPersistenceNotice: 'सभी योजनाएं सुरक्षा गार्डरेल्स के साथ सुरक्षित हैं।',
    activeFolioLabel: 'सक्रिय आयोजन:',
    aiBlueprintWizard: 'AI ब्लूप्रिंट विज़ार्ड',
    aiCopilot: 'AI सहायक',
    guardrailActiveBadge: 'सुरक्षा सत्यापित • 5-10% आपातकालीन निधि',
    daysToCurtainCall: 'दिन शेष',
    askAiAudit: 'AI प्रोड्यूसर से ऑडिट कराएं',
    eventDate: 'शुभ मुहूर्त / तिथि',
    setting: 'स्थान एवं शहर',
    guestList: 'अतिथि संख्या',
    targetCap: 'कुल बजट सीमा',
    perGuest: '/अतिथि',
    financialLedger: 'बजट खाता (100% संतुलित)',
    openLedger: 'बजट देखें',
    committedOf: 'आवंटित / कुल',
    utilized: 'उपयोग किया गया',
    buffer: 'शेष राशि',
    overBudget: 'बजट से अधिक',
    runOfShowMilestones: 'समय-सारणी एवं मुख्य चरण',
    milestonesDone: 'चरण पूर्ण',
    vendorTeam: 'वेंडर एवं कारीगर सूची',
    vendorsSecured: 'वेंडर बुक किए गए',
    colorStoryTitle: 'रंग संयोजन एवं सजावट पैलेट',
    signatureMenuTitle: 'विशेष व्यंजन एवं पेय मेनू',
    inclusivityTitle: 'सांस्कृतिक, आहार एवं सुगम्यता विवरण',
    dietaryLabel: 'आहार व्यवस्था (जैन / सात्विक / शाकाहारी)',
    accessibilityLabel: 'सुगम्यता एवं वरिष्ठ नागरिक सुविधा',
    culturalLabel: 'सांस्कृतिक रीति-रिवाज',
    translatePlanBtn: 'इस योजना को हिंदी में अनुवाद करें',
    translatingPlan: 'अनुवाद हो रहा है...',
    contingencyEnforcedBadge: '5–10% आपातकालीन बजट सुरक्षित',
    tabNames: {
      [WorkspaceTab.OVERVIEW]: 'अवलोकन और ब्लूप्रिंट',
      [WorkspaceTab.BUDGET]: 'बजट खाता (₹)',
      [WorkspaceTab.TIMELINE]: 'समय-सारणी (Timeline)',
      [WorkspaceTab.VENDORS]: 'वेंडर चेकलिस्ट',
      [WorkspaceTab.STUDIO]: 'क्रिएटिव AI स्टूडियो',
      [WorkspaceTab.DIAGNOSTICS]: 'सुरक्षा एवं गुणवत्ता जांच',
    },
    eventTypeNames: {
      [EventType.WEDDING]: 'विवाह समारोह',
      [EventType.BIRTHDAY]: 'जन्मदिन उत्सव',
      [EventType.COMMUNITY]: 'सामुदायिक उत्सव',
    },
  },
  mr: {
    appSubtitle: 'भारतीय आणि जागतिक सोहळा नियोजन स्टुडिओ',
    newEventBtn: 'नवीन सोहळा',
    activeFolios: 'सक्रिय सोहळा फोलिओ',
    planningModules: 'नियोजन विभाग',
    openAiProducer: 'AI प्रोड्यूसर डेस्क उघडा',
    localPersistenceNotice: 'सर्व योजना सुरक्षित गार्डरेल्ससह जतन केल्या जातात.',
    activeFolioLabel: 'सक्रिय सोहळा:',
    aiBlueprintWizard: 'AI ब्लूप्रिंट विझार्ड',
    aiCopilot: 'AI सहाय्यक',
    guardrailActiveBadge: 'सुरक्षा प्रमाणित • ५-१०% राखीव निधी',
    daysToCurtainCall: 'दिवस बाकी',
    askAiAudit: 'AI कडून आराखडा तपासा',
    eventDate: 'शुभ मुहूर्त / तारीख',
    setting: 'स्थळ आणि शहर',
    guestList: 'पाहुण्यांची संख्या',
    targetCap: 'एकूण बजेट मर्यादा',
    perGuest: '/पाहुणे',
    financialLedger: 'आर्थिक ताळेबंद (१००% संतुलित)',
    openLedger: 'बजेट उघडा',
    committedOf: 'नियोजित / एकूण',
    utilized: 'वापरलेले बजेट',
    buffer: 'शिल्लक निधी',
    overBudget: 'बजेटपेक्षा जास्त',
    runOfShowMilestones: 'वेळापत्रक आणि टप्पे',
    milestonesDone: 'टप्पे पूर्ण',
    vendorTeam: 'व्हेंडर आणि कारागीर यादी',
    vendorsSecured: 'व्हेंडर निश्चित',
    colorStoryTitle: 'रंगसंगती आणि सजावट संकल्पना',
    signatureMenuTitle: 'खास मेजवानी आणि पेये',
    inclusivityTitle: 'सांस्कृतिक, आहार आणि ज्येष्ठ नागरिक सुविधा',
    dietaryLabel: 'आहार पसंती (जैन / सात्विक / शाकाहारी)',
    accessibilityLabel: 'व्हीलचेअर आणि ज्येष्ठ नागरिक सोय',
    culturalLabel: 'सांस्कृतिक परंपरा आणि विधी',
    translatePlanBtn: 'हा आराखडा मराठीत अनुवादित करा',
    translatingPlan: 'मराठीत अनुवाद सुरू आहे...',
    contingencyEnforcedBadge: '५-१०% आकस्मिक निधी सुरक्षित',
    tabNames: {
      [WorkspaceTab.OVERVIEW]: 'मुख्य आराखडा (Overview)',
      [WorkspaceTab.BUDGET]: 'बजेट खातेवही (₹)',
      [WorkspaceTab.TIMELINE]: 'वेळापत्रक (Timeline)',
      [WorkspaceTab.VENDORS]: 'व्हेंडर यादी',
      [WorkspaceTab.STUDIO]: 'क्रिएटिव्ह AI स्टुडिओ',
      [WorkspaceTab.DIAGNOSTICS]: 'सुरक्षा आणि गुणवत्ता चाचणी',
    },
    eventTypeNames: {
      [EventType.WEDDING]: 'विवाह सोहळा',
      [EventType.BIRTHDAY]: 'वाढदिवस सोहळा',
      [EventType.COMMUNITY]: 'सार्वजनिक उत्सव',
    },
  },
  fr: {
    appSubtitle: 'Atelier de Planification Événementielle (Inde & Global)',
    newEventBtn: 'Nouvel Événement',
    activeFolios: 'Folios Événementiels Actifs',
    planningModules: 'Modules de Planification',
    openAiProducer: 'Ouvrir le Bureau IA',
    localPersistenceNotice: 'Sauvegarde locale avec garde-fous de sécurité actifs.',
    activeFolioLabel: 'Folio Actif :',
    aiBlueprintWizard: 'Assistant Blueprint IA',
    aiCopilot: 'Copilote IA',
    guardrailActiveBadge: 'Sécurité Vérifiée • 5-10% Imprévus',
    daysToCurtainCall: 'jours avant l’événement',
    askAiAudit: 'Audit Exécutif par l’IA',
    eventDate: 'Date de l’Événement',
    setting: 'Lieu & Ville',
    guestList: 'Nombre d’Invités',
    targetCap: 'Budget Plafond',
    perGuest: '/invité',
    financialLedger: 'Grand Livre Financier',
    openLedger: 'Ouvrir le Budget',
    committedOf: 'engagés sur',
    utilized: 'Utilisé',
    buffer: 'marge',
    overBudget: 'dépassement',
    runOfShowMilestones: 'Chronologie & Déroulé',
    milestonesDone: 'Étapes Terminées',
    vendorTeam: 'Prestataires & Artisans',
    vendorsSecured: 'Prestataires Réservés',
    colorStoryTitle: 'Palette de Couleurs & Atmosphère',
    signatureMenuTitle: 'Menu Signature & Gastronomie',
    inclusivityTitle: 'Inclusion Culturelle, Régimes & Accessibilité',
    dietaryLabel: 'Régimes Alimentaires (Jain / Végétalien / Sans Gluten)',
    accessibilityLabel: 'Accessibilité PMR & Aînés',
    culturalLabel: 'Rituels & Traditions Culturelles',
    translatePlanBtn: 'Traduire le Folio en Français',
    translatingPlan: 'Traduction en cours...',
    contingencyEnforcedBadge: 'Réserve d’Urgence 5–10% Verrouillée',
    tabNames: {
      [WorkspaceTab.OVERVIEW]: 'Vue d’Ensemble',
      [WorkspaceTab.BUDGET]: 'Budget (₹)',
      [WorkspaceTab.TIMELINE]: 'Planning & Déroulé',
      [WorkspaceTab.VENDORS]: 'Prestataires',
      [WorkspaceTab.STUDIO]: 'Studio Créatif IA',
      [WorkspaceTab.DIAGNOSTICS]: 'Garde-fous & Qualité',
    },
    eventTypeNames: {
      [EventType.WEDDING]: 'Mariage',
      [EventType.BIRTHDAY]: 'Anniversaire',
      [EventType.COMMUNITY]: 'Festival Communautaire',
    },
  },
  es: {
    appSubtitle: 'Atelier de Planificación de Eventos (India y Global)',
    newEventBtn: 'Nuevo Evento',
    activeFolios: 'Folios de Eventos Activos',
    planningModules: 'Módulos de Planificación',
    openAiProducer: 'Abrir Productor IA',
    localPersistenceNotice: 'Guardado local con barreras de seguridad activas.',
    activeFolioLabel: 'Folio Activo:',
    aiBlueprintWizard: 'Asistente IA',
    aiCopilot: 'Copiloto IA',
    guardrailActiveBadge: 'Seguridad Verificada • 5-10% Contingencia',
    daysToCurtainCall: 'días restantes',
    askAiAudit: 'Auditoría Ejecutiva IA',
    eventDate: 'Fecha del Evento',
    setting: 'Lugar y Ciudad',
    guestList: 'Invitados',
    targetCap: 'Presupuesto Máximo',
    perGuest: '/invitado',
    financialLedger: 'Libro Mayor de Presupuesto',
    openLedger: 'Abrir Presupuesto',
    committedOf: 'comprometidos de',
    utilized: 'Utilizado',
    buffer: 'margen',
    overBudget: 'excedido',
    runOfShowMilestones: 'Cronograma y Hitos',
    milestonesDone: 'Hitos Completados',
    vendorTeam: 'Proveedores y Artesanos',
    vendorsSecured: 'Proveedores Confirmados',
    colorStoryTitle: 'Paleta de Colores y Atmósfera',
    signatureMenuTitle: 'Menú de Autor y Bebidas',
    inclusivityTitle: 'Inclusión Cultural, Dieta y Accesibilidad',
    dietaryLabel: 'Requisitos Dietéticos (Jain / Vegano / Sin Gluten)',
    accessibilityLabel: 'Accesibilidad y Adultos Mayores',
    culturalLabel: 'Tradiciones y Rituales Culturales',
    translatePlanBtn: 'Traducir Folio al Español',
    translatingPlan: 'Traduciendo folio...',
    contingencyEnforcedBadge: 'Fondo de Contingencia 5–10% Asegurado',
    tabNames: {
      [WorkspaceTab.OVERVIEW]: 'Resumen y Plano',
      [WorkspaceTab.BUDGET]: 'Presupuesto (₹)',
      [WorkspaceTab.TIMELINE]: 'Cronograma',
      [WorkspaceTab.VENDORS]: 'Proveedores',
      [WorkspaceTab.STUDIO]: 'Estudio Creativo IA',
      [WorkspaceTab.DIAGNOSTICS]: 'Seguridad y Validación',
    },
    eventTypeNames: {
      [EventType.WEDDING]: 'Boda',
      [EventType.BIRTHDAY]: 'Cumpleaños',
      [EventType.COMMUNITY]: 'Evento Comunitario',
    },
  },
};

export function formatINR(amount: number, lang: SupportedLanguage = 'en'): string {
  const safeNum = Number.isFinite(amount) ? Math.round(amount) : 0;
  const locale = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.locale || 'en-IN';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(safeNum);
  } catch {
    return `₹${safeNum.toLocaleString('en-IN')}`;
  }
}
