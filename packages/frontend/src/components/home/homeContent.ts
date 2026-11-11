// Static content of the home page. Texts that depend on the locale live in the message files.

export const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/ZdTaF4nS9MoYJkqk7";

/** Real Google reviews, verbatim (Spanish). */
export const HOME_REVIEWS = [
  {
    author: "Marco A Velázquez-Albo",
    text: "La experiencia con Propelia Bienes Raíces (Leslie Cabrera Inmobiliaria) ha sido excelente. Se trata de una gestión inmobiliaria con alto compromiso profesional, eficiencia y calidad con un trato humano sumamente cordial. Con toda seguridad y certeza nosotros volveremos a contratar la asesoría y servicios de Propelia Bienes Raíces (Leslie Cabrera Inmobiliaria) en nuestra futura operación inmobiliaria; y con absoluta responsabilidad la recomendamos ampliamente.",
  },
  {
    author: "Gabriela Rodríguez",
    text: "Muy buena experiencia con Properlia. Nos ayudaron a encontrar nuestra casa ideal y nos acompañaron en todo el proceso, incluyendo la gestión del crédito infonavit. Siempre fueron muy amables, atentos y profesionales. ¡Super recomendados!",
  },
  {
    author: "Adriana Guadalupe Gomez Espinosa",
    text: "La atención y el servicio de Leslie Cabrera, ejecutiva de Properlia, han sido excelentes. Me acompañó de manera cercana y profesional durante todo el proceso de adquisición de mi vivienda, desde el inicio hasta la firma de la escritura. Agradezco profundamente su dedicación, compromiso y calidez, que fueron clave para hacer realidad este importante sueño.",
  },
] as const;

export const HOME_PROCESS_STEPS = [1, 2, 3, 4] as const;
export const HOME_INSIGHTS = ["Buy", "Sell", "Invest", "Market"] as const;
/** Shared with the FAQPage JSON-LD so markup always matches the visible answers. */
export const HOME_FAQ_ITEMS = [1, 2, 3, 4, 5] as const;
