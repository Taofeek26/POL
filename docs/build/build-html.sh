#!/usr/bin/env bash
# Regenerate POL_PROJECT_BLUEPRINT.html from the Markdown source (requires pandoc).
set -euo pipefail
cd "$(dirname "$0")/.."
pandoc POL_PROJECT_BLUEPRINT.md -f gfm+yaml_metadata_block -s --toc --toc-depth=2 \
  --metadata pagetitle="POL Project Blueprint" \
  -H build/style.html -A build/after.html -o POL_PROJECT_BLUEPRINT.html
echo "Built docs/POL_PROJECT_BLUEPRINT.html"
