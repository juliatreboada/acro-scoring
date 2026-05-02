// src/lib/routineTypeHelpers.ts
export function getRoutineTypesForSport(sportType: 'acro' | 'rg'): string[] {
    if (sportType === 'acro') {
      return ['Balance', 'Dynamic', 'Combined']
    }
    return ['Free', 'Hoop', 'Ball', 'Clubs', 'Ribbon', 'Rope']
  }
  
  export function getRoutineTypeLabel(routineType: string, lang: 'es' | 'en'): string {
    const labels: Record<string, Record<string, string>> = {
      en: {
        Balance: 'Balance',
        Dynamic: 'Dynamic',
        Combined: 'Combined',
        Free: 'Free',
        Hoop: 'Hoop',
        Ball: 'Ball',
        Clubs: 'Clubs',
        Ribbon: 'Ribbon',
        Rope: 'Rope',
      },
      es: {
        Balance: 'Equilibrio',
        Dynamic: 'Dinámico',
        Combined: 'Combinado',
        Free: 'ML',
        Hoop: 'Aro',
        Ball: 'Pelota',
        Clubs: 'Mazas',
        Ribbon: 'Cinta',
        Rope: 'Cuerda',
      },
    }
    return labels[lang]?.[routineType] ?? routineType
  }