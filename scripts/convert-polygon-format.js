const fs = require('fs');
const path = require('path');

/**
 * Self-contained script to convert polygon data from array format to object format
 * 
 * Converts features from array-based FeatureCollections to object-based structure
 * by grouping features according to their areaIndex mappings from a reference file.
 */

function buildAreaIndexMapping(referenceFile) {
    console.log('Building areaIndex mapping from reference file...');
    
    const referenceData = JSON.parse(fs.readFileSync(referenceFile, 'utf8'));
    const areaIndexToKey = {};
    
    // Extract complete areaIndex -> key mapping from reference file
    for (const [key, featureCollection] of Object.entries(referenceData)) {
        if (featureCollection.features && featureCollection.features.length > 0) {
            for (const feature of featureCollection.features) {
                if (feature.properties && feature.properties.areaIndex !== undefined) {
                    const areaIndex = feature.properties.areaIndex;
                    areaIndexToKey[areaIndex] = key;
                }
            }
        }
    }
    
    console.log(`  Found ${Object.keys(areaIndexToKey).length} areaIndex mappings`);
    return areaIndexToKey;
}

function convertArrayToObjectFormat(sourceFile, outputFile, areaIndexToKey) {
    console.log('Converting source file...');
    
    const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const result = {};
    
    console.log('Processing features...');
    
    let processedCount = 0;
    let newAreaIndexCount = 0;
    const usedKeys = new Set(Object.values(areaIndexToKey));
    
    // Process all features from source
    for (const featureCollection of sourceData) {
        if (featureCollection.type === 'FeatureCollection' && featureCollection.features) {
            for (const feature of featureCollection.features) {
                if (feature.properties && feature.properties.areaIndex !== undefined) {
                    const areaIndex = feature.properties.areaIndex;
                    let key = areaIndexToKey[areaIndex];
                    
                    // If areaIndex doesn't exist in reference, create a new key
                    if (!key) {
                        let baseNum = 600000;
                        do {
                            baseNum++;
                            key = baseNum.toString();
                        } while (usedKeys.has(key));
                        
                        usedKeys.add(key);
                        areaIndexToKey[areaIndex] = key;
                        console.log(`  New areaIndex ${areaIndex} -> key "${key}"`);
                        newAreaIndexCount++;
                    }
                    
                    // Initialize FeatureCollection for this key if it doesn't exist
                    if (!result[key]) {
                        result[key] = {
                            type: 'FeatureCollection',
                            features: []
                        };
                    }
                    
                    // Add the feature to the appropriate FeatureCollection
                    result[key].features.push(feature);
                    processedCount++;
                }
            }
        }
    }
    
    console.log(`Writing converted data to ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log('Conversion completed!');
    
    // Print summary
    const keys = Object.keys(result).sort();
    console.log(`\nSummary:`);
    console.log(`- Total features processed: ${processedCount}`);
    console.log(`- New areaIndex values found: ${newAreaIndexCount}`);
    console.log(`- Final top-level keys: ${keys.length}`);
    
    if (keys.length <= 20) {
        console.log('\nFeatures per key:');
        for (const key of keys) {
            const featureCount = result[key].features.length;
            const areaIndices = [...new Set(result[key].features.map(f => f.properties.areaIndex))].sort((a, b) => a - b);
            console.log(`  - "${key}": ${featureCount} features, areaIndices [${areaIndices.join(', ')}]`);
        }
    } else {
        console.log(`\nFirst 10 keys by feature count:`);
        const sortedByCount = keys.sort((a, b) => result[b].features.length - result[a].features.length).slice(0, 10);
        for (const key of sortedByCount) {
            const featureCount = result[key].features.length;
            console.log(`  - "${key}": ${featureCount} features`);
        }
    }
}

function main() {
    const publicDir = path.join(__dirname, '..', 'public');
    const referenceFile = path.join(publicDir, 'praha-polygons2025.json');
    const sourceFile = path.join(publicDir, 'praha-polygons2026-orig.json');
    const outputFile = path.join(publicDir, 'praha-polygons2026.json');
    
    try {
        console.log('Converting polygon format...');
        console.log(`Reference: ${path.basename(referenceFile)}`);
        console.log(`Source: ${path.basename(sourceFile)}`);
        console.log(`Output: ${path.basename(outputFile)}`);
        console.log('');
        
        // Step 1: Build mapping from reference file
        const areaIndexToKey = buildAreaIndexMapping(referenceFile);
        
        // Step 2: Convert source file using the mapping
        convertArrayToObjectFormat(sourceFile, outputFile, areaIndexToKey);
        
        console.log('\n✅ Conversion completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during conversion:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}