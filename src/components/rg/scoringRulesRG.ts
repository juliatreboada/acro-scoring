export type RJPenaltyCategory = {
  id: string
  label_es: string
  label_en: string
  type: 'count' | 'bool'   // count = n × value, bool = 0 or value
  value: number             // per occurrence
  group: 'individual' | 'group' | 'both'
}

export const RJ_PENALTY_CATEGORIES: RJPenaltyCategory[] = [
  // ── Apparatus (both) ─────────────────────────────────────────────────────────
  {
    id: 'apparatus_not_placed',
    label_es: 'Por usar un aparato no colocado antes del inicio del ejercicio',
    label_en: 'Using apparatus not placed prior to the start of the exercise',
    type: 'bool', value: 0.50, group: 'both',
  },
  {
    id: 'replacement_unauthorized',
    label_es: 'Por uso no autorizado de aparato de reemplazo (el original no abandonó el área)',
    label_en: 'Unauthorized use of replacement apparatus (original apparatus did not leave the floor area)',
    type: 'bool', value: 0.50, group: 'both',
  },
  {
    id: 'replaced_apparatus_left',
    label_es: 'Aparato reemplazado o parte de él dejado en el área al final del ejercicio',
    label_en: 'Replaced apparatus, or any part of it, left on the floor area until the end of the exercise',
    type: 'bool', value: 0.30, group: 'both',
  },
  {
    id: 'unauthorized_retrieval',
    label_es: 'Por uso de aparato mediante recuperación no autorizada',
    label_en: 'Use of apparatus by an unauthorized retrieval',
    type: 'bool', value: 0.50, group: 'both',
  },

  // ── Attire / appearance (both) ────────────────────────────────────────────────
  {
    id: 'attire',
    label_es: 'Atuendo de competición no conforme a las reglas',
    label_en: 'Competition attire not according to the regulations',
    type: 'bool', value: 0.30, group: 'both',
  },
  {
    id: 'jewellery',
    label_es: 'Joyería o piercings no permitidos',
    label_en: 'Not allowed jewellery or not allowed piercings',
    type: 'bool', value: 0.30, group: 'both',
  },
  {
    id: 'hair_style',
    label_es: 'Peinado no conforme a las reglas',
    label_en: 'Hair style not conforming to the rules',
    type: 'bool', value: 0.30, group: 'both',
  },
  {
    id: 'makeup',
    label_es: 'Maquillaje no conforme a las reglas',
    label_en: 'Make-up not conforming to the rules',
    type: 'bool', value: 0.30, group: 'both',
  },
  {
    id: 'emblem_publicity',
    label_es: 'Emblema nacional o publicidad no conformes a las reglas',
    label_en: 'National emblem or publicity not conforming to the rules',
    type: 'bool', value: 0.30, group: 'both',
  },
  {
    id: 'bandages',
    label_es: 'Vendajes o soportes no conformes a las reglas',
    label_en: 'Bandages or support pieces not conforming to the rules',
    type: 'bool', value: 0.30, group: 'both',
  },

  // ── Presentation / floor conduct (both) ───────────────────────────────────────
  {
    id: 'early_late_presentation',
    label_es: 'Presentación anticipada o tardía',
    label_en: 'Early or late presentation',
    type: 'bool', value: 0.50, group: 'both',
  },
  {
    id: 'warmup_on_floor',
    label_es: 'Deportista calentando en sala / permaneciendo en el área tras el ejercicio',
    label_en: 'Gymnast(s) warming up in the competition hall or staying on/returning to the floor area after the end of the exercise',
    type: 'bool', value: 0.50, group: 'both',
  },
  {
    id: 'wrong_apparatus',
    label_es: 'Aparato incorrecto según el orden de salida',
    label_en: 'Wrong apparatus chosen according to start order',
    type: 'bool', value: 0.50, group: 'both',
  },
  {
    id: 'coach_discipline',
    label_es: 'Disciplina del entrenador',
    label_en: 'Coach discipline',
    type: 'bool', value: 0.50, group: 'both',
  },

  // ── Group only ────────────────────────────────────────────────────────────────
  {
    id: 'group_entry',
    label_es: 'Entrada del grupo al área no conforme a las reglas',
    label_en: 'Entry of the group to the floor area is not conforming to the rules',
    type: 'bool', value: 0.50, group: 'group',
  },
  {
    id: 'verbal_communication',
    label_es: 'Comunicación verbal entre deportistas del grupo durante el ejercicio',
    label_en: 'Group gymnasts communicating verbally with each other during the exercise',
    type: 'bool', value: 0.50, group: 'group',
  },
  {
    id: 'leaving_floor',
    label_es: 'Deportista del grupo abandona el área durante el ejercicio',
    label_en: 'Group gymnast leaving the floor area during the exercise',
    type: 'bool', value: 0.30, group: 'group',
  },
]

export function calcRJPenalty(
  state: Record<string, number | boolean>,
  ruleset?: 'Individual' | 'Group',
): number {
  return RJ_PENALTY_CATEGORIES
    .filter(cat => !ruleset || cat.group === 'both' || cat.group === ruleset.toLowerCase())
    .reduce((sum, cat) => {
      const val = state[cat.id]
      if (val === undefined || val === false || val === 0) return sum
      const contrib = cat.type === 'bool' ? cat.value : (val as number) * cat.value
      return sum + contrib
    }, 0)
}
