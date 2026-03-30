/**
 * =============================================================================
 * SYSTÈME DE COMBAT TOUR PAR TOUR - Style Pokémon
 * =============================================================================
 * 
 * Ce module implémente un système de combat strictement tour par tour où :
 * - La vitesse détermine l'ordre d'attaque à chaque tour
 * - Chaque personnage attaque l'un après l'autre, jamais simultanément
 * - Le combat se déroule en phases claires et séquentielles
 * 
 * Auteur: Game Fight Team
 * Version: 1.0.0
 */

// =============================================================================
// CONSTANTES DE COMBAT
// =============================================================================

const COMBAT_CONSTANTS = {
  CRITICAL_HIT_CHANCE: 0.1,        // 10% de chance de coup critique
  CRITICAL_HIT_MULTIPLIER: 2.0,    // Multiplicateur des dégâts critiques
  ATTACK_SCALING: 0.5,             // Coefficient d'échelle de l'attaque
  DEFENSE_SCALING: 0.3,            // Coefficient d'échelle de la défense
  MIN_DAMAGE: 1,                   // Dégâts minimum garantis
  MANA_REGEN_PER_TURN: 5,          // Régénération de mana par tour
  SPEED_VARIANCE: 0.1              // Variance de vitesse pour le calcul d'ordre (10%)
};

// =============================================================================
// CLASSE COMBATTANT
// =============================================================================

/**
 * Représente un combattant dans le système de combat
 * Encapsule toutes les statistiques et l'état d'un personnage en combat
 */
class Combatant {
  constructor(characterData, role = 'player') {
    this.id = characterData.id || characterData._id;
    this.name = characterData.name;
    this.image = characterData.image;
    this.role = role; // 'player' ou 'enemy'
    
    // Statistiques de base (copiées pour ne pas modifier l'original)
    this.stats = { ...characterData.stats };
    
    // Compétences disponibles
    this.skills = [...characterData.skills];
    
    // État actuel en combat
    this.currentHealth = characterData.currentHealth || this.stats.health;
    this.maxHealth = characterData.maxHealth || this.stats.health;
    this.currentMana = characterData.currentMana || this.stats.mana;
    this.maxMana = characterData.maxMana || this.stats.mana;
    
    // Buffs/Debuffs actifs (pour évolutions futures)
    this.statusEffects = [];
    
    // Statistiques de combat
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.criticalHits = 0;
  }

  /**
   * Vérifie si le combattant est encore en vie
   */
  isAlive() {
    return this.currentHealth > 0;
  }

  /**
   * Vérifie si le combattant peut utiliser une compétence
   */
  canUseSkill(skill) {
    return this.currentMana >= skill.manaCost;
  }

  /**
   * Récupère les compétences utilisables (assez de mana)
   */
  getAvailableSkills() {
    return this.skills.filter(skill => this.canUseSkill(skill));
  }

  /**
   * Applique des dégâts au combattant
   */
  takeDamage(amount) {
    const actualDamage = Math.min(this.currentHealth, amount);
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.totalDamageTaken += actualDamage;
    return actualDamage;
  }

  /**
   * Soigne le combattant
   */
  heal(amount) {
    const actualHeal = Math.min(this.maxHealth - this.currentHealth, amount);
    this.currentHealth += actualHeal;
    return actualHeal;
  }

  /**
   * Consomme du mana pour une compétence
   */
  consumeMana(amount) {
    this.currentMana = Math.max(0, this.currentMana - amount);
  }

  /**
   * Régénère du mana en fin de tour
   */
  regenerateMana() {
    const regenAmount = Math.min(
      COMBAT_CONSTANTS.MANA_REGEN_PER_TURN, 
      this.maxMana - this.currentMana
    );
    this.currentMana += regenAmount;
    return regenAmount;
  }

  /**
   * Exporte l'état du combattant pour le frontend
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      stats: this.stats,
      skills: this.skills,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth,
      currentMana: this.currentMana,
      maxMana: this.maxMana,
      statusEffects: this.statusEffects
    };
  }
}

// =============================================================================
// CLASSE RÉSULTAT D'ACTION
// =============================================================================

/**
 * Représente le résultat d'une action de combat
 */
class ActionResult {
  constructor(attacker, defender, skill) {
    this.attackerName = attacker.name;
    this.defenderName = defender.name;
    this.skillName = skill.name;
    this.skillType = skill.type;
    this.success = true;
    this.damage = 0;
    this.healAmount = 0;
    this.isCritical = false;
    this.defenderRemainingHealth = defender.currentHealth;
    this.defenderDefeated = false;
    this.message = '';
  }

