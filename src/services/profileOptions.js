// Rótulos exibidos no site ↔ códigos usados pela API.
// Usado no cadastro e nas páginas de perfil, para os dois falarem a mesma língua.

export const compatibilityOptionValues = {
  sleepTime: { 'Antes das 21h': 'BEFORE_21', '21h–23h': 'FROM_21_TO_23', '23h–01h': 'FROM_23_TO_01', 'Depois da 01h': 'AFTER_01' },
  studyAtHome: { Sim: 'YES', 'Às vezes': 'SOMETIMES', Não: 'NO' },
  organization: { 'Muito organizado': 'VERY_ORGANIZED', 'Mais ou menos': 'SOMEWHAT', 'Estou melhorando': 'IMPROVING' },
  visitors: { Raramente: 'RARELY', 'Às vezes': 'SOMETIMES', Frequentemente: 'FREQUENTLY' },
  smoking: { Sim: 'YES', 'Às vezes': 'SOMETIMES', Não: 'NO' },
  pets: { Sim: 'YES', Não: 'NO' },
  cleaning: { Diária: 'DAILY', Semanal: 'WEEKLY', Flexível: 'FLEXIBLE' },
  environment: { Silenciosos: 'QUIET', Movimentados: 'BUSY', Indiferente: 'INDIFFERENT' },
  lifestyle: { Tranquilo: 'CALM', Social: 'SOCIAL', Aventureiro: 'ADVENTUROUS', Estudioso: 'STUDIOUS' },
};

export const profileOptionValues = {
  gender: { Feminino: 'FEMALE', Masculino: 'MALE', 'Não binário': 'NON_BINARY', 'Prefiro não informar': 'UNDISCLOSED' },
  housingType: { República: 'REPUBLIC', Quarto: 'ROOM', Apartamento: 'APARTMENT', Casa: 'HOUSE', Kitnet: 'KITNET' },
  campusDistance: { 'Até 1 km': 'UP_TO_1_KM', '1 a 3 km': 'FROM_1_TO_3_KM', '3 a 5 km': 'FROM_3_TO_5_KM', 'Não importa': 'ANY' },
  desiredRoommates: {
    '1 pessoa (morar sozinho)': 'ALONE',
    '2 pessoas': 'TWO',
    '3 a 4 pessoas': 'THREE_TO_FOUR',
    '5 ou mais pessoas': 'FIVE_OR_MORE',
  },
  roommateGender: { Indiferente: 'ANY', Feminino: 'FEMALE', Masculino: 'MALE' },
};

const allOptionValues = { ...compatibilityOptionValues, ...profileOptionValues };

export function optionLabels(field) {
  return Object.keys(allOptionValues[field] ?? {});
}

export function toCode(field, label) {
  if (label === undefined || label === null || label === '') return null;
  return allOptionValues[field]?.[label] ?? null;
}

export function toLabel(field, code) {
  if (!code) return '';
  const entry = Object.entries(allOptionValues[field] ?? {}).find(([, value]) => value === code);
  return entry ? entry[0] : '';
}

export function makeCompatibilityAnswers(answers) {
  return Object.fromEntries(Object.entries(compatibilityOptionValues).map(([field, values]) => [
    field,
    Array.isArray(answers[field])
      ? answers[field].map((answer) => values[answer])
      : values[answers[field]],
  ]));
}

function text(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || undefined;
}

function number(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(String(value).replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function withoutEmpty(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null));
}

// Monta o bloco profileDetails do cadastro a partir das respostas do formulário.
export function makeProfileDetails(profileId, answers) {
  const common = {
    bio: text(answers.aboutMe),
    birthDate: text(answers.birthDate),
    gender: toCode('gender', answers.gender),
    country: text(answers.country),
    state: text(answers.state),
    city: text(answers.city),
  };

  if (profileId === 'proprietario') {
    return withoutEmpty({
      ...common,
      neighborhood: text(answers.neighborhood),
      postalCode: text(answers.zip),
      address: text(answers.address),
    });
  }

  const student = {
    ...common,
    university: text(answers.university),
    campus: text(answers.campus),
  };
  if (profileId !== 'estudante') return withoutEmpty(student);

  return withoutEmpty({
    ...student,
    housingType: toCode('housingType', answers.housingType),
    maxBudget: number(answers.budget),
    campusDistance: toCode('campusDistance', answers.distance),
    preferredNeighborhoods: text(answers.preferredNeighborhoods),
    desiredRoommates: toCode('desiredRoommates', answers.roommates),
    roommateGender: toCode('roommateGender', answers.roommateGender),
  });
}

export function formatBudget(value) {
  if (!value) return '';
  return `Até ${Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
}

export function parseBudget(value) {
  return number(value) ?? null;
}
