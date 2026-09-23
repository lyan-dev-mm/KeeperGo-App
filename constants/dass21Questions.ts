
export interface DASS21Question {
  numero: number;
  afirmacion: string;
}

export const DASS21_QUESTIONS: DASS21Question[] = [
  { numero: 1, afirmacion: 'Me ha costado mucho descargar la tensión' },
  { numero: 2, afirmacion: 'Me di cuenta que tenía la boca seca' },
  { numero: 3, afirmacion: 'No podía sentir ningún sentimiento positivo' },
  { numero: 4, afirmacion: 'Se me hizo difícil respirar' },
  { numero: 5, afirmacion: 'Se me hizo difícil tomar la iniciativa para hacer cosas' },
  { numero: 6, afirmacion: 'Reaccioné exageradamente en ciertas situaciones' },
  { numero: 7, afirmacion: 'Sentí que mis manos temblaban' },
  { numero: 8, afirmacion: 'He sentido que estaba gastando una gran cantidad de energía' },
  { numero: 9, afirmacion: 'Estaba preocupado por situaciones en las cuales podía tener pánico o en las que podría hacer el ridículo' },
  { numero: 10, afirmacion: 'He sentido que no había nada que me ilusionara' },
  { numero: 11, afirmacion: 'Me he sentido inquieto' },
  { numero: 12, afirmacion: 'Se me hizo difícil relajarme' },
  { numero: 13, afirmacion: 'Me sentí triste y deprimido' },
  { numero: 14, afirmacion: 'No toleré nada que no me permitiera continuar con lo que estaba haciendo' },
  { numero: 15, afirmacion: 'Sentí que estaba al punto de pánico' },
  { numero: 16, afirmacion: 'No me pude entusiasmar por nada' },
  { numero: 17, afirmacion: 'Sentí que valía muy poco como persona' },
  { numero: 18, afirmacion: 'He tendido a sentirme enfadado con facilidad' },
  { numero: 19, afirmacion: 'Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico' },
  { numero: 20, afirmacion: 'Tuve miedo sin razón' },
  { numero: 21, afirmacion: 'Sentí que la vida no tenía ningún sentido' },
];

export const DASS21_OPTIONS = [
  { value: 0, label: 'No me ha ocurrido' },
  { value: 1, label: 'Me ha ocurrido un poco, o durante parte del tiempo' },
  { value: 2, label: 'Me ha ocurrido bastante, o durante una buena parte del tiempo' },
  { value: 3, label: 'Me ha ocurrido mucho, o la mayor parte del tiempo' },
];