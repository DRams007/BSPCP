/**
 * Migration: Convert nationality demonym values to country names
 * 
 * This migration converts existing nationality values (demonyms like "Motswana", "South African")
 * to their corresponding country names ("Botswana", "South Africa") in the members table.
 * 
 * The database column name remains `nationality` — only the stored values change.
 * 
 * Run: node server/migrations/20260418_rename_nationality_to_country.js
 */

import pool from '../lib/db.js';

// Mapping of demonym → country name
const demonymToCountry = {
  "Afghan": "Afghanistan",
  "Albanian": "Albania",
  "Algerian": "Algeria",
  "American": "United States",
  "Andorran": "Andorra",
  "Angolan": "Angola",
  "Argentine": "Argentina",
  "Armenian": "Armenia",
  "Australian": "Australia",
  "Austrian": "Austria",
  "Azerbaijani": "Azerbaijan",
  "Bahamian": "Bahamas",
  "Bahraini": "Bahrain",
  "Bangladeshi": "Bangladesh",
  "Barbadian": "Barbados",
  "Belarusian": "Belarus",
  "Belgian": "Belgium",
  "Belizean": "Belize",
  "Beninese": "Benin",
  "Bhutanese": "Bhutan",
  "Bolivian": "Bolivia",
  "Bosnian": "Bosnia and Herzegovina",
  "Motswana": "Botswana",
  "Brazilian": "Brazil",
  "Bruneian": "Brunei",
  "Bulgarian": "Bulgaria",
  "Burkinabe": "Burkina Faso",
  "Burundian": "Burundi",
  "Cambodian": "Cambodia",
  "Cameroonian": "Cameroon",
  "Canadian": "Canada",
  "Cape Verdean": "Cape Verde",
  "Central African": "Central African Republic",
  "Chadian": "Chad",
  "Chilean": "Chile",
  "Chinese": "China",
  "Colombian": "Colombia",
  "Comoran": "Comoros",
  "Congolese": "Congo",
  "Costa Rican": "Costa Rica",
  "Croatian": "Croatia",
  "Cuban": "Cuba",
  "Cypriot": "Cyprus",
  "Czech": "Czech Republic",
  "Danish": "Denmark",
  "Djiboutian": "Djibouti",
  "Dominican": "Dominican Republic",
  "Ecuadorian": "Ecuador",
  "Egyptian": "Egypt",
  "Salvadoran": "El Salvador",
  "Equatorial Guinean": "Equatorial Guinea",
  "Eritrean": "Eritrea",
  "Estonian": "Estonia",
  "Ethiopian": "Ethiopia",
  "Fijian": "Fiji",
  "Finnish": "Finland",
  "French": "France",
  "Gabonese": "Gabon",
  "Gambian": "Gambia",
  "Georgian": "Georgia",
  "German": "Germany",
  "Ghanaian": "Ghana",
  "Greek": "Greece",
  "Grenadian": "Grenada",
  "Guatemalan": "Guatemala",
  "Guinean": "Guinea",
  "Guinea-Bissauan": "Guinea-Bissau",
  "Guyanese": "Guyana",
  "Haitian": "Haiti",
  "Honduran": "Honduras",
  "Hungarian": "Hungary",
  "Icelandic": "Iceland",
  "Indian": "India",
  "Indonesian": "Indonesia",
  "Iranian": "Iran",
  "Iraqi": "Iraq",
  "Irish": "Ireland",
  "Israeli": "Israel",
  "Italian": "Italy",
  "Jamaican": "Jamaica",
  "Japanese": "Japan",
  "Jordanian": "Jordan",
  "Kazakhstani": "Kazakhstan",
  "Kenyan": "Kenya",
  "I-Kiribati": "Kiribati",
  "Kuwaiti": "Kuwait",
  "Kyrgyzstani": "Kyrgyzstan",
  "Laotian": "Laos",
  "Latvian": "Latvia",
  "Lebanese": "Lebanon",
  "Basotho": "Lesotho",
  "Liberian": "Liberia",
  "Libyan": "Libya",
  "Liechtensteiner": "Liechtenstein",
  "Lithuanian": "Lithuania",
  "Luxembourger": "Luxembourg",
  "Macedonian": "North Macedonia",
  "Malagasy": "Madagascar",
  "Malawian": "Malawi",
  "Malaysian": "Malaysia",
  "Maldivian": "Maldives",
  "Malian": "Mali",
  "Maltese": "Malta",
  "Marshallese": "Marshall Islands",
  "Mauritanian": "Mauritania",
  "Mauritian": "Mauritius",
  "Mexican": "Mexico",
  "Micronesian": "Micronesia",
  "Moldovan": "Moldova",
  "Monegasque": "Monaco",
  "Mongolian": "Mongolia",
  "Montenegrin": "Montenegro",
  "Moroccan": "Morocco",
  "Mozambican": "Mozambique",
  "Burmese": "Myanmar",
  "Namibian": "Namibia",
  "Nauruan": "Nauru",
  "Nepali": "Nepal",
  "Dutch": "Netherlands",
  "New Zealander": "New Zealand",
  "Nicaraguan": "Nicaragua",
  "Nigerien": "Niger",
  "Nigerian": "Nigeria",
  "North Korean": "North Korea",
  "Norwegian": "Norway",
  "Omani": "Oman",
  "Pakistani": "Pakistan",
  "Palauan": "Palau",
  "Panamanian": "Panama",
  "Papua New Guinean": "Papua New Guinea",
  "Paraguayan": "Paraguay",
  "Peruvian": "Peru",
  "Filipino": "Philippines",
  "Polish": "Poland",
  "Portuguese": "Portugal",
  "Qatari": "Qatar",
  "Romanian": "Romania",
  "Russian": "Russia",
  "Rwandan": "Rwanda",
  "Kittitian and Nevisian": "Saint Kitts and Nevis",
  "Saint Lucian": "Saint Lucia",
  "Saint Vincentian": "Saint Vincent and the Grenadines",
  "Samoan": "Samoa",
  "Sammarinese": "San Marino",
  "Sao Tomean": "Sao Tome and Principe",
  "Saudi Arabian": "Saudi Arabia",
  "Senegalese": "Senegal",
  "Serbian": "Serbia",
  "Seychellois": "Seychelles",
  "Sierra Leonean": "Sierra Leone",
  "Singaporean": "Singapore",
  "Slovak": "Slovakia",
  "Slovenian": "Slovenia",
  "Solomon Islander": "Solomon Islands",
  "Somali": "Somalia",
  "South African": "South Africa",
  "South Korean": "South Korea",
  "Spanish": "Spain",
  "Sri Lankan": "Sri Lanka",
  "Sudanese": "Sudan",
  "Surinamese": "Suriname",
  "Swazi": "Eswatini",
  "Swedish": "Sweden",
  "Swiss": "Switzerland",
  "Syrian": "Syria",
  "Taiwanese": "Taiwan",
  "Tajikistani": "Tajikistan",
  "Tanzanian": "Tanzania",
  "Thai": "Thailand",
  "Togolese": "Togo",
  "Tongan": "Tonga",
  "Trinidadian": "Trinidad and Tobago",
  "Tunisian": "Tunisia",
  "Turkish": "Turkey",
  "Turkmen": "Turkmenistan",
  "Tuvaluan": "Tuvalu",
  "Ugandan": "Uganda",
  "Ukrainian": "Ukraine",
  "Emirati": "United Arab Emirates",
  "British": "United Kingdom",
  "Uruguayan": "Uruguay",
  "Uzbekistani": "Uzbekistan",
  "Ni-Vanuatu": "Vanuatu",
  "Vatican": "Vatican City",
  "Venezuelan": "Venezuela",
  "Vietnamese": "Vietnam",
  "Yemeni": "Yemen",
  "Zambian": "Zambia",
  "Zimbabwean": "Zimbabwe"
};

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting migration: Convert nationality demonyms to country names...');
    
    // First, show what we'll be updating
    const currentValues = await client.query(
      `SELECT DISTINCT nationality, COUNT(*) as count FROM members GROUP BY nationality ORDER BY nationality`
    );
    
    console.log('\n📊 Current nationality values in database:');
    currentValues.rows.forEach(row => {
      const mapped = demonymToCountry[row.nationality];
      const status = mapped ? `→ ${mapped}` : '⚠️  NO MAPPING (will be skipped)';
      console.log(`   "${row.nationality}" (${row.count} members) ${status}`);
    });

    await client.query('BEGIN');

    let totalUpdated = 0;
    let skipped = 0;

    for (const [demonym, country] of Object.entries(demonymToCountry)) {
      const result = await client.query(
        `UPDATE members SET nationality = $1 WHERE nationality = $2`,
        [country, demonym]
      );
      if (result.rowCount > 0) {
        console.log(`   ✅ Updated ${result.rowCount} member(s): "${demonym}" → "${country}"`);
        totalUpdated += result.rowCount;
      }
    }

    // Check for any unmapped values that were skipped
    const unmapped = await client.query(
      `SELECT DISTINCT nationality, COUNT(*) as count FROM members 
       WHERE nationality NOT IN (${Object.values(demonymToCountry).map((_, i) => `$${i + 1}`).join(',')})
       GROUP BY nationality`,
      Object.values(demonymToCountry)
    );

    if (unmapped.rows.length > 0) {
      console.log('\n⚠️  Unmapped values (not changed):');
      unmapped.rows.forEach(row => {
        console.log(`   "${row.nationality}" (${row.count} members)`);
        skipped += parseInt(row.count);
      });
    }

    await client.query('COMMIT');

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated: ${totalUpdated} member(s)`);
    console.log(`   Skipped: ${skipped} member(s) (already country names or no mapping)`);

    // Show final state
    const finalValues = await client.query(
      `SELECT DISTINCT nationality, COUNT(*) as count FROM members GROUP BY nationality ORDER BY nationality`
    );
    console.log('\n📊 Final nationality values:');
    finalValues.rows.forEach(row => {
      console.log(`   "${row.nationality}" (${row.count} members)`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('   All changes have been rolled back.');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
