export interface Question {
  id: number;
  question: string;
  answers: string[];
  correctAnswer: number; // index of correct answer (0-3)
  difficulty: number; // 1-10
}

export const allQuestions: Question[] = [
  {
    id: 1,
    question: "Quel est le rôle responsable de maximiser la valeur du produit ?",
    answers: ["Le Scrum Master", "Le Product Owner", "L'Équipe de Développement", "Le Stakeholder"],
    correctAnswer: 1,
    difficulty: 1
  },
  {
    id: 2,
    question: "Quel artefact Scrum contient la liste ordonnée de tout ce qui pourrait être nécessaire dans le produit ?",
    answers: ["Sprint Backlog", "Product Backlog", "Burndown Chart", "Increment"],
    correctAnswer: 1,
    difficulty: 1
  },
  {
    id: 3,
    question: "Quelle est la durée typique d'un Sprint dans Scrum ?",
    answers: ["1 à 2 semaines", "2 à 4 semaines", "1 à 3 mois", "6 mois"],
    correctAnswer: 1,
    difficulty: 2
  },
  {
    id: 4,
    question: "Quel événement Scrum permet à l'équipe d'inspecter l'incrément et d'adapter le Product Backlog ?",
    answers: ["La Revue de Sprint", "La Rétrospective", "Le Daily Scrum", "Le Sprint Planning"],
    correctAnswer: 0,
    difficulty: 2
  },
  {
    id: 5,
    question: "Quel est le rôle du Scrum Master ?",
    answers: ["Gérer l'équipe", "Faciliter le processus Scrum et éliminer les obstacles", "Prendre les décisions techniques", "Définir les fonctionnalités du produit"],
    correctAnswer: 1,
    difficulty: 2
  },
  {
    id: 6,
    question: "Quelle est la durée maximale recommandée pour un Daily Scrum ?",
    answers: ["30 minutes", "1 heure", "15 minutes", "45 minutes"],
    correctAnswer: 2,
    difficulty: 3
  },
  {
    id: 7,
    question: "Quel graphique montre le travail restant dans le Sprint par rapport au temps ?",
    answers: ["Burn-up Chart", "Velocity Chart", "Burndown Chart", "Cumulative Flow Diagram"],
    correctAnswer: 2,
    difficulty: 3
  },
  {
    id: 8,
    question: "Quelle cérémonie Scrum se concentre sur l'amélioration continue du processus ?",
    answers: ["La Revue de Sprint", "La Rétrospective de Sprint", "Le Sprint Planning", "Le Daily Scrum"],
    correctAnswer: 1,
    difficulty: 3
  },
  {
    id: 9,
    question: "Quelle est la définition de 'Done' (Terminé) dans Scrum ?",
    answers: ["Le code est écrit", "La fonctionnalité est testée et prête à être livrée", "La revue de code est faite", "Le Product Owner a approuvé"],
    correctAnswer: 1,
    difficulty: 4
  },
  {
    id: 10,
    question: "Combien de valeurs fondamentales l'agilité compte-t-elle ?",
    answers: ["3", "4", "5", "6"],
    correctAnswer: 1,
    difficulty: 4
  },
  {
    id: 11,
    question: "Quelle est la première valeur du Manifeste Agile ?",
    answers: ["Les processus et les outils", "Les individus et les interactions", "La documentation exhaustive", "La négociation contractuelle"],
    correctAnswer: 1,
    difficulty: 4
  },
  {
    id: 12,
    question: "Quel artefact représente le travail que l'équipe s'engage à accomplir pendant le Sprint ?",
    answers: ["Product Backlog", "Sprint Backlog", "Increment", "Definition of Done"],
    correctAnswer: 1,
    difficulty: 5
  },
  {
    id: 13,
    question: "Dans Scrum, qui est responsable de la création de l'incrément 'Done' ?",
    answers: ["Le Product Owner", "Le Scrum Master", "L'Équipe de Développement", "Les Testeurs"],
    correctAnswer: 2,
    difficulty: 5
  },
  {
    id: 14,
    question: "Quelle est la durée maximale recommandée pour la Revue de Sprint d'un Sprint d'un mois ?",
    answers: ["2 heures", "4 heures", "8 heures", "1 heure"],
    correctAnswer: 1,
    difficulty: 6
  },
  {
    id: 15,
    question: "Quel concept Scrum encourage l'équipe à s'auto-organiser ?",
    answers: ["Micro-management", "Auto-organisation", "Hiérarchie stricte", "Direction centralisée"],
    correctAnswer: 1,
    difficulty: 6
  },
  {
    id: 16,
    question: "Quelle est la différence entre Product Backlog et Sprint Backlog ?",
    answers: ["Il n'y a pas de différence", "Le Product Backlog est pour tout le produit, le Sprint Backlog est pour le Sprint en cours", "Le Sprint Backlog est géré par le PO", "Le Product Backlog est technique"],
    correctAnswer: 1,
    difficulty: 7
  },
  {
    id: 17,
    question: "Quel principe Agile privilégie 'la livraison continue de logiciels opérationnels' ?",
    answers: ["Satisfaire le client", "Accueillir le changement", "Livrer fréquemment", "Travailler ensemble"],
    correctAnswer: 2,
    difficulty: 7
  },
  {
    id: 18,
    question: "Que signifie l'acronyme INVEST pour les User Stories ?",
    answers: ["Important, New, Valuable, Estimable, Small, Testable", "Independent, Negotiable, Valuable, Estimable, Small, Testable", "Individual, Negotiable, Variable, Estimable, Small, Testable", "Integrated, New, Valuable, Estimable, Small, Testable"],
    correctAnswer: 1,
    difficulty: 8
  },
  {
    id: 19,
    question: "Quelle est la vélocité dans Scrum ?",
    answers: ["La vitesse de codage", "La quantité de travail terminée par Sprint", "Le nombre de réunions", "La vitesse de déploiement"],
    correctAnswer: 1,
    difficulty: 8
  },
  {
    id: 20,
    question: "Quel est le but de la Rétrospective de Sprint ?",
    answers: ["Planifier le prochain Sprint", "Démontrer l'incrément", "Inspecter et adapter le processus", "Créer le Product Backlog"],
    correctAnswer: 2,
    difficulty: 9
  }
];

// Function to get 10 random questions
export function getRandomQuestions(count: number = 10): Question[] {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Prize money ladder (in euros)
export const prizeLadder = [
  100,
  200,
  300,
  500,
  1000,
  2000,
  4000,
  8000,
  16000,
  32000,
  64000,
  125000,
  250000,
  500000,
  1000000
];

// Safe havens (prizes the player keeps even if they lose)
export const safeHavens = [1000, 32000];
