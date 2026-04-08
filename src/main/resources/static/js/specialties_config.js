const SPECIALTIES_CONFIG = {
    'GINECOLOGIA': { label: 'Ginecología', type: 'FIXED', doctor: 70000 },
    'CLINICA': { label: 'Clínica', type: 'FIXED', doctor: 50000 },
    'ECOCARDIO': { label: 'Ecocardio', type: 'FIXED', doctor: 200000 },
    'NUTRICION': { label: 'Nutrición', type: 'PERCENTAGE', doctor: 0.6 },
    'PEDIATRIA': { label: 'Pediatría', type: 'FIXED', doctor: 70000 },
    'CARDIOLOGIA': { label: 'Cardiología', type: 'FIXED', doctor: 100000 },
    'PSICOLOGIA': { label: 'Psicología', type: 'FIXED', doctor: 100000 },
    'DIABETOLOGIA': { label: 'Diabetología', type: 'FIXED', doctor: 100000 },
    'ECO_CARDIO_INFANTIL': { label: 'Eco-cardio Infantil', type: 'FIXED', doctor: 100000 },
    'DERMATOLOGIA': { label: 'Dermatología', type: 'FIXED', doctor: 100000 },
    'UROLOGIA': { label: 'Urología', type: 'FIXED', doctor: 100000 },
    'GERIATRIA': { label: 'Geriatría', type: 'FIXED', doctor: 100000 },
    'RAYOS_X': { label: 'Rayos X', type: 'PERCENTAGE', doctor: 0.5 },
    'INSPECCION_MEDICA': { label: 'Inspección Médica', type: 'FIXED', doctor: 20000 }, // 20k + 20k
    'PAP_COLPO': { label: 'Pap y Colpo', type: 'FIXED', doctor: 70000 },
    'PAP': { label: 'Pap', type: 'FIXED', doctor: 50000 },
    'ECOGRAFIA_DIARTE': {
        label: 'Ecografía (Diarte)',
        type: 'COMPLEX',
        rules: { diarte: 0.5, rodrigo: 0.4 }
    }
};
