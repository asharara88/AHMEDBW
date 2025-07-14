/*
  # Remove todos and deployments tables

  1. Changes
    - Drop the todos table if it exists
    - Drop the deployments table if it exists
    - Remove any associated indexes and policies
*/

-- Drop todos table if it exists
DROP TABLE IF EXISTS public.todos CASCADE;

-- Drop deployments table if it exists
DROP TABLE IF EXISTS public.deployments CASCADE;