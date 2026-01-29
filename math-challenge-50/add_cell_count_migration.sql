-- Migration: Add cell_count column to game_results table
-- This allows tracking custom cell count modes (10-100 cells)

-- Add cell_count column (defaults to 50 for existing records)
ALTER TABLE public.game_results 
ADD COLUMN IF NOT EXISTS cell_count INTEGER DEFAULT 50 CHECK (cell_count >= 10 AND cell_count <= 100);

-- Update score and correct_count/incorrect_count constraints to allow values up to 100
-- First, drop existing constraints
ALTER TABLE public.game_results 
DROP CONSTRAINT IF EXISTS game_results_score_check;

ALTER TABLE public.game_results 
DROP CONSTRAINT IF EXISTS game_results_correct_count_check;

ALTER TABLE public.game_results 
DROP CONSTRAINT IF EXISTS game_results_incorrect_count_check;

-- Add new constraints that allow up to 100
ALTER TABLE public.game_results 
ADD CONSTRAINT game_results_score_check CHECK (score >= 0 AND score <= 100);

ALTER TABLE public.game_results 
ADD CONSTRAINT game_results_correct_count_check CHECK (correct_count >= 0 AND correct_count <= 100);

ALTER TABLE public.game_results 
ADD CONSTRAINT game_results_incorrect_count_check CHECK (incorrect_count >= 0 AND incorrect_count <= 100);

-- Create index for cell_count for better query performance
CREATE INDEX IF NOT EXISTS idx_game_results_cell_count ON public.game_results(cell_count);

-- Update existing records to have cell_count = 50 (standard mode)
UPDATE public.game_results 
SET cell_count = 50 
WHERE cell_count IS NULL;
