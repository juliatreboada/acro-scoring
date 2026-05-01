import type { Lang } from './types'

type Question = {
  text: string
  description: string
}

type Section = {
  name: string
  questions: Question[]
}

const SECTIONS_EN: Section[] = [
  {
    name: 'Partnership',
    questions: [
      {
        text: 'Is there an acceptable level of maturity between all partners?',
        description: 'Correspondence in terms of stage of biological and physiological development of an athlete, including musculoskeletal growth, hormonal status and neuromuscular coordination and its influence on the partnerships coherence and the athletes` ability to perform equally.',
      },
      {
        text: 'Is there a good level of technical and physical preparation between all partners?',
        description: 'Degree of capability and proportionality between partners to perform properly the technical and choreographic elements of the routine.',
      },
      {
        text: 'Is there a visible consistent connection between all partners?',
        description: 'Ability to interact and communicate effectively during choreography, demonstrating complicity and emotional coherence throughout the performance.',
      },
    ],
  },
  {
    name: 'Performance',
    questions: [
      {
        text: 'Is there a continuous flow and parts of perfect synchronization?',
        description: 'Ability to seamlessly connect movements and choreographic sequences with one another as well as with elements of difficulty, creating a continuous, unified, and natural flow. Include well-performed synchronized movements in the exercise.',
      },
      {
        text: 'Do all partners have great amplitude in the exercise?',
        description: 'Referring to the body extension and range of choreographic movements, using the greatest range of motion/space possible or using subtlety and nuance as indicated by the music.',
      },
      {
        text: 'Is the Choreography original and create a personal identity?',
        description: 'Way the partners combine all aspects of the exercise and establish a connection with the audience and judges and/or convey a story or message in a distinctive style. The athletes and the exercise are memorable. Emphasis on the performance of choreography, imagination, originality, and inventiveness are valued.',
      },
    ],
  },
  {
    name: 'Expression',
    questions: [
      {
        text: 'Do all partners project the correct emotion of the exercise?',
        description: 'The degree of projected emotion by the competitors, in harmony with the character of the choreography and the mood of the music. Emotion should be created through body language and movements, choreography and facial expression with the mood of performance. Extreme facial expressions, lip syncing, and violence are forbidden and not considered expression.',
      },
      {
        text: 'Is there harmony of the expression between all partners?',
        description: 'Partners` ability to harmoniously integrate body, facial and emotional expression with musical and choreographic components AND with each other. Collectively, the partners should maintain interpretive coherence throughout the routine, without generating a strange, illogical or superficial interpretation, regardless of how it is executed.',
      },
      {
        text: 'Do they maintain the emotion throughout the exercise?',
        description: 'Partners` ability to consistently maintain interpretive projected emotion stability throughout the exercise. Emotion Intensity duration',
      },
    ],
  },
  {
    name: 'Creativity',
    questions: [
      {
        text: 'Do they show a variety of elements and perform rarely staged elements?',
        description: 'Athletes show different types of elements - points of support, body positions in balance and dynamic elements, levels, direction, start or ending position, transition - within an exercise. Includes elements with great visual impact and little seen. Element variety may include pair-group and individual elements.',
      },
      {
        text: 'Do they show originality and inventiveness in the overall exercise?',
        description: 'Imagination, originality, inventiveness, inspiration in the ROUTINE, with its own style that distinguishes it from others and that presents numerous movements, combinations and new and creative concepts that have not been seen before, without repetitive movements.',
      },
      {
        text: 'Do they have special/different way(s) to get in and out of elements?',
        description: 'Entrances to and exits from elements should be smooth and flow easily, while demonstrating variety, creativity and originality.',
      },
    ],
  },
  {
    name: 'Musicality',
    questions: [
      {
        text: 'Is the exercise respecting the character and the mood of the music?',
        description: 'Choreography should reflect the style, rhythm, and energy of the music through the movements and dynamics of the gymnasts. The mood of music refers to the emotions and feelings that music is intended to evoke.',
      },
      {
        text: 'Are the musical sentences, accents and the rhythm respected and used throughout?',
        description: 'Choreographic movements should correlate, starting and ending in sync, with the musical phrases to create a sense of coherence between the music and the choreography/elements in an exercise. Accents in the music should match with choreographic and technical movements that highlight the dynamics of the music.',
      },
      {
        text: 'Is the choreography in harmony with the music?',
        description: 'Connection between the choreographic movements and the music, creating a harmonized and powerful performance.',
      },
    ],
  },
]

