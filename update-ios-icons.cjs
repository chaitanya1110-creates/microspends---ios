const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function updateIosIcons() {
  const contentsJsonPath = path.join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'Contents.json');
  if (!fs.existsSync(contentsJsonPath)) {
    console.error('Error: Contents.json not found at', contentsJsonPath);
    return;
  }

  const sourceIconPath = path.join(__dirname, 'public', 'icon.png');
  if (!fs.existsSync(sourceIconPath)) {
    console.error('Error: Source icon not found at', sourceIconPath);
    return;
  }

  console.log('Reading Contents.json from', contentsJsonPath);
  const contents = JSON.parse(fs.readFileSync(contentsJsonPath, 'utf8'));

  if (!contents.images || !Array.isArray(contents.images)) {
    console.error('Error: images array not found in Contents.json');
    return;
  }

  const appIconDir = path.dirname(contentsJsonPath);

  contents.images.forEach((img) => {
    if (!img.filename) {
      console.log('Skipping image without filename:', img);
      return;
    }

    if (!img.size) {
      console.log('Skipping image without size:', img);
      return;
    }

    // Extract size (e.g., "20x20")
    const sizeMatch = String(img.size).match(/^([\d.]+)[xX]([\d.]+)$/);
    if (!sizeMatch) {
      console.log('Skipping image with invalid size format:', img.size);
      return;
    }

    const baseWidth = parseFloat(sizeMatch[1]);
    const baseHeight = parseFloat(sizeMatch[2]);

    // Extract scale (e.g., "2x" -> 2)
    const scaleStr = img.scale ? String(img.scale) : '1x';
    const scaleMatch = scaleStr.match(/^([\d.]+)x$/);
    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

    const targetWidth = Math.round(baseWidth * scale);
    const targetHeight = Math.round(baseHeight * scale);

    const destPath = path.join(appIconDir, img.filename);

    console.log(`Generating iOS Icon: ${img.filename} (${targetWidth}x${targetHeight})`);
    
    try {
      // Use sips (macOS native image utility) to scale the image
      execSync(`sips -z ${targetHeight} ${targetWidth} "${sourceIconPath}" --out "${destPath}"`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Failed to resize ${img.filename} using sips:`, err.message);
    }
  });

  console.log('iOS Icons generated successfully!');
}

updateIosIcons();
