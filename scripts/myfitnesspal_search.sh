#!/bin/bash
# Example script to search MyFitnessPal via RapidAPI
# Usage: ./myfitnesspal_search.sh "search term" [page]
# Requires RAPIDAPI_KEY environment variable

KEYWORD=${1:-oreo}
PAGE=${2:-1}

curl --request GET \
  --url "https://myfitnesspal2.p.rapidapi.com/searchByKeyword?keyword=${KEYWORD}&page=${PAGE}" \
  --header 'x-rapidapi-host: myfitnesspal2.p.rapidapi.com' \
  --header "x-rapidapi-key: ${RAPIDAPI_KEY}"