const SECTIONS_ES: Section[] = [
    {
      name: 'Asociación',
      questions: [
        {
          text: '¿Existe un nivel aceptable de madurez entre todos los compañeros?',
          description: 'Correspondencia en términos de etapa de desarrollo biológico y fisiológico de un atleta, incluyendo el crecimiento musculoesquelético, el estado hormonal y la coordinación neuromuscular, y su influencia en la coherencia de la asociación y en la capacidad de los atletas para rendir de manera equitativa.',
        },
        {
          text: '¿Existe un buen nivel de preparación técnica y física entre todos los compañeros?',
          description: 'Grado de capacidad y proporcionalidad entre los compañeros para ejecutar correctamente los elementos técnicos y coreográficos de la rutina.',
        },
        {
          text: '¿Existe una conexión consistente y visible entre todos los compañeros?',
          description: 'Capacidad para interactuar y comunicarse de manera efectiva durante la coreografía, demostrando complicidad y coherencia emocional a lo largo de la actuación.',
        },
      ],
    },
    {
      name: 'Actuación',
      questions: [
        {
          text: '¿Existe un flujo continuo y partes de sincronización perfecta?',
          description: 'Capacidad para conectar sin problemas los movimientos y las secuencias coreográficas entre sí, así como con los elementos de dificultad, creando un flujo continuo, unificado y natural. Incluye movimientos sincronizados bien ejecutados en el ejercicio.',
        },
        {
          text: '¿Todos los compañeros tienen una gran amplitud en el ejercicio?',
          description: 'Refiriéndose a la extensión corporal y al rango de los movimientos coreográficos, utilizando el mayor rango de movimiento/espacio posible o utilizando sutileza y matices según lo indique la música.',
        },
        {
          text: '¿Es la coreografía original y crea una identidad personal?',
          description: 'La forma en que los compañeros combinan todos los aspectos del ejercicio y establecen una conexión con el público y los jueces y/o transmiten una historia o mensaje con un estilo distintivo. Los atletas y el ejercicio son memorables. Se valora el énfasis en la actuación de la coreografía, la imaginación, la originalidad y el ingenio.',
        },
      ],
    },
    {
      name: 'Expresión',
      questions: [
        {
          text: '¿Todos los compañeros proyectan la emoción correcta del ejercicio?',
          description: 'El grado de emoción proyectada por los competidores, en armonía con el carácter de la coreografía y el estado de ánimo de la música. La emoción debe crearse a través del lenguaje corporal y los movimientos, la coreografía y la expresión facial acordes con el estado de ánimo de la actuación. Las expresiones faciales extremas, la sincronización labial y la violencia están prohibidas y no se consideran expresión.',
        },
        {
          text: '¿Existe armonía de la expresión entre todos los compañeros?',
          description: 'Capacidad de los compañeros para integrar armoniosamente la expresión corporal, facial y emocional con los componentes musicales y coreográficos Y entre ellos. Colectivamente, los compañeros deben mantener una coherencia interpretativa a lo largo de la rutina, sin generar una interpretación extraña, ilógica o superficial, independientemente de cómo se ejecute.',
        },
        {
          text: '¿Mantienen la emoción a lo largo del ejercicio?',
          description: 'Capacidad de los compañeros para mantener consistentemente la estabilidad de la emoción interpretativa proyectada a lo largo del ejercicio. Duración de la intensidad de la emoción.',
        },
      ],
    },
    {
      name: 'Creatividad',
      questions: [
        {
          text: '¿Muestran una variedad de elementos y realizan elementos poco habituales?',
          description: 'Los atletas muestran diferentes tipos de elementos - puntos de apoyo, posiciones corporales en equilibrio y elementos dinámicos, niveles, dirección, posición inicial o final, transición - dentro de un ejercicio. Incluye elementos de gran impacto visual y poco vistos. La variedad de elementos puede incluir elementos de pareja-grupo e individuales.',
        },
        {
          text: '¿Muestran originalidad e inventiva en el ejercicio en general?',
          description: 'Imaginación, originalidad, inventiva, inspiración en la RUTINA, con un estilo propio que la distingue de otras y que presenta numerosos movimientos, combinaciones y conceptos nuevos y creativos que no se han visto antes, sin movimientos repetitivos.',
        },
        {
          text: '¿Tienen forma(s) especial(es) o diferente(s) de entrar y salir de los elementos?',
          description: 'Las entradas y salidas de los elementos deben ser suaves y fluir con facilidad, demostrando variedad, creatividad y originalidad.',
        },
      ],
    },
    {
      name: 'Musicalidad',
      questions: [
        {
          text: '¿Respeta el ejercicio el carácter y el estado de ánimo de la música?',
          description: 'La coreografía debe reflejar el estilo, el ritmo y la energía de la música a través de los movimientos y las dinámicas de las gimnastas. El estado de ánimo de la música se refiere a las emociones y sentimientos que la música pretende evocar.',
        },
        {
          text: '¿Se respetan y utilizan las frases musicales, los acentos y el ritmo en todo momento?',
          description: 'Los movimientos coreográficos deben correlacionarse, comenzando y terminando en sincronía, con las frases musicales para crear una sensación de coherencia entre la música y la coreografía/los elementos en un ejercicio. Los acentos en la música deben coincidir con los movimientos coreográficos y técnicos que resalten la dinámica de la música.',
        },
        {
          text: '¿Está la coreografía en armonía con la música?',
          description: 'Conexión entre los movimientos coreográficos y la música, creando una actuación armonizada y poderosa.',
        },
      ],
    },
  ]

export function getSections(lang: Lang): Section[] {
  return lang === 'es' ? SECTIONS_ES : SECTIONS_EN
}

export function getQuestionValues(questionIndex: number): { red: 0; yellow: number; green: number } {
  if (questionIndex === 0) return { red: 0, yellow: 0.2, green: 0.4 }
  return { red: 0, yellow: 0.1, green: 0.3 }
}

export function calcSectionScore(answers: Record<string, number>, sectionIndex: number): number {
  const q0 = answers[`${sectionIndex}:0`] ?? null
  const q1 = answers[`${sectionIndex}:1`] ?? null
  const q2 = answers[`${sectionIndex}:2`] ?? null
  const answered = [q0, q1, q2].filter((v) => v !== null) as number[]
  if (answered.length === 0) return 0
  return parseFloat((answered.reduce((s, v) => s + v, 0) + 1).toFixed(2))
}

export function calcTotal(answers: Record<string, number>): number {
  let total = 0
  for (let s = 0; s < 5; s++) {
    const q0 = answers[`${s}:0`] ?? null
    const q1 = answers[`${s}:1`] ?? null
    const q2 = answers[`${s}:2`] ?? null
    if (q0 !== null && q1 !== null && q2 !== null) {
      total += q0 + q1 + q2 + 1
    }
  }
  return parseFloat(total.toFixed(2))
}
