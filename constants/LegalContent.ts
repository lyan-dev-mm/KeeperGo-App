export const LAST_UPDATED = '[fecha]';

export interface LegalSection {
  heading: string;
  body: string;
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: '1. Aceptación de los términos',
    body: 'Al crear una cuenta o utilizar la aplicación KeeperGo ("la app", "el Servicio"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la app.\n\nEstos Términos, junto con nuestra Política de Privacidad, forman el acuerdo completo entre tú y [tu nombre / nombre del equipo] ("nosotros", "KeeperGo").',
  },
  {
    heading: '2. Descripción del servicio',
    body: 'KeeperGo es una aplicación móvil de bienestar personal que ofrece:\n\n• Registro de estado de ánimo\n• Ejercicios de respiración guiada\n• Sistema de racha de días activos con una mascota virtual\n• Funciones adicionales que se irán agregando con el tiempo\n\nKeeperGo no es un servicio médico ni de salud mental profesional. Las funciones de la app son herramientas de autoayuda y bienestar general, no un sustituto de terapia, diagnóstico o tratamiento psicológico/psiquiátrico. Si estás pasando por una crisis emocional o de salud mental, busca ayuda de un profesional o de los servicios de emergencia de tu localidad.',
  },
  {
    heading: '3. Elegibilidad y registro de cuenta',
    body: 'Debes tener al menos 13 años para crear una cuenta. Si tienes entre 13 y 18 años, se recomienda el conocimiento de un padre, madre o tutor.\n\nAl registrarte, aceptas proporcionar información verídica (nombre, correo electrónico) y mantenerla actualizada.\n\nEres responsable de mantener la confidencialidad de tu contraseña y de toda actividad que ocurra en tu cuenta. Si sospechas de un uso no autorizado de tu cuenta, contáctanos de inmediato.',
  },
  {
    heading: '4. Uso aceptable',
    body: 'Al usar KeeperGo, te comprometes a NO:\n\n• Usar la app con fines ilegales o no autorizados\n• Intentar acceder a cuentas de otros usuarios sin permiso\n• Interferir con el funcionamiento normal de la app (ingeniería inversa, bots, ataques automatizados)\n• Subir contenido ofensivo, difamatorio o que incite al odio o la violencia\n• Suplantar la identidad de otra persona\n\nNos reservamos el derecho de suspender o eliminar cuentas que incumplan estas reglas.',
  },
  {
    heading: '5. Contenido generado por el usuario',
    body: 'Los registros de ánimo, notas o cualquier texto que ingreses en la app son de tu propiedad. Sin embargo, nos otorgas una licencia limitada para almacenar y procesar esa información con el único fin de brindarte el Servicio (por ejemplo, mostrarte tu historial de ánimo).\n\nNo compartimos tu contenido personal con otros usuarios ni lo hacemos público, salvo que tú mismo decidas compartirlo.',
  },
  {
    heading: '6. Propiedad intelectual',
    body: 'El nombre "KeeperGo", el diseño, los logotipos, los personajes (como la mascota virtual) y el código de la aplicación son propiedad de [tu nombre / nombre del equipo], salvo el contenido de terceros usado bajo licencia.\n\nNo puedes copiar, modificar, distribuir o crear trabajos derivados de la app sin autorización previa por escrito, salvo lo permitido por la ley aplicable.',
  },
  {
    heading: '7. Disponibilidad del servicio',
    body: 'Hacemos nuestro mejor esfuerzo para mantener KeeperGo disponible y funcionando correctamente, pero no garantizamos que el servicio esté libre de interrupciones, errores o tiempos de inactividad. Podemos modificar, suspender o discontinuar funciones de la app en cualquier momento, con o sin previo aviso.',
  },
  {
    heading: '8. Exclusión de garantías',
    body: 'KeeperGo se ofrece "tal cual" y "según disponibilidad". No garantizamos que la app cumplirá con todas tus expectativas ni que estará libre de errores.\n\nEn la medida permitida por la ley aplicable, no somos responsables por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la app.',
  },
  {
    heading: '9. Limitación de responsabilidad',
    body: 'KeeperGo es un proyecto de desarrollo/académico. En la medida permitida por la ley, nuestra responsabilidad total ante cualquier reclamo relacionado con el uso de la app se limita a lo mínimo exigido por la legislación aplicable.\n\nImportante: ninguna función de la app debe usarse como sustituto de atención médica o psicológica profesional. No somos responsables de decisiones que tomes basándote únicamente en el contenido de la app.',
  },
  {
    heading: '10. Terminación de cuenta',
    body: 'Puedes eliminar tu cuenta en cualquier momento desde la configuración de la app. Nosotros también podemos suspender o eliminar tu cuenta si incumples estos Términos.\n\nAl eliminar tu cuenta, tus datos se manejarán conforme a lo descrito en nuestra Política de Privacidad.',
  },
  {
    heading: '11. Cambios a estos términos',
    body: 'Podemos actualizar estos Términos y Condiciones ocasionalmente. Si el cambio es significativo, te lo notificaremos dentro de la app antes de que entre en vigor. El uso continuado de KeeperGo después de un cambio implica tu aceptación de los nuevos términos.',
  },
  {
    heading: '12. Ley aplicable',
    body: 'Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos, sin perjuicio de los derechos que la legislación de tu país de residencia pueda otorgarte si resides fuera de México.',
  },
  {
    heading: '13. Contacto',
    body: 'Si tienes preguntas sobre estos Términos y Condiciones, contáctanos en:\n\nCorreo: [tu correo de contacto]\nResponsable: [tu nombre / nombre del equipo]',
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: 'Resumen',
    body: 'KeeperGo ("nosotros", "la aplicación") es una aplicación móvil de bienestar y hábitos que te ayuda a registrar tu estado de ánimo, mantener una racha de días activos y acceder a ejercicios de respiración guiada. Esta Política de Privacidad describe qué información recopilamos, cómo la usamos, con quién la compartimos y cuáles son tus derechos sobre ella.',
  },
  {
    heading: '1. Quiénes somos',
    body: 'KeeperGo es desarrollada por [tu nombre / nombre del equipo], con domicilio en [ciudad, estado, país]. Puedes contactarnos en [correo de contacto].',
  },
  {
    heading: '2. Información que recopilamos',
    body: 'Información que tú nos proporcionas: nombre completo, correo electrónico, contraseña, fecha de nacimiento (opcional), y tus registros de ánimo, sesiones de respiración y racha.\n\nInformación automática: identificador único de cuenta, fecha de creación y último acceso, y datos técnicos básicos del dispositivo.\n\nNo recopilamos: ubicación GPS, contactos, cámara/micrófono sin tu permiso, ni datos biométricos.',
  },
  {
    heading: '3. Cómo usamos tu información',
    body: 'Usamos tus datos únicamente para: crear y mantener tu cuenta, autenticarte al iniciar sesión, personalizar tu experiencia (saludo, racha, historial de ánimo), mejorar el funcionamiento de la app, y responder tus consultas de soporte.\n\nNo usamos tu información para tomar decisiones automatizadas que te afecten legalmente.',
  },
  {
    heading: '4. Con quién compartimos tu información',
    body: 'No vendemos ni alquilamos tu información personal. Solo la compartimos con:\n\n• Firebase (Google LLC): nuestro proveedor de autenticación y almacenamiento\n• Autoridades competentes, solo si la ley nos obliga\n\nNunca la compartimos con anunciantes ni la usamos para publicidad segmentada.',
  },
  {
    heading: '5. Cookies y tecnologías de rastreo',
    body: 'Actualmente KeeperGo no utiliza cookies de rastreo ni tecnologías de publicidad. Si esto cambia, actualizaremos esta sección y te lo notificaremos.',
  },
  {
    heading: '6. Retención de datos',
    body: 'Conservamos tu información mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos de perfil y registros se eliminan de forma permanente, salvo que la ley nos obligue a conservar información mínima.',
  },
  {
    heading: '7. Seguridad',
    body: 'Tu contraseña se almacena cifrada mediante Firebase Authentication. La comunicación entre la app y nuestros servidores está cifrada (HTTPS). Ningún sistema es 100% infalible; usa una contraseña única y no la compartas con nadie.',
  },
  {
    heading: '8. Tus derechos (Derechos ARCO)',
    body: 'Si resides en México, tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al uso de tus datos personales. Para ejercerlos, escríbenos a [correo de contacto].\n\nSi resides en otro país, es posible que tengas derechos adicionales según tu legislación local (por ejemplo, RGPD o CCPA).',
  },
  {
    heading: '9. Menores de edad',
    body: 'KeeperGo no está dirigida a menores de 13 años. Si tienes entre 13 y 18 años, te recomendamos usar la app con el conocimiento de un padre, madre o tutor.',
  },
  {
    heading: '10. Transferencias internacionales',
    body: 'Como usamos Firebase (Google LLC), es posible que tus datos se almacenen en servidores fuera de tu país. Google mantiene sus propias medidas de protección de datos conforme a estándares internacionales.',
  },
  {
    heading: '11. Cambios a esta política',
    body: 'Podemos actualizar esta Política ocasionalmente. Publicaremos la fecha de "última actualización" y, si el cambio es relevante, te avisaremos dentro de la app.',
  },
  {
    heading: '12. Contacto',
    body: 'Correo: [keppergo@gmail.xyz]\nResponsable: [KeeperGo]',
  },
];