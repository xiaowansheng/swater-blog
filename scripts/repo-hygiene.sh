#!/usr/bin/env bash

set -euo pipefail

tracked_env_files="$(
  git ls-files | while IFS= read -r file; do
    [[ -e "${file}" ]] || continue
    echo "${file}"
  done | grep -E '(^|/)\.env($|\.(development|production|local|test|staging))' | grep -vE '(^|/)\.env\.example$' || true
)"

if [[ -n "${tracked_env_files}" ]]; then
  echo "Tracked environment files found. Keep only .env.example templates in git:"
  echo "${tracked_env_files}"
  exit 1
fi

absolute_workspace_paths="$(git grep -n '/home/xiaowansheng/projects/develop-projects/swater-blog' -- README.md docs blog-admin blog-web blog-service blog-tools 2>/dev/null || true)"

if [[ -n "${absolute_workspace_paths}" ]]; then
  echo "Absolute local workspace paths found. Use relative repository links instead:"
  echo "${absolute_workspace_paths}"
  exit 1
fi

echo "Repo hygiene checks passed."
