/* Pantry Pal — recipe dataset + recommendation engine.
   Exports window.RECIPES and window.recommend(pantry). Everything is free. */

window.RECIPES = [
  {
    id: 'salmon', name: 'Pan-Seared Salmon & Asparagus', cuisine: 'Seafood',
    time: '25 min', cal: 380, protein: '34g', servings: 2, difficulty: 'Easy',
    img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&q=80&auto=format',
    ingredients: ['Salmon fillets', 'Asparagus', 'Olive oil', 'Butter', 'Garlic', 'Lemon', 'Fresh dill', 'Salt', 'Black pepper', 'Capers'],
    steps: [
      'Pat salmon dry and season both sides with salt and pepper.',
      'Heat olive oil in a skillet over medium-high until shimmering.',
      'Sear salmon skin-side up for 4 minutes until a golden crust forms.',
      'Flip, add butter and minced garlic, baste for 2 minutes.',
      'Remove salmon, sauté asparagus in the pan with a squeeze of lemon, 3–4 min.',
      'Plate salmon over asparagus, garnish with dill and capers.',
    ],
  },
  {
    id: 'chicken', name: 'Garlic Butter Chicken', cuisine: 'Quick Dinner',
    time: '30 min', cal: 410, protein: '38g', servings: 4, difficulty: 'Easy',
    img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&q=80&auto=format',
    ingredients: ['Chicken breast', 'Garlic', 'Butter', 'Lemon', 'Olive oil', 'Parsley', 'Salt', 'Black pepper', 'Paprika'],
    steps: [
      'Season chicken with salt, pepper, and paprika.',
      'Sear in olive oil over medium-high heat, 5–6 min per side until golden.',
      'Lower heat, add butter and minced garlic, cook 1 minute.',
      'Squeeze in lemon and spoon the garlic butter over the chicken.',
      'Rest 5 minutes, scatter with parsley, and serve.',
    ],
  },
  {
    id: 'pasta', name: 'Lemon Herb Pasta', cuisine: 'Italian',
    time: '20 min', cal: 480, protein: '14g', servings: 4, difficulty: 'Easy',
    img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format',
    ingredients: ['Pasta', 'Garlic', 'Lemon', 'Olive oil', 'Parmesan', 'Basil', 'Butter', 'Salt', 'Black pepper'],
    steps: [
      'Cook pasta in salted water until al dente, reserve ½ cup pasta water.',
      'Gently sizzle minced garlic in olive oil and butter, do not brown.',
      'Add lemon zest, juice, and a splash of pasta water to form a light sauce.',
      'Toss pasta in the sauce with grated parmesan until glossy.',
      'Finish with torn basil and cracked black pepper.',
    ],
  },
  {
    id: 'omelette', name: 'Classic Fluffy Omelette', cuisine: 'Breakfast',
    time: '10 min', cal: 220, protein: '16g', servings: 1, difficulty: 'Easy',
    img: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=900&q=80&auto=format',
    ingredients: ['Eggs', 'Butter', 'Cheese', 'Chives', 'Salt', 'Black pepper', 'Milk'],
    steps: [
      'Whisk eggs with a splash of milk, salt, and pepper until uniform.',
      'Melt butter in a non-stick pan over medium-low heat.',
      'Pour in eggs, gently stir, then let set into a soft sheet.',
      'Add cheese to one half and fold over.',
      'Slide onto a plate and top with chopped chives.',
    ],
  },
  {
    id: 'quinoa', name: 'Mediterranean Quinoa Bowl', cuisine: 'Mediterranean',
    time: '20 min', cal: 420, protein: '14g', servings: 2, difficulty: 'Easy',
    img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&q=80&auto=format',
    ingredients: ['Quinoa', 'Cherry tomatoes', 'Cucumber', 'Kalamata olives', 'Feta cheese', 'Red onion', 'Parsley', 'Olive oil', 'Lemon', 'Garlic', 'Chickpeas'],
    steps: [
      'Rinse quinoa and simmer in salted water 15 min until fluffy, then cool.',
      'Halve tomatoes, dice cucumber, slice onion, chop olives.',
      'Whisk olive oil, lemon juice, minced garlic, salt and pepper.',
      'Combine quinoa, vegetables, and chickpeas; toss with dressing.',
      'Top with crumbled feta and fresh parsley.',
    ],
  },
  {
    id: 'tomato-soup', name: 'Tomato Basil Soup', cuisine: 'Comfort',
    time: '35 min', cal: 240, protein: '6g', servings: 4, difficulty: 'Easy',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80&auto=format',
    ingredients: ['Tomatoes', 'Garlic', 'Onion', 'Basil', 'Cream', 'Olive oil', 'Vegetable stock', 'Salt', 'Black pepper'],
    steps: [
      'Soften chopped onion and garlic in olive oil over medium heat.',
      'Add tomatoes and stock, simmer 20 minutes.',
      'Blend until smooth, then return to the pot.',
      'Stir in cream and most of the basil, season to taste.',
      'Serve topped with remaining basil and a drizzle of olive oil.',
    ],
  },
  {
    id: 'ribs', name: 'Smoked Honey Glazed Ribs', cuisine: 'American BBQ',
    time: '3 hr 30 min', cal: 680, protein: '42g', servings: 4, difficulty: 'Advanced',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80&auto=format',
    ingredients: ['Baby back ribs', 'Honey', 'Brown sugar', 'Smoked paprika', 'Garlic powder', 'Onion powder', 'Cumin', 'Apple cider vinegar', 'Dijon mustard', 'Salt', 'Black pepper'],
    steps: [
      'Mix brown sugar, paprika, garlic powder, onion powder, cumin, salt and pepper into a rub.',
      'Coat ribs and refrigerate at least 4 hours.',
      'Smoke at 225°F for 3 hours, spritzing with cider vinegar every 45 min.',
      'Whisk honey and Dijon for the glaze; brush onto ribs.',
      'Wrap in foil and cook 30 more minutes until tender, then rest and slice.',
    ],
  },
  {
    id: 'tacos', name: 'Carnitas Street Tacos', cuisine: 'Mexican',
    time: '2 hr 15 min', cal: 380, protein: '26g', servings: 6, difficulty: 'Medium',
    img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&q=80&auto=format',
    ingredients: ['Pork shoulder', 'Corn tortillas', 'White onion', 'Cilantro', 'Limes', 'Orange juice', 'Cumin', 'Oregano', 'Garlic', 'Avocado', 'Salt'],
    steps: [
      'Season pork chunks with cumin, oregano, and salt; sear until browned.',
      'Add orange juice, garlic, and braise covered at 300°F for 2 hours.',
      'Shred, then broil 5 minutes until edges crisp.',
      'Warm tortillas, fill with carnitas, onion, cilantro, and lime.',
      'Serve with avocado and salsa.',
    ],
  },
  {
    id: 'ramen', name: 'Tonkotsu Ramen', cuisine: 'Japanese',
    time: '4 hr', cal: 520, protein: '28g', servings: 4, difficulty: 'Advanced',
    img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80&auto=format',
    ingredients: ['Pork bones', 'Pork belly', 'Ramen noodles', 'Eggs', 'Nori', 'Green onions', 'Garlic', 'Ginger', 'Soy sauce', 'Mirin', 'Sesame oil'],
    steps: [
      'Blanch pork bones, then simmer hard with garlic and ginger 3–4 hours until milky.',
      'Braise pork belly in soy, mirin and water for 2 hours.',
      'Soft-boil eggs 6.5 min and marinate in soy-mirin.',
      'Season broth with soy, sesame oil and white pepper; cook noodles.',
      'Assemble broth, noodles, chashu, egg, nori and scallions.',
    ],
  },
  {
    id: 'cake', name: 'Dark Chocolate Layer Cake', cuisine: 'Dessert',
    time: '1 hr 45 min', cal: 450, protein: '6g', servings: 12, difficulty: 'Medium',
    img: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80&auto=format',
    ingredients: ['Dark chocolate', 'Flour', 'Cocoa powder', 'Butter', 'Sugar', 'Eggs', 'Buttermilk', 'Vanilla', 'Baking soda', 'Espresso powder', 'Heavy cream'],
    steps: [
      'Melt chocolate with hot espresso; cool slightly.',
      'Whisk flour, cocoa, sugar, baking soda and salt.',
      'Beat eggs with buttermilk and vanilla, fold into the chocolate.',
      'Combine wet and dry; bake in three pans at 350°F for 25–30 min.',
      'Make ganache with cream and chocolate; layer and frost the cooled cakes.',
    ],
  },
];

// Recommendation: rank recipes by how many pantry items they use.
window.recommend = function (pantry) {
  const items = (pantry || []).map(p => p.toLowerCase().trim()).filter(Boolean);
  return window.RECIPES
    .map(r => {
      const ing = r.ingredients.map(i => i.toLowerCase());
      const matched = items.filter(it => ing.some(i => i.includes(it) || it.includes(i)));
      return { ...r, matchCount: matched.length, matched };
    })
    .sort((a, b) => b.matchCount - a.matchCount || a.cal - b.cal);
};
