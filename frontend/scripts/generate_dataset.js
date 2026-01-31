
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../src/mass_balance_synthetic_dataset_large.csv');
const ROWS = 4000;

const STRESS_TYPES = ['acid', 'base', 'oxidation', 'thermal', 'photolysis'];
const API_CLASSES = ['small_nonvolatile', 'small_volatile', 'peptide'];
const LEVELS = ['low', 'mid', 'high'];

// Helper to get random item
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper for random number
const random = (min, max) => Math.random() * (max - min) + min;
const randomNormal = (mean, std) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std + mean;
}

const generateRow = (id) => {
    const stress = sample(STRESS_TYPES);
    const apiClass = sample(API_CLASSES);
    const level = sample(LEVELS);

    // Initial values (randomized slightly)
    const initial_API = randomNormal(100, 0.5); // Mean 100
    const initial_deg = random(0.1, 1.0); // Small initial degradation

    // Degradation based on level
    let degradation_target;
    if (level === 'low') degradation_target = random(1, 5);
    else if (level === 'mid') degradation_target = random(5, 20);
    else degradation_target = random(20, 50); // high

    // Add some noise/variation to degradation
    const true_degradation = degradation_target * random(0.9, 1.1);

    // Simulate Mass Balance Logic

    // API Loss % calculation
    // api_loss_pct approx same as degradation if we assume initial is 100

    // Simulate measurement noise
    const noise_api = randomNormal(0, 0.5);
    const noise_deg = randomNormal(0, 0.5);

    // Calculate final measured values
    // True Stressed API = Initial API - True Degradation
    let stressed_api_true = initial_API - true_degradation;
    let stressed_deg_true = initial_deg + true_degradation; // Conservation of mass

    // Apply Mass Balance "Issues"
    // Volatiles might lose mass -> measurement lower than true
    if (apiClass === 'small_volatile' && Math.random() < 0.3) {
        stressed_deg_true *= random(0.8, 0.95); // Lose some degradant
    }

    // Measurement
    let stressed_API_meas = stressed_api_true + noise_api;
    let stressed_deg_meas = stressed_deg_true + noise_deg;

    // Inject "Hidden Failures" mostly in Mid zone as requested
    if (level === 'mid' && Math.random() < 0.15) {
        // Force AMB to be decent
        // But make RMBD high -> Lose degradant mass specifically
        stressed_deg_meas *= 0.7; // Lose 30% of degradant signal
    }

    // Ensure non-negative
    if (stressed_API_meas < 0) stressed_API_meas = 0;
    if (stressed_deg_meas < 0) stressed_deg_meas = 0;

    return {
        API: `Run_${id}`,
        class: apiClass,
        stress: stress,
        level: level,
        initial_API: initial_API.toFixed(2),
        initial_deg: initial_deg.toFixed(2),
        stressed_API_true: stressed_api_true.toFixed(2),
        stressed_deg_true: stressed_deg_true.toFixed(2),
        stressed_API_meas: stressed_API_meas.toFixed(2),
        stressed_deg_meas: stressed_deg_meas.toFixed(2)
    };
};

// Generate Data
const data = [];
// Header
const header = Object.keys(generateRow(0)).join(',');
data.push(header);

for (let i = 0; i < ROWS; i++) {
    const row = generateRow(i + 1);
    data.push(Object.values(row).join(','));
}

fs.writeFileSync(OUTPUT_FILE, data.join('\n'));
console.log(`Generated ${ROWS} rows to ${OUTPUT_FILE}`);
