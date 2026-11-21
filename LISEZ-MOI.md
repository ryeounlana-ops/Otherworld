# Otherworld — IA + mémoire (v5)

## Ce qui a changé
Avant, `OW_AI_URL` était vide : les personnages répondaient avec des phrases pré-écrites (aucune IA, aucune mémoire).
Maintenant, un vrai modèle de langage écrit les réponses, et chaque personnage a une mémoire.

**Comment fonctionne la mémoire (par personnage et par compte)**
- Les ~14 à 30 derniers messages sont envoyés tels quels au modèle (mémoire à court terme).
- Dès que 30 messages ne sont pas encore résumés, l'app demande au modèle de mettre à jour un **résumé de l'histoire** + une **liste de faits** (ton prénom, tes goûts, promesses, lieux, état de la relation…). C'est ce qui permet de « tout se rappeler » sur des centaines de messages.
- Bouton **🧠** dans le chat : tu vois ce que le personnage retient, tu peux **épingler** des infos qu'il ne doit jamais oublier, ou lui faire **oublier le passé**.
- Nouveau chat / chat supprimé = mémoire remise à zéro automatiquement.

**Qualité d'écriture** : prompt système complet (fiche du personnage, bio, ville, tempérament, date/heure, règles de style Character.AI : *actions en italique*, réponses qui rebondissent sur ton message, pas de répétitions, pas de question à chaque fin, jamais « en tant qu'IA »).

## Téléphone ≠ Histoire (v5.1)
Ce sont maintenant **deux conversations séparées** avec chaque personnage :

| | Onglet **Story** (Histoire) | **Téléphone** (Messages / DM / story Instagram) |
|---|---|---|
| Style | Scène immersive : *gestes détaillés* + paroles | **SMS texte seul** : aucune action, aucun astérisque |
| Longueur | 200–350 mots (réglable : Profil → Réglages → IA) | 1 à 2 phrases courtes |
| Stockage | `ow_chat2_<id>` | `ow_sms_<id>` |
| Mémoire | résumé + faits + 🧠 | résumé + faits propres aux SMS |

Les deux se « connaissent » : le SMS reprend les faits/résumé et les dernières scènes de l'Histoire ; l'Histoire voit les derniers SMS. Les épingles 🧠 valent pour les deux.
- Le bouton 📍 (position + taxi) n'existe plus que dans le chat du téléphone.
- Les événements de taxi/rencontre (« Tu sors du taxi… ») restent dans l'Histoire.
- Anciennes conversations du téléphone : elles étaient mélangées à l'Histoire, elles restent donc dans l'Histoire ; les SMS repartent de zéro.

**Écrire dans l'Histoire** : au-dessus de la zone de texte, le bouton **＊ Action** insère `**` avec le curseur au milieu (tape ton geste) ; un 2e clic ferme le geste et te laisse écrire ta réplique. Si du texte est sélectionné, il est mis entre astérisques. Le champ est multi-lignes (Entrée = envoyer sur ordinateur, ➤ sur mobile).

**Gestes très détaillés** : le prompt Histoire impose 2 à 4 phrases par bloc d'action (posture, déplacement, regard, micro-expressions, voix, décor, objets), l'émotion montrée par le corps, une réaction à *tes* actions, de la continuité (lieu, vêtements, objets) et une avancée de l'intrigue à chaque tour. Le rendu final dépend aussi du modèle choisi : un modèle plus gros = gestes plus riches.

**Autres corrections**
- Deux personnages portant le même nom étaient confondus dans le menu ⋯ et la régénération.
- ↻ « Nouvelle réponse » / swipe génère maintenant une vraie nouvelle réponse (avec l'IA).
- Les `*actions*` s'affichent en italique, les retours à la ligne sont conservés.
- Les réponses IA ne reçoivent plus le texte générique ajouté par l'ancien code.

## Brancher l'IA (2 options)

### Option A — Ma clé API (le plus rapide, pour toi seul)
1. Crée un compte sur https://openrouter.ai, ajoute quelques crédits, crée une clé (`sk-or-v1-…`).
2. Dans l'app : **Profil → Réglages → Intelligence artificielle** → Mode « Ma clé API ».
3. Colle la clé, choisis un modèle, **Tester la connexion**, **Enregistrer**.
La clé reste dans le navigateur de ton appareil. À n'utiliser que pour toi (quelqu'un qui ouvre ton appareil peut la voir).

### Option B — Proxy (recommandé si tu publies l'app ou la partages)
La clé reste secrète sur un petit serveur gratuit (Cloudflare Workers).
1. https://dash.cloudflare.com → Workers & Pages → Create → Worker → colle le contenu de `proxy/worker.js` → Deploy.
2. Worker → Settings → Variables and Secrets : ajoute `OPENROUTER_API_KEY` (Secret), `MODEL` (ex. `deepseek/deepseek-chat`) et `ALLOWED_ORIGIN` (l'adresse exacte de ton app, ex. `https://monsite.github.io`).
3. Dans l'app : mode « Mon serveur proxy », colle l'URL du Worker (`https://….workers.dev`), **Tester**.
(Tu peux aussi mettre l'URL dans `window.OW_AI_URL` au début du script du chat : elle sera utilisée par défaut.)

## Choisir le modèle
C'est le principal levier de qualité/coût. Le nom doit être exact (liste : https://openrouter.ai/models). Pour du jeu de rôle en français, essaie plusieurs modèles via le champ « Modèle » (les modèles plus gros écrivent mieux et respectent mieux le personnage, mais coûtent plus). Les noms proposés dans la liste sont des suggestions : vérifie qu'ils existent toujours.

## Si ça ne répond pas
Un bandeau en bas du chat affiche la cause (clé invalide, crédits épuisés, URL, CORS…). Le chat retombe alors sur les anciennes réponses pré-écrites.