  /**
   * Génère le message de log pour cette action
   */
  generateMessage(turnNumber) {
    if (this.skillType === 'heal') {
      this.message = `Tour ${turnNumber} : ${this.attackerName} utilise ${this.skillName} et récupère ${this.healAmount} PV.`;
    } else if (this.skillType === 'defense') {
      this.message = `Tour ${turnNumber} : ${this.attackerName} utilise ${this.skillName} et augmente sa défense !`;
    } else {
      const critText = this.isCritical ? ' 💥 COUP CRITIQUE !' : '';
      this.message = `Tour ${turnNumber} : ${this.attackerName} utilise ${this.skillName} et inflige ${this.damage} dégâts à ${this.defenderName}.${critText}`;
      
      if (this.defenderDefeated) {
        this.message += ` ${this.defenderName} est K.O. !`;
      } else {
        this.message += ` (${this.defenderRemainingHealth} PV restants)`;
      }
    }
    return this.message;
  }
}

// =============================================================================
// CLASSE PRINCIPALE : GESTIONNAIRE DE COMBAT
// =============================================================================

/**
 * Gère le déroulement complet d'un combat tour par tour
 * Implémente la logique style Pokémon
 */
class TurnBasedCombatManager {
  constructor(playerData, enemyData) {
    // Créer les combattants
    this.player = new Combatant(playerData, 'player');
    this.enemy = new Combatant(enemyData, 'enemy');
    
    // État du combat
    this.turnNumber = 0;
    this.battleLog = [];
    this.isOver = false;
    this.winner = null;
    
    // Historique des actions (pour replay/animation)
    this.turnHistory = [];
    
    // Phase actuelle du tour
    this.currentPhase = 'waiting'; // 'waiting', 'player_action', 'enemy_action', 'end_turn'
  }

  // ===========================================================================
  // DÉTERMINATION DE L'ORDRE D'ATTAQUE
  // ===========================================================================

  /**
   * Détermine qui attaque en premier basé sur la vitesse
   * En cas d'égalité, utilise un système aléatoire pondéré
   * 
   * @returns {Object} { first: Combatant, second: Combatant }
   */
  determineAttackOrder() {
    const playerSpeed = this.player.stats.speed;
    const enemySpeed = this.enemy.stats.speed;

    // Calcul avec légère variance pour rendre les égalités plus intéressantes
    const playerEffectiveSpeed = playerSpeed + (Math.random() * playerSpeed * COMBAT_CONSTANTS.SPEED_VARIANCE);
    const enemyEffectiveSpeed = enemySpeed + (Math.random() * enemySpeed * COMBAT_CONSTANTS.SPEED_VARIANCE);

    // Si les vitesses sont très proches (différence < 5%), aléatoire pur
    const speedDifference = Math.abs(playerSpeed - enemySpeed) / Math.max(playerSpeed, enemySpeed);
    
    if (speedDifference < 0.05) {
      // Égalité ou quasi-égalité : 50/50
      if (Math.random() < 0.5) {
        return { first: this.player, second: this.enemy };
      } else {
        return { first: this.enemy, second: this.player };
      }
    }

    // Sinon, le plus rapide attaque en premier
    if (playerEffectiveSpeed > enemyEffectiveSpeed) {
      return { first: this.player, second: this.enemy };
    } else {
      return { first: this.enemy, second: this.player };
    }
  }

  /**
   * Détermine l'ordre de manière stricte (sans variance)
   * Utilisé pour l'affichage prédictif
   */
  determineStrictAttackOrder() {
    const playerSpeed = this.player.stats.speed;
    const enemySpeed = this.enemy.stats.speed;

    if (playerSpeed > enemySpeed) {
      return { first: 'player', second: 'enemy' };
    } else if (enemySpeed > playerSpeed) {
      return { first: 'enemy', second: 'player' };
    } else {
      return { first: 'tie', second: 'tie' };
    }
  }

  // ===========================================================================
  // CALCUL DES DÉGÂTS
  // ===========================================================================

  /**
   * Vérifie si l'attaque est un coup critique
   */
  rollCriticalHit() {
    return Math.random() < COMBAT_CONSTANTS.CRITICAL_HIT_CHANCE;
  }

  /**
   * Calcule les dégâts d'une attaque
   * 
   * @param {Combatant} attacker - L'attaquant
   * @param {Combatant} defender - Le défenseur
   * @param {Object} skill - La compétence utilisée
   * @returns {Object} { damage: number, isCritical: boolean }
   */
  calculateDamage(attacker, defender, skill) {
    // Formule de dégâts : (Puissance + Attaque * scaling) - (Défense * scaling)
    const baseDamage = skill.power + (attacker.stats.attack * COMBAT_CONSTANTS.ATTACK_SCALING);
    const defenseReduction = defender.stats.defense * COMBAT_CONSTANTS.DEFENSE_SCALING;
    
    let damage = Math.max(COMBAT_CONSTANTS.MIN_DAMAGE, Math.round(baseDamage - defenseReduction));
    
    // Vérification du coup critique
    const isCritical = this.rollCriticalHit();
    if (isCritical) {
      damage = Math.round(damage * COMBAT_CONSTANTS.CRITICAL_HIT_MULTIPLIER);
      attacker.criticalHits++;
    }
    
    return { damage, isCritical };
  }

