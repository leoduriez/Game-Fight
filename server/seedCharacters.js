require('dotenv').config();
const mongoose = require('mongoose');
const Character = require('./models/Character');
const User = require('./models/User');

const characters = [
  {
    name: "Dragon Warrior",
    description: "Un guerrier légendaire maîtrisant le pouvoir du dragon",
    image: "/images/characters/dragon-warrior.webp",
    stats: {
      health: 150,
      attack: 75,
      defense: 60,
      speed: 50,
      mana: 100
    },
    skills: [
      {
        name: "Souffle du Dragon",
        description: "Crache un puissant souffle de feu",
        power: 60,
        manaCost: 40,
        type: "special"
      },
      {
        name: "Coup de Griffe",
        description: "Attaque rapide avec des griffes acérées",
        power: 35,
        manaCost: 15,
        type: "attack"
      },
      {
        name: "Écailles de Dragon",
        description: "Renforce la défense avec des écailles magiques",
        power: 30,
        manaCost: 25,
        type: "defense"
      },
      {
        name: "Rage du Dragon",
        description: "Attaque dévastatrice qui consume toute la mana",
        power: 90,
        manaCost: 80,
        type: "special"
      }
    ]
  },
  {
    name: "Shadow Ninja",
    description: "Assassin furtif maîtrisant les arts de l'ombre",
    image: "/images/characters/shadow-ninja.webp",
    stats: {
      health: 100,
      attack: 85,
      defense: 40,
      speed: 95,
      mana: 80
    },
    skills: [
      {
        name: "Lame de l'Ombre",
        description: "Frappe rapide et mortelle depuis les ténèbres",
        power: 55,
        manaCost: 30,
        type: "attack"
      },
      {
        name: "Disparition",
        description: "Se téléporte et esquive les attaques",
        power: 0,
        manaCost: 35,
        type: "defense"
      },
      {
        name: "Shuriken Fatal",
        description: "Lance des shurikens empoisonnés",
        power: 45,
        manaCost: 25,
        type: "attack"
      },
      {
        name: "Exécution Silencieuse",
        description: "Coup critique dévastateur",
        power: 100,
        manaCost: 70,
        type: "special"
      }
    ]
  },
  {
    name: "Ice Mage",
    description: "Sorcier des glaces contrôlant le froid éternel",
    image: "/images/characters/ice-mage.webp",
    stats: {
      health: 90,
      attack: 50,
      defense: 45,
      speed: 60,
      mana: 150
    },
    skills: [
      {
        name: "Blizzard",
        description: "Tempête de glace qui gèle l'ennemi",
        power: 65,
        manaCost: 50,
        type: "special"
      },
      {
        name: "Lance de Glace",
        description: "Projectile de glace perçant",
        power: 40,
        manaCost: 20,
        type: "attack"
      },
      {
        name: "Bouclier de Glace",
        description: "Crée un mur de glace protecteur",
        power: 35,
        manaCost: 30,
        type: "defense"
      },
      {
        name: "Gel Absolu",
        description: "Gèle complètement l'adversaire",
        power: 80,
        manaCost: 60,
        type: "special"
      }
    ]
  },
  {
    name: "Thunder Knight",
    description: "Chevalier de la foudre brandissant l'épée électrique",
    image: "/images/characters/thunder-knight.webp",
    stats: {
      health: 130,
      attack: 70,
      defense: 70,
      speed: 65,
      mana: 110
    },
    skills: [
      {
        name: "Éclair Foudroyant",
        description: "Invoque un éclair dévastateur",
        power: 70,
        manaCost: 45,
        type: "special"
      },
      {
        name: "Coup de Tonnerre",
        description: "Frappe électrique puissante",
        power: 50,
        manaCost: 25,
        type: "attack"
      },
      {
        name: "Armure Électrique",
        description: "S'entoure d'électricité protectrice",
        power: 40,
        manaCost: 35,
        type: "defense"
      },
      {
        name: "Tempête Électrique",
        description: "Déchaîne une tempête de foudre",
        power: 85,
        manaCost: 65,
        type: "special"
      }
    ]
  },
  {
    name: "Forest Guardian",
    description: "Protecteur de la nature avec des pouvoirs de guérison",
    image: "/images/characters/forest-guardian.webp",
    stats: {
      health: 140,
      attack: 55,
      defense: 75,
      speed: 45,
      mana: 130
    },
    skills: [
      {
        name: "Racines Emprisonnantes",
        description: "Des racines surgissent pour immobiliser l'ennemi",
        power: 40,
        manaCost: 30,
        type: "attack"
      },
      {
        name: "Soin Naturel",
        description: "Restaure la santé avec l'énergie de la nature",
        power: 50,
        manaCost: 40,
        type: "heal"
      },
      {
        name: "Écorce de Fer",
        description: "Renforce la défense avec une écorce magique",
        power: 45,
        manaCost: 35,
        type: "defense"
      },
      {
        name: "Fureur de la Forêt",
        description: "Invoque la colère de la nature",
        power: 75,
        manaCost: 55,
        type: "special"
      }
    ]
  },
  {
    name: "Demon Lord",
    description: "Seigneur démoniaque maîtrisant les flammes infernales",
    image: "/images/characters/demon-lord.webp",
    stats: {
      health: 160,
      attack: 80,
      defense: 55,
      speed: 55,
      mana: 120
    },
    skills: [
      {
        name: "Flammes Infernales",
        description: "Déchaîne les flammes de l'enfer",
        power: 75,
        manaCost: 50,
        type: "special"
      },
      {
        name: "Griffe Démoniaque",
        description: "Attaque avec des griffes enflammées",
        power: 55,
        manaCost: 30,
        type: "attack"
      },
      {
        name: "Pacte Sombre",
        description: "Sacrifie de la vie pour augmenter la puissance",
        power: 60,
        manaCost: 20,
        type: "special"
      },
      {
        name: "Régénération Démoniaque",
        description: "Absorbe l'énergie vitale de l'ennemi",
        power: 45,
        manaCost: 40,
        type: "heal"
      }
    ]
  }
];

async function seedCharacters() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver un utilisateur admin ou le premier utilisateur
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      admin = await User.findOne();
    }

    if (!admin) {
      console.error('❌ Aucun utilisateur trouvé. Créez d\'abord un compte.');
      process.exit(1);
    }

    console.log(`📝 Utilisation de l'utilisateur: ${admin.username}`);

    // Supprimer les personnages existants (optionnel)
    await Character.deleteMany({});
    console.log('🗑️  Personnages existants supprimés');

    // Créer les nouveaux personnages
    for (const charData of characters) {
      const character = new Character({
        ...charData,
        createdBy: admin._id
      });
      await character.save();
      console.log(`✅ Personnage créé: ${character.name}`);
    }

    console.log(`\n🎉 ${characters.length} personnages créés avec succès!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedCharacters();
