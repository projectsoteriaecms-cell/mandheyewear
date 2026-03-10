-- Fix cart_items: drop restrictive policy and create permissive one
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;

CREATE POLICY "Users can manage own cart"
ON public.cart_items
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);