// ── FILE: js/disease-db.js ─────────────────────────────

export const DISEASE_DB = {
  // Apple (4)
  'Apple___Apple_scab': {
    emoji: '🍎',
    crop: 'Apple',
    disease: 'Apple Scab',
    isHealthy: false,
    severity: 'High',
    cause: 'Fungal (Venturia inaequalis)',
    description: 'A fungal disease that manifests as dull black or grey-brown lesions on leaves, fruit, and twigs. Severe infections can cause extensive defoliation and deform fruit, severely impacting yield.',
    symptoms: 'Olive-green spots on leaves that turn brown/black and velvety. Severely infected leaves twist and fall early. Scabs on fruit with cracking skin.',
    immediateAction: 'Remove and destroy fallen leaves to reduce overwintering fungus. Apply a protective fungicide immediately if symptoms are caught early.',
    chemical: {
      ingredient: 'Captan 50 WP or Myclobutanil',
      rate: 'Follow label instructions (approx 2-3g per litre)',
      frequency: 'Every 7–10 days from green tip through petal fall, especially during wet weather'
    },
    organic: {
      remedy: 'Copper-based fungicides or Liquid Sulfur',
      application: 'Spray at silver tip stage, repeating every 1-2 weeks before rain'
    },
    prevention: [
      'Plant scab-resistant varieties (e.g., Liberty, Freedom, Enterprise)',
      'Prune canopy annually to improve air circulation and sunlight penetration',
      'Flail mow fallen leaves in autumn to accelerate decomposition',
      'Apply urea to fallen leaves in autumn to disrupt fungus overwintering'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Apple_scab'
  },
  'Apple___Black_rot': {
    emoji: '🍎',
    crop: 'Apple',
    disease: 'Black Rot',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Botryosphaeria obtusa)',
    description: 'Black rot infects leaves, fruit, and wood. It can cause frogeye leaf spot, fruit rot, and limb cankers, potentially killing the tree if left unmanaged.',
    symptoms: 'Leaves develop "frogeye" spots (purple margins with light centers). Fruit develops brown spots that expand and turn black, often becoming mummified.',
    immediateAction: 'Prune out dead or diseased wood and cankers immediately, cutting at least 15cm below the visible infection.',
    chemical: {
      ingredient: 'Thiophanate-methyl or Captan',
      rate: 'As per label',
      frequency: 'Apply from silver tip until harvest, especially before rain'
    },
    organic: {
      remedy: 'Copper sprays or Lime Sulfur',
      application: 'Apply during dormancy and early bud break'
    },
    prevention: [
      'Remove all mummified fruit from trees and the ground',
      'Prune out dead wood where the fungus overwinters',
      'Ensure proper tree nutrition to maintain vigor'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Black_rot_(apple_disease)'
  },
  'Apple___Cedar_apple_rust': {
    emoji: '🍎',
    crop: 'Apple',
    disease: 'Cedar Apple Rust',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Gymnosporangium juniperi-virginianae)',
    description: 'A unique rust fungus that requires two hosts (apple trees and eastern red cedar) to complete its life cycle. It causes significant defoliation and fruit blemishes.',
    symptoms: 'Bright yellow-orange spots on apple leaves, eventually developing cup-like structures on the underside. Infected fruit develops raised orange lesions.',
    immediateAction: 'Apply fungicide immediately if weather is wet and you are within a mile of infected cedar trees.',
    chemical: {
      ingredient: 'Myclobutanil or Mancozeb',
      rate: 'As per label',
      frequency: 'From pink bud stage until 2-3 weeks after petal fall'
    },
    organic: {
      remedy: 'Sulfur or Copper sprays',
      application: 'Preventative sprays during the pink bud stage'
    },
    prevention: [
      'Remove Eastern Red Cedar trees within a 1-2 mile radius if possible',
      'Plant rust-resistant apple varieties',
      'Clean up fallen leaves to reduce localized spore counts'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Gymnosporangium_juniperi-virginianae'
  },
  'Apple___healthy': {
    emoji: '🍎',
    crop: 'Apple',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'This apple leaf appears completely healthy with no visible signs of fungal, bacterial, or viral infections. The plant exhibits good vigor and coloration.',
    symptoms: 'None. Leaves are green, uniform, and free of spots or discoloration.',
    immediateAction: 'Continue current crop management practices.',
    prevention: [
      'Maintain routine pruning for air circulation',
      'Ensure balanced soil nutrition and proper watering',
      'Keep up with preventative dormant sprays during winter'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Apple'
  },

  // Blueberry (1)
  'Blueberry___healthy': {
    emoji: '🫐',
    crop: 'Blueberry',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'This blueberry leaf shows no signs of disease. The foliage is vibrant and intact, indicating proper nutrition and pest management.',
    symptoms: 'None.',
    immediateAction: 'Maintain current acidic soil conditions (pH 4.5-5.5).',
    prevention: [
      'Ensure soil pH remains optimal using sulfur if necessary',
      'Mulch with pine needles to retain moisture and acidity',
      'Prune older canes to encourage new growth'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Blueberry'
  },

  // Cherry (2)
  'Cherry_(including_sour)___Powdery_mildew': {
    emoji: '🍒',
    crop: 'Cherry',
    disease: 'Powdery Mildew',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Podosphaera clandestina)',
    description: 'A fungal disease that covers leaves in a white, powdery growth. It can stunt the growth of young trees and affect fruit quality and yield.',
    symptoms: 'White to pale gray powdery patches on the upper surface of leaves. Leaves may become curled, blistered, or stunted.',
    immediateAction: 'Apply a fungicide suitable for powdery mildew at the first sign of white spots.',
    chemical: {
      ingredient: 'Myclobutanil or Fenarimol',
      rate: 'As per label',
      frequency: 'Apply at shuck fall and repeat every 2 weeks if conditions remain humid'
    },
    organic: {
      remedy: 'Neem oil or Potassium bicarbonate',
      application: 'Spray every 7-10 days, avoiding application during extreme heat'
    },
    prevention: [
      'Prune to open the canopy and increase air circulation',
      'Avoid excess nitrogen fertilizer which promotes susceptible leafy growth',
      'Plant trees in full sun'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Powdery_mildew'
  },
  'Cherry_(including_sour)___healthy': {
    emoji: '🍒',
    crop: 'Cherry',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'This cherry leaf is healthy and shows no visible signs of stress or disease.',
    symptoms: 'None.',
    immediateAction: 'Continue standard care.',
    prevention: [
      'Ensure adequate irrigation during dry spells',
      'Monitor for aphids and fruit flies',
      'Apply dormant oils in winter to suppress overwintering pests'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Cherry'
  },

  // Corn (4)
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    emoji: '🌽',
    crop: 'Corn',
    disease: 'Gray Leaf Spot',
    isHealthy: false,
    severity: 'High',
    cause: 'Fungal (Cercospora zeae-maydis)',
    description: 'A major yield-limiting disease worldwide. It thrives in high humidity and causes extensive leaf necrosis, reducing the plant\'s ability to photosynthesize.',
    symptoms: 'Small tan spots that elongate into rectangular, pale brown-to-gray lesions restricted by leaf veins. Heavy infection causes leaves to blight entirely.',
    immediateAction: 'If identified before tasseling in susceptible hybrids, apply a foliar fungicide.',
    chemical: {
      ingredient: 'Pyraclostrobin or Azoxystrobin (QoI fungicides)',
      rate: 'Follow label (approx 6-9 fl oz/acre)',
      frequency: 'Apply between VT (tasseling) and R1 (silking) stages'
    },
    organic: {
      remedy: 'Crop rotation (no effective organic foliar sprays for large scale)',
      application: 'Rotate to non-host crops like soybeans for 1-2 years'
    },
    prevention: [
      'Plant resistant corn hybrids',
      'Implement deep tillage to bury infected crop residue',
      'Rotate crops to avoid planting corn-on-corn'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Corn_grey_leaf_spot'
  },
  'Corn_(maize)___Common_rust_': {
    emoji: '🌽',
    crop: 'Corn',
    disease: 'Common Rust',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Puccinia sorghi)',
    description: 'A rust fungus that favors cool, humid conditions. It is usually not severe on field corn but can cause economic losses in sweet corn.',
    symptoms: 'Oval or elongated cinnamon-brown pustules on both upper and lower leaf surfaces. Pustules rupture the epidermis, releasing powdery spores.',
    immediateAction: 'Monitor fields. If pustules appear on multiple leaves before silking on susceptible sweet corn, fungicide may be warranted.',
    chemical: {
      ingredient: 'Propiconazole or Azoxystrobin',
      rate: 'As per label',
      frequency: 'Apply at early onset, usually V8 to VT stages'
    },
    organic: {
      remedy: 'Neem oil (small scale only)',
      application: 'Apply preventatively or at first sign'
    },
    prevention: [
      'Plant rust-resistant hybrids',
      'Plant early to avoid peak late-season spore flights',
      'Manage weeds that may restrict airflow'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Puccinia_sorghi'
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    emoji: '🌽',
    crop: 'Corn',
    disease: 'Northern Leaf Blight',
    isHealthy: false,
    severity: 'High',
    cause: 'Fungal (Exserohilum turcicum)',
    description: 'A foliar disease that causes massive loss of photosynthetic area. If it establishes before silking, yield losses can exceed 30%.',
    symptoms: 'Large, cigar-shaped, grayish-green to tan lesions on leaves, measuring 1 to 6 inches long. Lesions usually begin on lower leaves.',
    immediateAction: 'Apply fungicide if lesions are present on the leaf below the ear leaf prior to tasseling.',
    chemical: {
      ingredient: 'Chlorothalonil or Strobilurins',
      rate: 'As per label',
      frequency: 'VT to R1 stage application'
    },
    organic: {
      remedy: 'Crop rotation and residue management',
      application: 'Rotate away from corn for at least one year'
    },
    prevention: [
      'Select hybrids with strong NCLB resistance ratings',
      'Use tillage to incorporate infected residue into soil',
      'Rotate to non-host crops'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Northern_corn_leaf_blight'
  },
  'Corn_(maize)___healthy': {
    emoji: '🌽',
    crop: 'Corn',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'This corn leaf is healthy with robust green coloration and no necrotic spots or rust pustules.',
    symptoms: 'None.',
    immediateAction: 'Continue current agronomic practices.',
    prevention: [
      'Ensure adequate nitrogen and potassium levels',
      'Scout regularly during VT and R1 stages',
      'Manage irrigation to prevent drought stress'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Maize'
  },

  // Grape (4)
  'Grape___Black_rot': {
    emoji: '🍇',
    crop: 'Grape',
    disease: 'Black Rot',
    isHealthy: false,
    severity: 'High',
    cause: 'Fungal (Guignardia bidwellii)',
    description: 'One of the most destructive diseases of grapes. It attacks leaves, shoots, and fruit, capable of destroying an entire crop in warm, wet weather.',
    symptoms: 'Brown circular spots with dark margins on leaves. Developing grapes turn hard, black, and shrivel into "mummies".',
    immediateAction: 'Apply protective fungicides immediately. Remove any infected fruit mummies from the canopy.',
    chemical: {
      ingredient: 'Myclobutanil or Mancozeb',
      rate: 'As per label',
      frequency: 'Critical window: early bloom through 4 weeks post-bloom'
    },
    organic: {
      remedy: 'Copper hydroxide or Liquid sulfur',
      application: 'Apply preventatively; organic controls are less effective once established'
    },
    prevention: [
      'Sanitation is crucial: remove all mummies from vines and ground in winter',
      'Prune canopy to maximize airflow and sunlight',
      'Plant resistant cultivars if available'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Black_rot_(grape_disease)'
  },
  'Grape___Esca_(Black_Measles)': {
    emoji: '🍇',
    crop: 'Grape',
    disease: 'Esca (Black Measles)',
    isHealthy: false,
    severity: 'Critical',
    cause: 'Fungal Complex (Phaeoacremonium, Phaeomoniella)',
    description: 'A destructive wood disease complex that affects the vascular tissue of older vines, severely restricting water and nutrient flow.',
    symptoms: '"Tiger-stripe" patterns on leaves (interveinal yellowing/browning). Berries develop dark spots ("measles"). Sudden vine collapse can occur mid-summer.',
    immediateAction: 'Mark infected vines. There are no curative chemical sprays. Prune out infected wood down to healthy tissue.',
    chemical: {
      ingredient: 'None effective for cure',
      rate: 'N/A',
      frequency: 'Focus on pruning wound protection (e.g., thiophanate-methyl pastes)'
    },
    organic: {
      remedy: 'Trichoderma-based wound sealants',
      application: 'Apply immediately after winter pruning'
    },
    prevention: [
      'Adopt delayed pruning or double pruning techniques',
      'Protect all large pruning wounds immediately with sealants',
      'Remove and burn severely infected vines'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Esca_(grape_disease)'
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    emoji: '🍇',
    crop: 'Grape',
    disease: 'Leaf Blight',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Pseudocercospora vitis)',
    description: 'Primarily a late-season disease that causes premature defoliation, which can weaken vines for the following winter.',
    symptoms: 'Large, irregular reddish-brown spots on leaves. The underside of the lesions may show dark fungal growth.',
    immediateAction: 'Usually occurs too late in the season to impact current fruit, but severe cases require post-harvest fungicide to protect vines.',
    chemical: {
      ingredient: 'Chlorothalonil',
      rate: 'As per label',
      frequency: 'Apply if defoliation begins before harvest'
    },
    organic: {
      remedy: 'Bordeaux mixture',
      application: 'Apply as a protective barrier late season'
    },
    prevention: [
      'Plow fallen leaves into the soil in late autumn to destroy overwintering inoculum',
      'Maintain good canopy management for airflow'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Grapevine_leaf_blight'
  },
  'Grape___healthy': {
    emoji: '🍇',
    crop: 'Grape',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'The grapevine leaf is healthy, indicating excellent vineyard management and absence of fungal pathogens.',
    symptoms: 'None.',
    immediateAction: 'Continue current IPM (Integrated Pest Management) strategy.',
    prevention: [
      'Continue routine canopy management (shoot thinning, leaf pulling)',
      'Monitor for pests like leafhoppers or spider mites',
      'Ensure proper irrigation scheduling'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Grape'
  },

  // Orange (1)
  'Orange___Haunglongbing_(Citrus_greening)': {
    emoji: '🍊',
    crop: 'Orange',
    disease: 'Citrus Greening (HLB)',
    isHealthy: false,
    severity: 'Critical',
    cause: 'Bacterial (Candidatus Liberibacter asiaticus)',
    description: 'The most devastating citrus disease globally. It kills trees by blocking the vascular system, starving the plant of nutrients. There is no cure.',
    symptoms: 'Asymmetrical, mottled yellowing of leaves. Fruit is small, misshapen, stays green at the bottom, and tastes bitter.',
    immediateAction: 'Report to local agricultural authorities immediately. The tree cannot be saved and must be removed to prevent spread.',
    chemical: {
      ingredient: 'Imidacloprid (for vector control only)',
      rate: 'Soil drench or foliar',
      frequency: 'Apply to control Asian Citrus Psyllid (the insect vector)'
    },
    organic: {
      remedy: 'Reflective mulch and horticultural oils',
      application: 'To deter the psyllid insect vector'
    },
    prevention: [
      'Aggressively control the Asian Citrus Psyllid vector',
      'Only plant certified disease-free nursery stock',
      'Provide optimal nutrition to prolong the productive life of infected trees (though decline is inevitable)'
    ],
    spreadRisk: 'Critical',
    wikiUrl: 'https://en.wikipedia.org/wiki/Citrus_greening_disease'
  },

  // Peach (2)
  'Peach___Bacterial_spot': {
    emoji: '🍑',
    crop: 'Peach',
    disease: 'Bacterial Spot',
    isHealthy: false,
    severity: 'High',
    cause: 'Bacterial (Xanthomonas arboricola)',
    description: 'A serious disease affecting fruit quality and causing severe defoliation, which weakens the tree. It thrives in warm, wet, and windy conditions.',
    symptoms: 'Small, water-soaked spots on leaves that turn brown and fall out, creating a "shot-hole" appearance. Fruit develops deep, cracked lesions.',
    immediateAction: 'Apply a copper-based bactericide immediately, but be cautious of phytotoxicity on peach leaves.',
    chemical: {
      ingredient: 'Oxytetracycline or Copper formulations',
      rate: 'Low rates to avoid leaf burn',
      frequency: 'From shuck split through summer, especially before rains'
    },
    organic: {
      remedy: 'Copper hydroxide (dormant spray)',
      application: 'Apply during late dormancy and early bud swell'
    },
    prevention: [
      'Plant highly resistant peach varieties',
      'Maintain adequate soil nutrition; weak trees are more susceptible',
      'Avoid planting near shelterbelts that restrict airflow'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Bacterial_spot_of_peach'
  },
  'Peach___healthy': {
    emoji: '🍑',
    crop: 'Peach',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'Healthy peach foliage. The tree is currently free from bacterial spot or leaf curl.',
    symptoms: 'None.',
    immediateAction: 'Continue standard orchard maintenance.',
    prevention: [
      'Apply preventative dormant copper spray in winter for Peach Leaf Curl',
      'Prune in early spring to shape canopy',
      'Monitor for oriental fruit moth'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Peach'
  },

  // Bell Pepper (2)
  'Pepper,_bell___Bacterial_spot': {
    emoji: '🫑',
    crop: 'Bell Pepper',
    disease: 'Bacterial Spot',
    isHealthy: false,
    severity: 'High',
    cause: 'Bacterial (Xanthomonas euvesicatoria)',
    description: 'A devastating disease in warm, wet climates. It attacks leaves and fruit, causing defoliation and rendering fruit unmarketable.',
    symptoms: 'Small, dark, water-soaked spots on leaves. As spots enlarge, they turn brown with yellow halos. Fruit develops raised, scabby lesions.',
    immediateAction: 'Apply a copper bactericide mixed with mancozeb immediately to slow the spread.',
    chemical: {
      ingredient: 'Copper sulfate + Mancozeb (tank mix)',
      rate: 'As per label',
      frequency: 'Every 7-10 days during wet weather'
    },
    organic: {
      remedy: 'Copper-based sprays',
      application: 'Apply preventatively; cannot cure existing spots'
    },
    prevention: [
      'Plant resistant pepper varieties (e.g., X3R series)',
      'Use drip irrigation instead of overhead sprinklers',
      'Practice strict crop rotation away from solanaceous crops for 3 years'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Bacterial_spot_of_pepper_and_tomato'
  },
  'Pepper,_bell___healthy': {
    emoji: '🫑',
    crop: 'Bell Pepper',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'This bell pepper plant is healthy, showing bright green, unblemished leaves.',
    symptoms: 'None.',
    immediateAction: 'Maintain current growing conditions.',
    prevention: [
      'Ensure consistent watering to prevent blossom end rot',
      'Stake tall plants to prevent lodging',
      'Monitor for aphids and broad mites'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Bell_pepper'
  },

  // Potato (3)
  'Potato___Early_blight': {
    emoji: '🥔',
    crop: 'Potato',
    disease: 'Early Blight',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Alternaria solani)',
    description: 'A common disease that affects older foliage first. It reduces tuber yield by destroying the photosynthetic canopy.',
    symptoms: 'Dark brown spots on older leaves containing concentric rings (target-board appearance). Leaves turn yellow and drop off.',
    immediateAction: 'Begin fungicide program immediately to protect newer foliage.',
    chemical: {
      ingredient: 'Chlorothalonil or Azoxystrobin',
      rate: 'As per label',
      frequency: 'Every 7-14 days depending on weather severity'
    },
    organic: {
      remedy: 'Copper formulations or Bacillus subtilis',
      application: 'Apply early at first sign of spots'
    },
    prevention: [
      'Maintain optimal soil fertility, especially nitrogen; stressed plants are highly susceptible',
      'Rotate crops with non-solanaceous plants',
      'Allow tubers to fully mature and skin to set before harvesting'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Alternaria_solani'
  },
  'Potato___Late_blight': {
    emoji: '🥔',
    crop: 'Potato',
    disease: 'Late Blight',
    isHealthy: false,
    severity: 'Critical',
    cause: 'Oomycete (Phytophthora infestans)',
    description: 'The infamous disease that caused the Irish Potato Famine. It can destroy entire fields within days under cool, wet conditions.',
    symptoms: 'Water-soaked, dark green to black lesions on leaves. In humid conditions, white fuzzy growth appears on the underside. Tubers rot with a foul odor.',
    immediateAction: 'Apply a curative systemic fungicide immediately. If the field is heavily infected, destroy vines to prevent spores from washing into the soil to tubers.',
    chemical: {
      ingredient: 'Mefenoxam or Cymoxanil',
      rate: 'Maximum label rate',
      frequency: 'Every 5-7 days under high disease pressure'
    },
    organic: {
      remedy: 'Copper sprays (preventative only)',
      application: 'Must be applied before infection occurs'
    },
    prevention: [
      'Plant certified disease-free seed potatoes',
      'Eliminate cull piles and volunteer potatoes',
      'Hill soil up well around the base to protect tubers from spores washing down'
    ],
    spreadRisk: 'Critical',
    wikiUrl: 'https://en.wikipedia.org/wiki/Phytophthora_infestans'
  },
  'Potato___healthy': {
    emoji: '🥔',
    crop: 'Potato',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'Healthy potato foliage, indicating good disease management and no sign of blight.',
    symptoms: 'None.',
    immediateAction: 'Continue protective fungicide programs if weather is conducive to blight.',
    prevention: [
      'Monitor weather forecasts closely for late blight risk conditions (cool, wet)',
      'Scout fields twice a week',
      'Manage Colorado Potato Beetle populations'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Potato'
  },

  // Raspberry (1)
  'Raspberry___healthy': {
    emoji: '🍇', // fallback
    crop: 'Raspberry',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'This raspberry leaf is healthy with no signs of rust or viral infections.',
    symptoms: 'None.',
    immediateAction: 'Maintain current care regimen.',
    prevention: [
      'Prune out old floricanes immediately after harvest',
      'Keep row width narrow to ensure good airflow',
      'Ensure soil drains well to prevent Phytophthora root rot'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Raspberry'
  },

  // Soybean (1)
  'Soybean___healthy': {
    emoji: '🫘',
    crop: 'Soybean',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'Healthy soybean leaf showing no signs of rust, frogeye leaf spot, or blight.',
    symptoms: 'None.',
    immediateAction: 'Continue scouting for pests like aphids and stink bugs.',
    prevention: [
      'Monitor for signs of soybean rust during reproductive stages',
      'Maintain good weed control',
      'Consider crop rotation with corn to break disease cycles'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Soybean'
  },

  // Squash (1)
  'Squash___Powdery_mildew': {
    emoji: '🎃',
    crop: 'Squash',
    disease: 'Powdery Mildew',
    isHealthy: false,
    severity: 'High',
    cause: 'Fungal (Podosphaera xanthii)',
    description: 'A very common disease affecting all cucurbits. It acts like a solar panel block, reducing yield and fruit quality (sugar content).',
    symptoms: 'White, powdery fungal spots appear on both leaf surfaces and stems. Leaves eventually turn yellow, then brown, and die.',
    immediateAction: 'Apply fungicide or organic control immediately to protect new growth; old leaves will not recover.',
    chemical: {
      ingredient: 'Myclobutanil or Chlorothalonil',
      rate: 'As per label',
      frequency: 'Every 7-14 days'
    },
    organic: {
      remedy: 'Neem oil or Potassium Bicarbonate',
      application: 'Apply every 7 days; ensure thorough coverage of undersides'
    },
    prevention: [
      'Plant PM-resistant squash varieties',
      'Space plants widely for good airflow',
      'Avoid overhead watering, though PM actually thrives in high humidity without direct rain'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Powdery_mildew'
  },

  // Strawberry (2)
  'Strawberry___Leaf_scorch': {
    emoji: '🍓',
    crop: 'Strawberry',
    disease: 'Leaf Scorch',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Diplocarpon earlianum)',
    description: 'A fungal disease that reduces plant vigor and winter hardiness. Severe infections dry out the leaves entirely.',
    symptoms: 'Irregular purplish-brown blotches on leaves without a defined center. The spots merge, causing the leaf edges to curl up and look scorched or burned.',
    immediateAction: 'Remove severely infected leaves. Apply a fungicide if occurring early in the season or after renovation.',
    chemical: {
      ingredient: 'Captan or Myclobutanil',
      rate: 'As per label',
      frequency: 'Apply during early spring growth and post-harvest'
    },
    organic: {
      remedy: 'Copper fungicides',
      application: 'Apply before bloom'
    },
    prevention: [
      'Renovate beds immediately after harvest (mow off old leaves)',
      'Plant resistant cultivars',
      'Keep beds narrow and manage weeds for airflow'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Strawberry_diseases'
  },
  'Strawberry___healthy': {
    emoji: '🍓',
    crop: 'Strawberry',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'Healthy strawberry foliage. No signs of scorch, spot, or mold.',
    symptoms: 'None.',
    immediateAction: 'Continue standard watering and feeding.',
    prevention: [
      'Use straw mulch to keep fruit off the soil',
      'Ensure proper plant spacing',
      'Avoid high nitrogen fertilizers in spring which promote soft fruit and rot'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Strawberry'
  },

  // Tomato (10)
  'Tomato___Bacterial_spot': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    isHealthy: false,
    severity: 'High',
    cause: 'Bacterial (Xanthomonas spp.)',
    description: 'A severe disease in warm, rainy weather. It damages the foliage and renders fruit unsellable due to scabby spots.',
    symptoms: 'Small, water-soaked, greasy spots on leaves. The centers dry out and tear. Fruit develops raised, dark, scab-like lesions.',
    immediateAction: 'Apply copper bactericide mixed with mancozeb. Avoid working in the field when plants are wet.',
    chemical: {
      ingredient: 'Copper + Mancozeb tank mix',
      rate: 'As per label',
      frequency: 'Every 5-7 days during wet weather'
    },
    organic: {
      remedy: 'Copper hydroxide',
      application: 'Preventative sprays; remove severely infected plants'
    },
    prevention: [
      'Use certified disease-free seed or hot-water treat seeds',
      'Avoid overhead irrigation',
      'Rotate crops (no tomatoes or peppers in the same spot for 3 years)'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Bacterial_spot_of_pepper_and_tomato'
  },
  'Tomato___Early_blight': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Early Blight',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Alternaria linariae)',
    description: 'The most common tomato leaf disease. It starts on lower foliage and moves up, causing defoliation and exposing fruit to sunscald.',
    symptoms: 'Brown spots with concentric rings (target spots) on lower leaves. Leaves turn yellow around the spots and drop.',
    immediateAction: 'Remove infected lower leaves. Apply fungicide to protect upper canopy.',
    chemical: {
      ingredient: 'Chlorothalonil or Mancozeb',
      rate: 'As per label',
      frequency: 'Every 7-10 days'
    },
    organic: {
      remedy: 'Copper fungicides or Bacillus subtilis',
      application: 'Start spraying when first fruits are walnut-sized'
    },
    prevention: [
      'Mulch the base of plants to prevent soil splashing onto leaves',
      'Provide support (cages/stakes) to keep foliage off the ground',
      'Ensure adequate nitrogen; stressed plants get it worse'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Alternaria_solani'
  },
  'Tomato___Late_blight': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Late Blight',
    isHealthy: false,
    severity: 'Critical',
    cause: 'Oomycete (Phytophthora infestans)',
    description: 'A highly destructive disease that can kill plants in a matter of days under cool, wet conditions. The same pathogen that affects potatoes.',
    symptoms: 'Large, dark, water-soaked spots on leaves. White mold may appear underneath. Stems turn brown/black. Fruit gets hard, brown, greasy lesions.',
    immediateAction: 'If spotted, pull up and bag the infected plants immediately to save nearby plants. Do NOT compost.',
    chemical: {
      ingredient: 'Chlorothalonil (preventative), Cymoxanil (curative)',
      rate: 'As per label',
      frequency: 'Every 5-7 days if in the area'
    },
    organic: {
      remedy: 'Copper spray (preventative only)',
      application: 'Useless once the plant is severely infected'
    },
    prevention: [
      'Plant late-blight resistant varieties (e.g., Iron Lady, Defiant, Mountain Magic)',
      'Ensure excellent airflow and morning sun to dry dew quickly',
      'Do not plant near potatoes'
    ],
    spreadRisk: 'Critical',
    wikiUrl: 'https://en.wikipedia.org/wiki/Phytophthora_infestans'
  },
  'Tomato___Leaf_Mold': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Leaf Mold',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Passalora fulva)',
    description: 'Primarily a problem in greenhouses or high tunnels with high humidity and poor ventilation. Rarely severe outdoors.',
    symptoms: 'Pale green or yellow spots on the upper leaf surface. The underside develops a dense, olive-green to brown velvety mold.',
    immediateAction: 'Dramatically increase ventilation. Prune lower leaves to improve airflow.',
    chemical: {
      ingredient: 'Chlorothalonil',
      rate: 'As per label',
      frequency: 'Apply if ventilation cannot be improved'
    },
    organic: {
      remedy: 'Copper fungicides',
      application: 'Apply preventatively in greenhouse settings'
    },
    prevention: [
      'Maintain relative humidity below 85% in greenhouses',
      'Water at the base early in the day',
      'Use resistant tomato varieties in high tunnels'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Tomato_leaf_mold'
  },
  'Tomato___Septoria_leaf_spot': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Septoria Leaf Spot',
    isHealthy: false,
    severity: 'High',
    cause: 'Fungal (Septoria lycopersici)',
    description: 'Extremely common and destructive. It causes rapid defoliation of the lower plant, moving upward, reducing yield and exposing fruit to sunscald.',
    symptoms: 'Numerous small, circular spots with dark brown margins and tan to gray centers. Tiny black specks (spores) are visible in the center of the spots.',
    immediateAction: 'Remove severely spotted lower leaves. Apply fungicide immediately to stop upward spread.',
    chemical: {
      ingredient: 'Chlorothalonil',
      rate: 'As per label',
      frequency: 'Every 7-10 days'
    },
    organic: {
      remedy: 'Copper or Potassium Bicarbonate',
      application: 'Apply thoroughly to upper and lower leaf surfaces'
    },
    prevention: [
      'Deep mulch to completely prevent soil from splashing onto lower leaves',
      'Stake plants and prune lower branches (keep 12 inches of bare stem at the bottom)',
      'Water only at the base using drip tape'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Septoria_leaf_spot_of_tomato'
  },
  'Tomato___Spider_mites Two-spotted_spider_mite': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Spider Mites',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Pest (Tetranychus urticae)',
    description: 'Tiny arachnids that suck plant sap. They explode in population during hot, dry weather, turning leaves yellow and stunting the plant.',
    symptoms: 'Leaves appear stippled (tiny yellow dots), eventually turning bronze or yellow. Fine webbing is visible under the leaves and on stems.',
    immediateAction: 'Spray plants with a strong stream of water to dislodge mites and destroy webs. Apply horticultural oil or soap.',
    chemical: {
      ingredient: 'Abamectin or Bifenazate (Miticide)',
      rate: 'As per label',
      frequency: 'Only for severe commercial infestations'
    },
    organic: {
      remedy: 'Neem oil or Insecticidal soap',
      application: 'Spray undersides of leaves thoroughly every 3-5 days'
    },
    prevention: [
      'Maintain adequate soil moisture; stressed plants attract mites',
      'Release predatory mites (Phytoseiulus persimilis) in greenhouses',
      'Keep dust down around the garden'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Tetranychus_urticae'
  },
  'Tomato___Target_Spot': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Target Spot',
    isHealthy: false,
    severity: 'Medium',
    cause: 'Fungal (Corynespora cassiicola)',
    description: 'A fungal disease affecting all above-ground plant parts. Similar to Early Blight but spots are smaller and affect both old and young leaves.',
    symptoms: 'Small brown spots with a yellow halo. Spots enlarge into concentric rings (targets). Fruit develops sunken, dark lesions.',
    immediateAction: 'Apply fungicide. Improve airflow around the plant.',
    chemical: {
      ingredient: 'Chlorothalonil or Azoxystrobin',
      rate: 'As per label',
      frequency: 'Apply every 7-14 days'
    },
    organic: {
      remedy: 'Copper formulations',
      application: 'Apply early at first sign'
    },
    prevention: [
      'Practice crop rotation',
      'Ensure adequate spacing and pruning',
      'Avoid overhead watering'
    ],
    spreadRisk: 'Medium',
    wikiUrl: 'https://en.wikipedia.org/wiki/Target_spot_of_tomato'
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Tomato Yellow Leaf Curl Virus',
    isHealthy: false,
    severity: 'Critical',
    cause: 'Viral (TYLCV, transmitted by Whiteflies)',
    description: 'A devastating viral disease in warm climates. If infected early, the plant will produce zero fruit. There is no cure for the virus.',
    symptoms: 'Leaves are severely stunted, curl upward, and become yellowed (chlorotic) between the veins. Flowers often drop without setting fruit.',
    immediateAction: 'Pull the plant up and destroy it immediately to stop whiteflies from spreading the virus to healthy plants.',
    chemical: {
      ingredient: 'Imidacloprid (for vector control)',
      rate: 'Soil drench',
      frequency: 'Apply to control the whitefly population, not the virus'
    },
    organic: {
      remedy: 'Yellow sticky traps and Neem oil',
      application: 'Use to suppress whiteflies'
    },
    prevention: [
      'Plant TYLCV-resistant varieties (e.g., Tycoon, Celebrity Plus)',
      'Use reflective silver mulch to deter whiteflies',
      'Cover young transplants with fine mesh insect netting'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Tomato_yellow_leaf_curl_virus'
  },
  'Tomato___Tomato_mosaic_virus': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Tomato Mosaic Virus',
    isHealthy: false,
    severity: 'High',
    cause: 'Viral (ToMV)',
    description: 'A highly contagious virus that stunts plant growth and reduces yield. It can survive for years in dry soil or on tools.',
    symptoms: 'Leaves show a mottled light and dark green mosaic pattern. Leaves may be distorted, fern-like, or puckered. Fruit ripens unevenly.',
    immediateAction: 'Remove and destroy the infected plant. Wash hands thoroughly and sterilize all tools with a 10% bleach solution.',
    chemical: {
      ingredient: 'None',
      rate: 'N/A',
      frequency: 'Fungicides/insecticides do not affect this virus'
    },
    organic: {
      remedy: 'Sanitation',
      application: 'Remove infected plants immediately'
    },
    prevention: [
      'Plant resistant varieties (look for TMV or ToMV resistance codes)',
      'Do not use tobacco products near tomato plants (related TMV virus)',
      'Wash hands with soap and water before handling plants'
    ],
    spreadRisk: 'High',
    wikiUrl: 'https://en.wikipedia.org/wiki/Tomato_mosaic_virus'
  },
  'Tomato___healthy': {
    emoji: '🍅',
    crop: 'Tomato',
    disease: 'Healthy',
    isHealthy: true,
    severity: 'Low',
    cause: 'None',
    description: 'Healthy tomato foliage, free of spots, mold, or insect damage.',
    symptoms: 'None.',
    immediateAction: 'Continue with proper pruning and feeding.',
    prevention: [
      'Water deeply and consistently to prevent blossom end rot',
      'Mulch heavily around the base',
      'Provide strong support for the growing vines'
    ],
    spreadRisk: 'Low',
    wikiUrl: 'https://en.wikipedia.org/wiki/Tomato'
  }
};
