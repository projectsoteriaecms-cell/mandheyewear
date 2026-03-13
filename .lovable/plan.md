

## Update Mobile Hamburger Menu Items

### Problem

The mobile hamburger menu (MobileTopBar) has "Find a Store", "Contact Us", and "FAQ" which are less critical since this is a mobile-first PWA where core actions are already in the bottom nav. Meanwhile, desktop navigation has category links (Eyeglasses, Sunglasses, Accessories) that are missing from the mobile hamburger.

### Current state

**Desktop MainNav**: Style Quiz, Virtual Try-On, Eyeglasses, Sunglasses, Accessories, Eye Exams
**Mobile Bottom Nav**: Home, Shop, Book, Search, Account
**Mobile Hamburger**: Style Quiz, Virtual Try-On, **Find a Store**, **Contact Us**, About Us, **FAQ**

Missing from mobile hamburger: **Eyeglasses, Sunglasses, Accessories** (the direct category links)

### Changes

**File: `src/components/navigation/MobileTopBar.tsx`** — Update the `menuItems` array:

Replace:
- "Find a Store" → **Eyeglasses** (`/eyewear?category=eyeglasses`)
- "Contact Us" → **Sunglasses** (`/eyewear?category=sunglasses`)
- "FAQ" → **Accessories** (`/eyewear?category=accessories`)

Keep: Style Quiz, Virtual Try-On, About Us

Final hamburger menu order:
1. Style Quiz (highlighted)
2. Virtual Try-On (highlighted)
3. Eyeglasses
4. Sunglasses
5. Accessories
6. About Us

This aligns the mobile hamburger with desktop navigation categories while the bottom nav handles Home, Shop, Book, Search, and Account.

