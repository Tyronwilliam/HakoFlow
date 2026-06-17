# Recap — pistes pour "seniorize" la feature inbox

Checklist des points à traiter, par ordre d'impact.

## 4. Truncation de `lastMessagePreview`

Le TODO en commentaire ("Faire une substring... 60 caractere") devrait être
résolu côté adapter/API (`toConversationListItem`) plutôt que rester en
commentaire dans le composant. `line-clamp-2` gère déjà l'affichage, donc
vérifier si ce TODO est encore nécessaire avant de l'implémenter.

## 11 Documenter nouveau pattern API - Queries
