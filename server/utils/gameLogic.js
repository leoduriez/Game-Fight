// Logique du système de combat

// Calcule si l'attaque est un coup critique (10% de chance)
const isCriticalHit = () => {
  return Math.random() < 0.1; // 10% de chance
};

// Calcule les dégâts infligés
const calculateDamage = (attacker, defender, skill) => {
  const baseDamage = skill.power + (attacker.stats.attack * 0.5);
  const defense = defender.stats.defense * 0.3;
  let damage = Math.max(1, Math.round(baseDamage - defense));
  
  const critical = isCriticalHit();
  if (critical) {
    damage *= 2;
  }
  
  return { damage, critical };
};

// Applique une compétence de soin
const applyHeal = (character, skill) => {
  const healAmount = skill.power;
  const newHealth = Math.min(character.maxHealth, character.currentHealth + healAmount);
  return newHealth - character.currentHealth;
};

// Détermine qui attaque en premier basé sur la vitesse
const determineFirstAttacker = (player, enemy) => {
  if (player.stats.speed > enemy.stats.speed) {
    return 'player';
  } else if (enemy.stats.speed > player.stats.speed) {
    return 'enemy';
  } else {
    // En cas d'égalité, choix aléatoire
    return Math.random() < 0.5 ? 'player' : 'enemy';
  }
};

// IA simple pour choisir une compétence
const aiChooseSkill = (character) => {
  // Filtre les compétences que l'IA peut utiliser (assez de mana)
  const availableSkills = character.skills.filter(
    skill => skill.manaCost <= character.currentMana
  );
  
  if (availableSkills.length === 0) {
    return null; // Pas de compétence disponible
  }
  
  // Stratégie simple : préfère les attaques puissantes si possible
  // Sinon, choisit aléatoirement
  const attackSkills = availableSkills.filter(s => s.type === 'attack' || s.type === 'special');
  
  if (attackSkills.length > 0 && character.currentHealth > character.maxHealth * 0.3) {
    // Choisit l'attaque la plus puissante
    return attackSkills.reduce((prev, current) => 
      (prev.power > current.power) ? prev : current
    );
  }
  
  // Si la santé est basse, essaie de se soigner
  const healSkills = availableSkills.filter(s => s.type === 'heal');
  if (healSkills.length > 0 && character.currentHealth < character.maxHealth * 0.3) {
    return healSkills[0];
  }
  
  // Sinon, choix aléatoire parmi les compétences disponibles
  return availableSkills[Math.floor(Math.random() * availableSkills.length)];
};

// Génère un commentaire pour le tour
const generateTurnComment = (attacker, defender, skill, result, turnNumber) => {
  const attackerName = attacker.name;
  const defenderName = defender.name;
  
  if (skill.type === 'heal') {
    return `Tour ${turnNumber} : ${attackerName} utilise ${skill.name} et récupère ${result.healAmount} PV.`;
  }
  
  const criticalText = result.critical ? ' (coup critique)' : '';
  return `Tour ${turnNumber} : ${attackerName} utilise ${skill.name} et inflige ${result.damage} dégâts${criticalText}. ${defenderName} tombe à ${result.remainingHealth} PV.`;
};

module.exports = {
  isCriticalHit,
  calculateDamage,
  applyHeal,
  determineFirstAttacker,
  aiChooseSkill,
  generateTurnComment
};
