#!/bin/bash
# Simple setup script for local development.
# Installs dependencies and runs tests.

set -e

npm install
npm test
