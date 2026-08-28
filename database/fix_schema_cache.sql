-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE SCHEMA CACHE ERROR
-- "Could not find the 'entity_name' column of 'users' in the schema cache." happens 
-- when you alter a table but the Supabase REST API (PostgREST) hasn't picked up the changes yet.

NOTIFY pgrst, 'reload schema';
