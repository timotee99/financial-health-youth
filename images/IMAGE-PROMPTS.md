# Money Adventure Academy - Image Assets

## Image Generation Prompts

Use these prompts with AI image generators (Midjourney, DALL-E, Stable Diffusion) to create custom illustrations for the app.

### Main Character

**money-mike.png** - "A cheerful 10-year-old cartoon boy with short brown hair, wearing a green t-shirt with a dollar sign, blue jeans, and a backwards baseball cap with a gold dollar sign. Big smile, bright eyes, friendly and approachable. Children's book illustration style, bright colors, white background."

### Icons and Illustrations

**piggy-bank.png** - "Cute smiling pink piggy bank with a coin slot on top, cartoon style, bright colors, white background. Children's book illustration."

**coins.png** - "Stack of shiny gold coins, various sizes, cartoon style with sparkles, bright colors, white background."

**dollar-bill.png** - "A friendly smiling dollar bill character with eyes and arms, cartoon style, green color, white background."

**lemonade-stand.png** - "Colorful lemonade stand with a smiling child selling lemonade, bright yellow lemons, cartoon style, white background."

**bicycle.png** - "Bright red bicycle with training wheels and a basket, cartoon style, white background."

**candy.png** - "Assorted colorful wrapped candies and lollipops, cartoon style, bright colors, white background."

**toys.png** - "Assorted children's toys: building blocks, a robot, a teddy bear, and a puzzle, cartoon style, bright colors, white background."

### Lesson-Specific

**needs-icon.png** - "Split image: left side showing water drop, house, apple, book (needs); right side showing video game controller, ice cream cone, toy robot, skateboard (wants). Cartoon style, white background."

**save-spend-give-jars.png** - "Three glass jars labeled SAVE (green), SPEND (blue), GIVE (pink). Each jar has a different amount of coins inside. Cartoon style, white background."

**city-map.png** - "Colorful overhead view of a neighborhood with houses, trees, a park, and a lemonade stand. Cartoon map style with dotted paths, bright colors."

**growth-chart.png** - "A colorful line graph showing exponential growth going up and up, with a penny at the start and piles of money at the end. Cartoon style with arrows and sparkles."

## Royalty-Free Alternatives

If creating custom images, use these royalty-free sources:

- **Unsplash** (unsplash.com) - Search: "child smiling" for Money Mike inspiration
- **Pixabay** (pixabay.com) - Search: "piggy bank", "money", "coins" for financial icons
- **OpenMoji** (openmoji.org) - Open-source emoji library with piggy bank, coins, and financial icons
- **Freepik** (freepik.com) - Search: "financial literacy kids" for educational illustrations

## Placeholder Strategy

The app uses emoji characters (🪙 💰 🏦 🍋 🚲 🍬 🧸) as visual placeholders in all components. These work without any image files and are universally supported. Replace with custom images when available.

To add custom images:
1. Generate images using prompts above
2. Save to src/assets/images/
3. Reference in components as: `src="/assets/images/money-mike.png"`

## Sound Effects

The app uses the Web Audio API to generate sounds programmatically:
- Success sound: Rising sine wave tones
- Incorrect sound: Low square wave tone
- Badge earned: Ascending arpeggio
- Coin sound: Short triangle wave clicks

To replace with audio files:
1. Save .mp3 or .wav files to src/assets/sounds/
2. Update AudioService to load from files instead of generating
