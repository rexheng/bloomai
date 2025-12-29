-- Seed Shop Items
-- This migration populates the items table with initial shop inventory

INSERT INTO public.items (name, description, category, point_cost, image_url, rarity) VALUES
  -- Plants (4 items)
  ('Succulent', 'A charming little desert plant that thrives on neglect. Perfect for busy bloomers!', 'plant', 50, '/items/succulent.png', 'common'),
  ('Fern', 'Lush, leafy fern that adds a touch of forest magic to your space.', 'plant', 100, '/items/fern.png', 'common'),
  ('Monstera', 'The trendy monstera with its iconic split leaves. A true statement piece!', 'plant', 150, '/items/monstera.png', 'uncommon'),
  ('Sunflower', 'A bright, cheerful sunflower that follows the light. Radiates positivity!', 'plant', 200, '/items/sunflower.png', 'rare'),
  
  -- Furniture (4 items)
  ('Cozy Chair', 'A comfortable desk chair for those long reflection sessions.', 'furniture', 75, '/items/chair.png', 'common'),
  ('Warm Lamp', 'A soft, warm desk lamp that creates the perfect ambiance.', 'furniture', 100, '/items/lamp.png', 'common'),
  ('Soft Rug', 'A plush floor rug that makes your space feel like home.', 'furniture', 125, '/items/rug.png', 'uncommon'),
  ('Bookshelf', 'A filled bookshelf brimming with stories and wisdom.', 'furniture', 200, '/items/bookshelf.png', 'rare')

ON CONFLICT DO NOTHING;
