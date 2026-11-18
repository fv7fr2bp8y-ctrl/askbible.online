// Темите за SEO страниците /temas/<slug>/.
// Стиховете са референции; текстът се взема при билд от public/bible (Reina-Valera 1909).
// Формат на референцията: "Код Глава:Стих" или "Код Глава:Стих-Стих" (кодовете са имената на файловете).

export const topics = [
  {
    slug: 'ansiedad',
    phrase: 'la ansiedad',
    h1: 'Versículos sobre la ansiedad',
    question: '¿Qué dice la Biblia cuando siento ansiedad?',
    intro:
      'La ansiedad llega sin avisar: una preocupación por el trabajo, por la salud, por la familia o por el futuro. La Biblia no la ignora. Una y otra vez invita a llevar cada carga a Dios en oración y a recibir a cambio una paz que no depende de las circunstancias. Estos versículos de la Reina-Valera 1909 te acompañan en los días en que la mente no se detiene.',
    refs: ['Phil 4:6-7', '1Pet 5:7', 'Matt 6:34', 'Ps 55:22', 'Isa 41:10', 'Ps 94:19', 'John 14:27', 'Matt 11:28-30', 'Ps 46:1', 'Prov 12:25'],
    rel: ['miedo', 'paz', 'oracion', 'consuelo'],
  },
  {
    slug: 'miedo',
    phrase: 'el miedo',
    h1: 'Versículos sobre el miedo',
    question: '¿Qué dice la Biblia para cuando tengo miedo?',
    intro:
      '«No temas» es una de las frases que más se repiten en la Biblia. Dios la dice a pastores, a reyes, a profetas y a gente sencilla que enfrentaba lo desconocido. El miedo es humano, pero no tiene la última palabra. Estos versículos recuerdan que no caminas solo y que hay una presencia más grande que cualquier amenaza.',
    refs: ['Isa 41:10', 'Ps 23:4', 'Ps 27:1', '2Tim 1:7', 'Josh 1:9', 'Ps 56:3', 'Deut 31:6', 'Ps 34:4', '1John 4:18', 'Isa 43:1'],
    rel: ['ansiedad', 'proteccion', 'fortaleza', 'animo'],
  },
  {
    slug: 'paz',
    phrase: 'la paz',
    h1: 'Versículos sobre la paz',
    question: '¿Cómo encuentro paz según la Biblia?',
    intro:
      'La paz de la que habla la Biblia no es solo la ausencia de problemas. Es una calma interior que guarda el corazón en medio de la tormenta, un descanso que nace de confiar en Dios. Jesús la llamó «mi paz» y la dejó como regalo a los suyos. Lee estos versículos despacio y deja que hagan su obra.',
    refs: ['John 14:27', 'Phil 4:7', 'Isa 26:3', 'Num 6:24-26', 'Rom 5:1', 'Ps 4:8', 'Col 3:15', 'John 16:33', 'Ps 29:11', 'Matt 5:9'],
    rel: ['ansiedad', 'esperanza', 'consuelo', 'oracion'],
  },
  {
    slug: 'perdon',
    phrase: 'el perdón',
    h1: 'Qué dice la Biblia sobre el perdón',
    question: '¿Cómo puedo perdonar a alguien que me hizo daño?',
    intro:
      'El perdón está en el centro del mensaje bíblico: Dios perdona, y quien ha sido perdonado aprende a perdonar. No siempre es fácil ni inmediato, pero libera a quien lo da tanto como a quien lo recibe. Aquí tienes versículos sobre el perdón de Dios y sobre perdonar a los demás, en la versión Reina-Valera 1909.',
    refs: ['Eph 4:32', 'Col 3:13', 'Matt 6:14-15', '1John 1:9', 'Ps 103:12', 'Mic 7:18', 'Luke 6:37', 'Matt 18:21-22', 'Isa 1:18', 'Ps 86:5'],
    rel: ['amor', 'ira', 'salvacion', 'familia'],
  },
  {
    slug: 'amor',
    phrase: 'el amor',
    h1: 'Versículos sobre el amor',
    question: '¿Qué dice la Biblia sobre el amor verdadero?',
    intro:
      '«Dios es amor», dice el apóstol Juan. Toda la Biblia puede leerse como la historia de ese amor que busca, espera y no se rinde. De él nace el amor entre esposos, entre amigos y hacia el prójimo. Estos versículos hablan del amor de Dios por ti y del amor que estamos llamados a vivir.',
    refs: ['1Cor 13:4-7', 'John 3:16', '1John 4:7-8', 'Rom 8:38-39', 'John 15:13', '1John 4:19', '1Pet 4:8', 'Rom 5:8', 'Jer 31:3', 'Col 3:14'],
    rel: ['matrimonio', 'amistad', 'perdon', 'familia'],
  },
  {
    slug: 'fe',
    phrase: 'la fe',
    h1: 'Versículos sobre la fe',
    question: '¿Cómo puedo fortalecer mi fe?',
    intro:
      'La fe es confiar en Dios aun cuando no se ve el camino completo. La Biblia la describe como la certeza de lo que se espera y muestra que incluso una fe pequeña, como un grano de mostaza, puede mover montañas. Estos versículos alimentan la fe en los días de duda y en los de alegría.',
    refs: ['Heb 11:1', 'Heb 11:6', 'Rom 10:17', 'Mark 11:22-24', 'Matt 17:20', '2Cor 5:7', 'Eph 2:8', 'Jas 2:17', 'Mark 9:23', 'Rom 1:17'],
    rel: ['esperanza', 'oracion', 'salvacion', 'fortaleza'],
  },
  {
    slug: 'esperanza',
    phrase: 'la esperanza',
    h1: 'Versículos de esperanza',
    question: '¿Qué dice la Biblia para cuando pierdo la esperanza?',
    intro:
      'Cuando todo parece cerrado, la Biblia habla de un Dios que tiene planes de bien y no de mal, y de misericordias que se renuevan cada mañana. La esperanza bíblica no es optimismo vacío: es un ancla firme para el alma. Estos versículos son para levantar la mirada.',
    refs: ['Jer 29:11', 'Rom 15:13', 'Lam 3:22-23', 'Isa 40:31', 'Rom 5:3-5', 'Ps 42:11', 'Heb 6:19', 'Ps 39:7', 'Rom 8:28', 'Prov 23:18'],
    rel: ['animo', 'fe', 'tristeza', 'proposito'],
  },
  {
    slug: 'fortaleza',
    phrase: 'la fortaleza',
    h1: 'Versículos de fortaleza',
    question: '¿Dónde encuentro fuerzas cuando ya no puedo más?',
    intro:
      'Hay días en que las fuerzas se acaban. La Biblia no pide fingir lo contrario: reconoce el cansancio y promete que Dios da esfuerzo al cansado y multiplica las fuerzas del que no tiene ninguna. Estos versículos sobre la fortaleza son para los momentos difíciles.',
    refs: ['Phil 4:13', 'Isa 40:29', 'Neh 8:10', 'Ps 18:2', '2Cor 12:9', 'Ps 73:26', 'Eph 6:10', 'Ps 28:7', 'Isa 12:2', 'Hab 3:19'],
    rel: ['animo', 'miedo', 'paciencia', 'esperanza'],
  },
  {
    slug: 'consuelo',
    phrase: 'el consuelo',
    h1: 'Versículos de consuelo',
    question: '¿Qué versículo me puede consolar hoy?',
    intro:
      'La Biblia llama a Dios «Padre de misericordias y Dios de toda consolación». Él está cerca de los quebrantados de corazón y no pasa de largo ante el dolor. Si estás atravesando una pérdida o una herida, estos versículos de consuelo pueden ser compañía.',
    refs: ['2Cor 1:3-4', 'Ps 34:18', 'Matt 5:4', 'Isa 66:13', 'Ps 23:4', 'Ps 119:50', 'John 14:18', 'Rev 21:4', 'Isa 51:12', 'Ps 147:3'],
    rel: ['duelo', 'tristeza', 'soledad', 'paz'],
  },
  {
    slug: 'tristeza',
    phrase: 'la tristeza',
    h1: 'Versículos para la tristeza',
    question: '¿Qué dice la Biblia cuando estoy triste?',
    intro:
      'Los salmos están llenos de lágrimas: David y otros autores escribieron con honestidad sobre el abatimiento del alma. La Biblia no esconde la tristeza, pero promete que el llanto puede durar una noche y que a la mañana vendrá la alegría. Estos versículos son para los días grises.',
    refs: ['Ps 30:5', 'Ps 34:17-18', 'Ps 42:11', 'John 16:22', 'Isa 61:3', 'Ps 126:5', 'Ps 40:1-2', '2Cor 4:8-9', 'Ps 147:3', 'Matt 11:28'],
    rel: ['consuelo', 'esperanza', 'soledad', 'animo'],
  },
  {
    slug: 'soledad',
    phrase: 'la soledad',
    h1: 'Versículos para la soledad',
    question: '¿Qué dice la Biblia cuando me siento solo?',
    intro:
      'Sentirse solo duele, incluso rodeado de gente. La Biblia responde con una promesa repetida: «No te dejaré, ni te desampararé». Dios conoce cada rincón de tu vida y su presencia llega donde nadie más llega. Estos versículos son para cuando la soledad pesa.',
    refs: ['Deut 31:8', 'Heb 13:5', 'Ps 68:6', 'Matt 28:20', 'Ps 27:10', 'John 14:18', 'Ps 25:16', 'Ps 139:7-10', 'Isa 49:15', 'Isa 41:10'],
    rel: ['consuelo', 'tristeza', 'amistad', 'miedo'],
  },
  {
    slug: 'duelo',
    phrase: 'el duelo',
    h1: 'Versículos para el duelo y la pérdida de un ser querido',
    question: '¿Qué dice la Biblia sobre la muerte de un ser querido?',
    intro:
      'Perder a alguien amado es una de las experiencias más hondas de la vida. Jesús mismo lloró ante la tumba de su amigo Lázaro. La Biblia acompaña el dolor y, a la vez, abre la esperanza de la resurrección y de un día sin lágrimas. Estos versículos pueden leerse en voz alta o compartirse con quien está de luto.',
    refs: ['John 11:25-26', 'Rev 21:4', '1Thess 4:13-14', 'Ps 116:15', 'Matt 5:4', 'John 14:1-3', '2Cor 5:1', 'Ps 23:4', 'Rom 14:8', 'Eccl 3:1-4'],
    rel: ['consuelo', 'esperanza', 'tristeza', 'paz'],
  },
  {
    slug: 'sanidad',
    phrase: 'la sanidad',
    h1: 'Versículos de sanidad',
    question: '¿Qué dice la Biblia sobre la sanidad y la enfermedad?',
    intro:
      'En la enfermedad, propia o de alguien cercano, muchos buscan en la Biblia palabras de sanidad. Dios se presenta como el que sana, y Jesús recorrió los pueblos sanando dolencias. Estos versículos sirven para orar por la salud del cuerpo y del alma.',
    refs: ['Jer 17:14', 'Ps 103:2-3', 'Isa 53:5', 'Jas 5:14-15', 'Ps 147:3', 'Exod 15:26', 'Jer 30:17', 'Matt 9:35', '3John 1:2', 'Prov 4:20-22'],
    rel: ['oracion', 'fe', 'fortaleza', 'consuelo'],
  },
  {
    slug: 'proteccion',
    phrase: 'la protección',
    h1: 'Versículos de protección',
    question: '¿Qué salmo puedo leer para pedir protección?',
    intro:
      'El Salmo 91 y otros pasajes describen a Dios como refugio, castillo y escudo. Son palabras que generaciones han leído antes de un viaje, de una operación o al final del día. Aquí tienes versículos de protección de la Reina-Valera 1909 para orar por ti y por los tuyos.',
    refs: ['Ps 91:1-2', 'Ps 91:11', 'Ps 121:7-8', 'Prov 18:10', '2Thess 3:3', 'Ps 46:1', 'Ps 32:7', 'Isa 54:17', 'Ps 4:8', 'Ps 27:5'],
    rel: ['miedo', 'familia', 'oracion', 'paz'],
  },
  {
    slug: 'familia',
    phrase: 'la familia',
    h1: 'Versículos sobre la familia',
    question: '¿Qué dice la Biblia sobre la familia?',
    intro:
      'La familia ocupa un lugar especial en la Biblia: es el primer lugar donde se aprende a amar, a perdonar y a servir. Estos versículos hablan del hogar, de la relación entre padres e hijos y de la bendición de vivir unidos. Son buenos para leer juntos o para orar por la propia casa.',
    refs: ['Josh 24:15', 'Ps 127:1', 'Prov 22:6', 'Eph 6:1-4', 'Col 3:18-21', 'Ps 133:1', 'Acts 16:31', 'Exod 20:12', '1Tim 5:8', 'Prov 24:3-4'],
    rel: ['hijos', 'matrimonio', 'amor', 'proteccion'],
  },
  {
    slug: 'matrimonio',
    phrase: 'el matrimonio',
    h1: 'Versículos sobre el matrimonio',
    question: '¿Qué dice la Biblia sobre el matrimonio?',
    intro:
      'Desde el Génesis, la Biblia presenta el matrimonio como una unión en la que dos llegan a ser una sola carne. Habla de amor paciente, de compromiso y de cordones de tres dobleces que no se rompen pronto. Estos versículos son ideales para una boda, un aniversario o para fortalecer la pareja.',
    refs: ['Gen 2:24', 'Eccl 4:9-12', 'Eph 5:25', 'Mark 10:9', 'Prov 18:22', '1Cor 13:4-7', 'Col 3:14', 'Heb 13:4', 'Song 8:7', 'Ruth 1:16'],
    rel: ['amor', 'familia', 'perdon', 'paciencia'],
  },
  {
    slug: 'hijos',
    phrase: 'los hijos',
    h1: 'Versículos sobre los hijos',
    question: '¿Qué versículo puedo orar por mis hijos?',
    intro:
      '«He aquí, heredad de Jehová son los hijos», dice el Salmo 127. La Biblia anima a los padres a enseñar con amor y a confiar a sus hijos en las manos de Dios. Estos versículos sirven para orar por los hijos, para bendecirlos y para recordar el valor de cada uno.',
    refs: ['Ps 127:3', 'Prov 22:6', 'Deut 6:6-7', 'Isa 54:13', 'Eph 6:4', 'Prov 3:1-2', '3John 1:4', 'Matt 19:14', 'Prov 17:6', 'Ps 103:13'],
    rel: ['familia', 'proteccion', 'cumpleanos', 'oracion'],
  },
  {
    slug: 'amistad',
    phrase: 'la amistad',
    h1: 'Versículos sobre la amistad',
    question: '¿Qué dice la Biblia sobre los amigos?',
    intro:
      'La amistad de David y Jonatán, las palabras de Jesús a sus discípulos («os he llamado amigos») y los consejos de Proverbios muestran cuánto valora la Biblia a un buen amigo. Estos versículos celebran la amistad fiel y son perfectos para dedicar a alguien especial.',
    refs: ['Prov 17:17', 'John 15:13', 'Eccl 4:9-10', 'Prov 18:24', 'Prov 27:17', 'Prov 27:9', '1Sam 18:1', 'Rom 12:10', '1Thess 5:11', 'Gal 6:2'],
    rel: ['amor', 'soledad', 'gratitud', 'familia'],
  },
  {
    slug: 'gratitud',
    phrase: 'la gratitud',
    h1: 'Versículos de gratitud y acción de gracias',
    question: '¿Qué versículo puedo leer para dar gracias a Dios?',
    intro:
      'Dar gracias cambia la manera de mirar la vida. La Biblia invita a hacerlo «en todo», no solo cuando las cosas van bien, y a entrar por las puertas de Dios con acción de gracias. Estos versículos de gratitud sirven para una oración, una mesa compartida o un nuevo día.',
    refs: ['1Thess 5:18', 'Ps 100:4', 'Ps 107:1', 'Col 3:17', 'Ps 9:1', 'Jas 1:17', 'Ps 118:24', 'Eph 5:20', 'Ps 103:1-2', 'Phil 4:6'],
    rel: ['oracion', 'cumpleanos', 'paz', 'familia'],
  },
  {
    slug: 'sabiduria',
    phrase: 'la sabiduría',
    h1: 'Versículos sobre la sabiduría',
    question: '¿Cómo pido sabiduría para tomar una decisión?',
    intro:
      'Ante una decisión importante, la Biblia ofrece una promesa sencilla: si a alguno le falta sabiduría, pídala a Dios. Proverbios añade que el principio de la sabiduría es el temor de Jehová y que conviene fiarse de él más que de la propia prudencia. Estos versículos son para cuando necesitas dirección.',
    refs: ['Jas 1:5', 'Prov 3:5-6', 'Prov 9:10', 'Prov 2:6', 'Ps 32:8', 'Prov 4:7', 'Ps 119:105', 'Eccl 7:12', 'Prov 16:16', 'Col 3:16'],
    rel: ['proposito', 'oracion', 'trabajo', 'paciencia'],
  },
  {
    slug: 'paciencia',
    phrase: 'la paciencia',
    h1: 'Versículos sobre la paciencia',
    question: '¿Qué dice la Biblia sobre esperar con paciencia?',
    intro:
      'Esperar no es fácil. La Biblia enseña que la paciencia se forma en la prueba y que los que esperan en Jehová renuevan sus fuerzas. También habla de la paciencia con los demás, como fruto del amor. Estos versículos son para los tiempos de espera.',
    refs: ['Rom 12:12', 'Jas 1:2-4', 'Gal 6:9', 'Isa 40:31', 'Ps 37:7', 'Eccl 7:8', 'Rom 8:25', 'Ps 27:14', 'Lam 3:25-26', 'Col 3:12'],
    rel: ['esperanza', 'ira', 'fortaleza', 'fe'],
  },
  {
    slug: 'ira',
    phrase: 'la ira',
    h1: 'Versículos sobre la ira y el enojo',
    question: '¿Qué dice la Biblia sobre controlar el enojo?',
    intro:
      'El enojo es una emoción que todos conocemos. La Biblia no dice que nunca lo sintamos, sino que no pequemos en él y que no se ponga el sol sobre nuestra ira. Proverbios elogia la blanda respuesta que quita el furor. Estos versículos ayudan a responder con calma.',
    refs: ['Eph 4:26', 'Jas 1:19-20', 'Prov 15:1', 'Prov 29:11', 'Col 3:8', 'Ps 37:8', 'Prov 16:32', 'Eccl 7:9', 'Rom 12:19', 'Prov 14:29'],
    rel: ['perdon', 'paciencia', 'paz', 'sabiduria'],
  },
  {
    slug: 'tentacion',
    phrase: 'la tentación',
    h1: 'Versículos sobre la tentación',
    question: '¿Qué dice la Biblia para resistir la tentación?',
    intro:
      'Jesús mismo fue tentado y por eso puede socorrer a los que son tentados. La Biblia promete que Dios no permite una prueba mayor de lo que se puede llevar y que siempre da la salida. Estos versículos son para los momentos de lucha interior.',
    refs: ['1Cor 10:13', 'Jas 1:12', 'Matt 26:41', 'Heb 4:15-16', 'Jas 4:7', 'Heb 2:18', 'Ps 119:11', '2Pet 2:9', 'Gal 5:16', 'Matt 6:13'],
    rel: ['fortaleza', 'oracion', 'perdon', 'sabiduria'],
  },
  {
    slug: 'trabajo',
    phrase: 'el trabajo',
    h1: 'Versículos sobre el trabajo',
    question: '¿Qué dice la Biblia sobre el trabajo?',
    intro:
      'La Biblia ve el trabajo como algo digno: hacerlo «de ánimo, como al Señor» le da sentido aun a la tarea más sencilla. También habla de encomendar a Dios los proyectos y de no cansarse de hacer el bien. Estos versículos son para empezar la jornada o para un tiempo de búsqueda de empleo.',
    refs: ['Col 3:23', 'Prov 16:3', 'Ps 90:17', 'Prov 14:23', 'Eccl 9:10', '1Cor 15:58', 'Prov 12:11', 'Prov 22:29', '2Thess 3:10', 'Gal 6:9'],
    rel: ['provision', 'proposito', 'sabiduria', 'paciencia'],
  },
  {
    slug: 'provision',
    phrase: 'la provisión de Dios',
    h1: 'Versículos sobre la provisión de Dios',
    question: '¿Qué dice la Biblia cuando me preocupa el dinero?',
    intro:
      '«Jehová es mi pastor; nada me faltará.» Cuando las cuentas no cierran, la Biblia invita a buscar primero el reino de Dios y a confiar en que él conoce lo que necesitamos. Estos versículos sobre la provisión hablan de un Padre que cuida hasta de las aves del cielo.',
    refs: ['Phil 4:19', 'Matt 6:31-33', 'Ps 23:1', 'Ps 37:25', 'Matt 7:7-8', 'Ps 34:10', '2Cor 9:8', 'Luke 12:24', 'Deut 8:18', 'Mal 3:10'],
    rel: ['trabajo', 'ansiedad', 'fe', 'gratitud'],
  },
  {
    slug: 'proposito',
    phrase: 'el propósito',
    h1: 'Versículos sobre el propósito de la vida',
    question: '¿Cuál es mi propósito según la Biblia?',
    intro:
      '¿Para qué estoy aquí? La Biblia responde que somos hechura de Dios, creados para buenas obras que él preparó de antemano, y que todo tiene su tiempo. Estos versículos sobre el propósito acompañan las preguntas grandes y los cambios de etapa.',
    refs: ['Jer 29:11', 'Rom 8:28', 'Eph 2:10', 'Prov 19:21', 'Ps 138:8', 'Phil 1:6', 'Ps 57:2', 'Eccl 3:1', 'Prov 16:9', 'Isa 46:10'],
    rel: ['sabiduria', 'esperanza', 'trabajo', 'fe'],
  },
  {
    slug: 'oracion',
    phrase: 'la oración',
    h1: 'Versículos sobre la oración',
    question: '¿Cómo orar según la Biblia?',
    intro:
      'La oración es conversación con Dios. La Biblia anima a pedir, buscar y llamar, a orar sin cesar y a hacerlo con sencillez, en lo secreto. Incluso cuando no sabemos qué decir, el Espíritu ayuda en nuestra debilidad. Estos versículos inspiran a orar más y mejor.',
    refs: ['Phil 4:6', 'Matt 7:7', '1Thess 5:17', 'Jer 33:3', 'Matt 6:6', '1John 5:14', 'Jas 5:16', 'Mark 11:24', 'Ps 145:18', 'Rom 8:26'],
    rel: ['fe', 'gratitud', 'ansiedad', 'sanidad'],
  },
  {
    slug: 'salvacion',
    phrase: 'la salvación',
    h1: 'Versículos sobre la salvación',
    question: '¿Qué dice la Biblia sobre la salvación?',
    intro:
      'El mensaje central del Nuevo Testamento es que Dios amó al mundo y ofrece salvación por gracia, por medio de la fe en Jesucristo. No es un premio por méritos, sino un regalo. Estos versículos resumen esa buena noticia en palabras de la Reina-Valera 1909.',
    refs: ['John 3:16', 'Rom 10:9', 'Eph 2:8-9', 'Acts 4:12', 'Rom 6:23', 'John 14:6', 'Titus 3:5', 'Rom 5:8', 'John 1:12', 'Acts 16:31'],
    rel: ['fe', 'perdon', 'amor', 'esperanza'],
  },
  {
    slug: 'animo',
    phrase: 'el ánimo',
    h1: 'Versículos de ánimo',
    question: '¿Qué versículo me puede dar ánimo hoy?',
    intro:
      '«Esfuérzate y sé valiente», le dijo Dios a Josué antes de una tarea enorme. La Biblia está llena de palabras que levantan al que está a punto de rendirse. Estos versículos de ánimo son para ti o para enviar a alguien que necesita seguir adelante.',
    refs: ['Josh 1:9', 'Isa 41:10', 'Deut 31:6', 'Ps 31:24', '2Cor 4:16-18', 'Gal 6:9', 'Heb 12:1-2', 'Isa 40:31', 'John 16:33', 'Phil 1:6'],
    rel: ['fortaleza', 'esperanza', 'miedo', 'paciencia'],
  },
  {
    slug: 'cumpleanos',
    phrase: 'el cumpleaños',
    h1: 'Versículos para un cumpleaños',
    question: '¿Qué versículo puedo dedicar en un cumpleaños?',
    intro:
      'Un cumpleaños es una buena ocasión para dar gracias por la vida y bendecir a alguien con palabras de la Biblia. Estos versículos hablan del valor de cada persona, formada de manera maravillosa, y de un Dios que acompaña cada año. Puedes copiarlos en una tarjeta o enviarlos en un mensaje.',
    refs: ['Ps 139:13-14', 'Num 6:24-26', 'Ps 90:12', 'Jer 29:11', 'Ps 118:24', 'Prov 9:11', 'Ps 20:4', 'Isa 46:4', 'Ps 16:11', 'Lam 3:22-23'],
    rel: ['gratitud', 'hijos', 'familia', 'amistad'],
  },
]