  // ===========================================================================
  // EXÉCUTION DES ACTIONS
  // ===========================================================================

  /**
   * Exécute une action de combat pour un combattant
   * 
   * @param {Combatant} attacker - Le combattant qui agit
   * @param {Combatant} defender - La cible de l'action
   * @param {Object} skill - La compétence à utiliser
   * @returns {ActionResult} Le résultat de l'action
   */
  executeAction(attacker, defender, skill) {
    const result = new ActionResult(attacker, defender, skill);
    
    // Consommer le mana
    attacker.consumeMana(skill.manaCost);
    
    switch (skill.type) {
      case 'heal':
        // Compétence de soin
        const healAmount = attacker.heal(skill.power);
        result.healAmount = healAmount;
        break;
        
      case 'defense':
        // Compétence de défense (boost temporaire)
        // Pour l'instant, applique un petit soin
        const defenseHeal = attacker.heal(Math.round(skill.power * 0.5));
        result.healAmount = defenseHeal;
        break;
        
      case 'attack':
      case 'special':
      default:
        // Compétence d'attaque
        const { damage, isCritical } = this.calculateDamage(attacker, defender, skill);
        defender.takeDamage(damage);
        attacker.totalDamageDealt += damage;
        
        result.damage = damage;
        result.isCritical = isCritical;
        result.defenderRemainingHealth = defender.currentHealth;
        result.defenderDefeated = !defender.isAlive();
        break;
    }
    
    // Générer le message de log
    result.generateMessage(this.turnNumber);
    
    return result;
  }

  // ===========================================================================
  // IA DE L'ENNEMI
  // ===========================================================================

  /**
   * L'IA choisit une compétence à utiliser
   * Stratégie simple mais efficace
   */
  aiChooseSkill() {
    const availableSkills = this.enemy.getAvailableSkills();
    
    if (availableSkills.length === 0) {
      return null; // Pas de compétence disponible
    }
    
    const healthPercent = this.enemy.currentHealth / this.enemy.maxHealth;
    
    // Stratégie basée sur la santé
    if (healthPercent < 0.25) {
      // Santé critique : priorité au soin
      const healSkills = availableSkills.filter(s => s.type === 'heal');
      if (healSkills.length > 0) {
        return healSkills[0];
      }
    }
    
    // Sinon, privilégier les attaques
    const attackSkills = availableSkills.filter(s => s.type === 'attack' || s.type === 'special');
    
    if (attackSkills.length > 0) {
      // Choisir l'attaque la plus puissante
      return attackSkills.reduce((best, current) => 
        current.power > best.power ? current : best
      );
    }
    
    // Fallback : compétence aléatoire
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  }

  // ===========================================================================
  // GESTION DU TOUR
  // ===========================================================================

