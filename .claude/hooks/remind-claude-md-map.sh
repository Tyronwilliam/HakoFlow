#!/bin/bash
# Hook Stop : quand la structure du code a changé pendant la session
# (fichiers ajoutés/supprimés/renommés sous src/features ou src/app,
# ou package.json modifié) et que CLAUDE.md n'a pas été touché,
# rappelle à Claude de mettre à jour les sections "Carte de src/" /
# "Commandes" de CLAUDE.md. Une seule fois par session.

input=$(cat)
session_id=$(printf '%s' "$input" | jq -r '.session_id // "unknown"' 2>/dev/null)
marker="${TMPDIR:-/tmp}/claude-carte-reminder-${session_id}"
[ -f "$marker" ] && exit 0

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$repo_root" || exit 0

# CLAUDE.md déjà modifié dans la working tree → considéré comme à jour
[ -n "$(git status --porcelain -- CLAUDE.md 2>/dev/null)" ] && exit 0

# Changements structurels : ajouts (?? / A), suppressions (D), renommages (R)
structural=$(git status --porcelain -- src/features src/app 2>/dev/null | awk '$1 ~ /[?ADR]/ {print $2}')
pkg=$(git status --porcelain -- package.json 2>/dev/null)

[ -z "$structural" ] && [ -z "$pkg" ] && exit 0

touch "$marker"
files=$(printf '%s\n%s\n' "$structural" "${pkg:+package.json}" | grep -v '^$' | head -10 | tr '\n' ' ')
jq -cn --arg files "$files" '{
  decision: "block",
  reason: ("La structure du code a changé cette session (" + $files + "). Vérifie si les sections « Carte de src/ » ou « Commandes » de CLAUDE.md doivent être mises à jour et fais-le si besoin. Si rien ne doit changer (simple modification de fichiers existants déjà cartographiés), termine sans rien faire.")
}'
