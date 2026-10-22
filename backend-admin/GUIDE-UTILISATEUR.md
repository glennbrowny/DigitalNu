# Guide d'utilisation du back-office — Digital Numérique

## Se connecter

1. Allez sur `https://votre-domaine-admin/admin/login.php`.
2. Renseignez l'email et le mot de passe créés lors de l'installation.
3. Vous êtes automatiquement déconnecté après 30 minutes d'inactivité, pour
   des raisons de sécurité.

## Changer le logo

1. Dans le menu, cliquez sur **Logo**.
2. Cliquez sur le champ fichier, choisissez une image (PNG, JPG, WebP ou
   SVG, 2 Mo maximum).
3. Cliquez sur **Mettre à jour le logo**.
4. Le nouveau logo apparaît immédiatement sur le tableau de bord, et sera
   repris automatiquement par le site public (`glennbrowny.github.io`) dans
   les minutes qui suivent, sans rien avoir à faire d'autre.

## Ajouter, remplacer ou supprimer une photo

1. Allez dans **Photos**.
2. Pour ajouter une photo : remplissez le formulaire du haut (fichier,
   titre, description, catégorie) puis cliquez sur **Ajouter à la
   galerie**. La catégorie détermine dans quel filtre elle apparaîtra sur
   le site (Photographie / Graphisme / Développement web).
3. Pour remplacer une photo existante : dans le tableau, choisissez un
   nouveau fichier sur la ligne correspondante et cliquez sur
   **Remplacer**.
4. Pour masquer une photo sans la supprimer : cliquez sur **Masquer**
   (elle disparaît du site public mais reste dans l'admin).
5. Pour supprimer définitivement une photo : cliquez sur **Supprimer**
   puis confirmez.

## Créer un message d'événement

1. Allez dans **Messages d'événements**.
2. Remplissez le formulaire : nom de l'événement (ex. « Noël »), message de
   vœux (200 caractères maximum), thème de couleur, date de début et date
   de fin d'affichage.
3. Cochez **Actif** pour qu'il soit affiché dès que la période commence.
4. Cliquez sur **Créer le message**.
5. Le message apparaîtra automatiquement en bannière en haut de la page
   d'accueil du site public pendant toute la période choisie, puis
   disparaîtra tout seul à la date de fin — aucune action supplémentaire
   n'est nécessaire.
6. Pour le modifier plus tard, cliquez sur **Modifier** sur sa ligne dans le
   tableau. Pour le retirer temporairement sans le supprimer, cliquez sur
   **Désactiver**.

## Bon à savoir

- Un seul message d'événement est affiché à la fois sur le site (le plus
  récent parmi ceux actifs et dans leur période de validité).
- Toutes les actions (connexion, upload, suppression...) sont journalisées
  pour la traçabilité.
- Si le site public n'affiche pas immédiatement vos changements, videz le
  cache de votre navigateur (Ctrl+F5) — le contenu est mis à jour par un
  appel automatique à chaque chargement de page.