  /**
   * Exécute un tour complet de combat
   * C'est la méthode principale appelée quand le joueur choisit une action
   * 
   * @param {number} playerSkillIndex - Index de la compétence choisie par le joueur
   * @returns {Object} Résultat du tour avec toutes les informations
   */
  executeTurn(playerSkillIndex) {
    // Vérifier que le combat n'est pas terminé
    if (this.isOver) {
      return {
        success: false,
        message: 'Le combat est déjà terminé.',
        battleState: this.getState()
      };
    }

    // Incrémenter le numéro de tour
    this.turnNumber++;
    
    // Récupérer la compétence du joueur
    const playerSkill = this.player.skills[playerSkillIndex];
    if (!playerSkill) {
      return {
        success: false,
        message: 'Compétence invalide.',
        battleState: this.getState()
      };
    }

    // Vérifier le mana du joueur
    if (!this.player.canUseSkill(playerSkill)) {
      this.turnNumber--; // Annuler l'incrémentation
      return {
        success: false,
        message: 'Mana insuffisant pour cette compétence.',
        battleState: this.getState()
      };
    }

    // L'IA choisit sa compétence
    const enemySkill = this.aiChooseSkill();

    // Déterminer l'ordre d'attaque basé sur la vitesse
    const { first, second } = this.determineAttackOrder();
    
    // Créer l'enregistrement du tour
    const turnRecord = {
      turnNumber: this.turnNumber,
      order: first === this.player ? 'player_first' : 'enemy_first',
      actions: []
    };

    // Ajouter un message d'ordre dans le log
    const orderMessage = `━━━ Tour ${this.turnNumber} ━━━ ${first.name} agit en premier (Vitesse: ${first.stats.speed})`;
    this.battleLog.push(orderMessage);

    // ==== PHASE 1 : Premier attaquant ====
    const firstSkill = first === this.player ? playerSkill : enemySkill;
    const firstTarget = first === this.player ? this.enemy : this.player;
    
    if (firstSkill) {
      const firstResult = this.executeAction(first, firstTarget, firstSkill);
      this.battleLog.push(firstResult.message);
      turnRecord.actions.push({
        attacker: first.name,
        result: firstResult
      });

      // Vérifier si le combat est terminé après la première action
      if (!firstTarget.isAlive()) {
        this.endCombat(first);
        turnRecord.actions.push({ type: 'combat_end', winner: first.name });
        this.turnHistory.push(turnRecord);
        return {
          success: true,
          message: 'Tour exécuté.',
          battleState: this.getState()
        };
      }
    } else {
      const noSkillMessage = `Tour ${this.turnNumber} : ${first.name} n'a plus assez de mana pour agir !`;
      this.battleLog.push(noSkillMessage);
    }

    // ==== PHASE 2 : Second attaquant ====
    const secondSkill = second === this.player ? playerSkill : enemySkill;
    const secondTarget = second === this.player ? this.enemy : this.player;
    
    if (second.isAlive() && secondSkill) {
      const secondResult = this.executeAction(second, secondTarget, secondSkill);
      this.battleLog.push(secondResult.message);
      turnRecord.actions.push({
        attacker: second.name,
        result: secondResult
      });

      // Vérifier si le combat est terminé après la seconde action
      if (!secondTarget.isAlive()) {
        this.endCombat(second);
        turnRecord.actions.push({ type: 'combat_end', winner: second.name });
      }
    } else if (second.isAlive() && !secondSkill) {
      const noSkillMessage = `Tour ${this.turnNumber} : ${second.name} n'a plus assez de mana pour agir !`;
      this.battleLog.push(noSkillMessage);
    }

    // ==== PHASE 3 : Fin de tour ====
    // Régénération de mana (optionnel)
    // this.player.regenerateMana();
    // this.enemy.regenerateMana();

    // Enregistrer le tour dans l'historique
    this.turnHistory.push(turnRecord);

    return {
      success: true,
      message: 'Tour exécuté.',
      battleState: this.getState()
    };
  }

  // ===========================================================================
  // FIN DE COMBAT
  // ===========================================================================

  /**
   * Termine le combat et déclare le vainqueur
   */
  endCombat(winner) {
    this.isOver = true;
    this.winner = winner === this.player ? 'player' : 'enemy';
    
    const victoryMessage = this.winner === 'player'
      ? `🏆 Victoire ! ${this.player.name} remporte le combat !`
      : `💀 Défaite... ${this.enemy.name} remporte le combat.`;
    
    this.battleLog.push(victoryMessage);
  }

  // ===========================================================================
  // EXPORT DE L'ÉTAT
  // ===========================================================================

  /**
   * Retourne l'état complet du combat pour le frontend
   */
  getState() {
    return {
      player: this.player.toJSON(),
      enemy: this.enemy.toJSON(),
      turnNumber: this.turnNumber,
      battleLog: [...this.battleLog],
      isOver: this.isOver,
      winner: this.winner,
      currentPhase: this.currentPhase,
      speedComparison: {
        playerSpeed: this.player.stats.speed,
        enemySpeed: this.enemy.stats.speed,
        expectedFirst: this.determineStrictAttackOrder().first
      }
    };
  }

  /**
   * Crée une instance de TurnBasedCombatManager à partir d'un état existant
   * Utile pour reprendre un combat en cours
   */
  static fromState(battleState) {
    const manager = new TurnBasedCombatManager(
      battleState.player,
      battleState.enemy
    );
    
    manager.turnNumber = battleState.turnNumber;
    manager.battleLog = [...battleState.battleLog];
    manager.isOver = battleState.isOver;
    manager.winner = battleState.winner;
    
    // Restaurer l'état des combattants
    manager.player.currentHealth = battleState.player.currentHealth;
    manager.player.currentMana = battleState.player.currentMana;
    manager.enemy.currentHealth = battleState.enemy.currentHealth;
    manager.enemy.currentMana = battleState.enemy.currentMana;
    
    return manager;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  TurnBasedCombatManager,
  Combatant,
  ActionResult,
  COMBAT_CONSTANTS
};
