#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Automatically updates all chat-drawer registry files based on the component
 */
async function updateChatDrawerRegistry() {
  const componentPath = path.join(__dirname, '../registry/new-york/chat-drawer/chat-drawer.tsx');
  
  const registryFiles = [
    'public/r/chat-drawer.json',
    'api/registry/chat-drawer.json',
    'registry/default/chat-drawer/index.json',
    'registry/new-york/chat-drawer/index.json',
    'chat-drawer.json'
  ];
  
  try {
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    const imports = extractImports(componentContent);
    const dependencies = extractNpmDependencies(imports);
    const registryDependencies = extractRegistryDependencies(imports);
    
    const features = extractFeatures(componentContent);
    
    console.log('🔍 Analysis Results:');
    console.log(`📦 Dependencies: ${dependencies.join(', ')}`);
    console.log(`🔧 Registry deps: ${registryDependencies.join(', ')}`);
    console.log(`✨ Features: ${features.length} detected`);
    
    for (const registryFile of registryFiles) {
      const registryPath = path.join(__dirname, '..', registryFile);
      
      if (fs.existsSync(registryPath)) {
        await updateRegistryFile(registryPath, registryFile, {
          dependencies,
          registryDependencies,
          features,
          componentContent
        });
        console.log(`✅ Updated: ${registryFile}`);
      } else {
        console.log(`⚠️  Skipped: ${registryFile} (not found)`);
      }
    }
    
    await updateMainRegistryFiles({
      dependencies,
      registryDependencies,
      features
    });
    
    console.log('\n🎉 All registry files updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating registry:', error.message);
    process.exit(1);
  }
}

async function updateRegistryFile(filePath, fileName, data) {
  const { dependencies, registryDependencies, features, componentContent } = data;
  
  let currentRegistry = {};
  if (fs.existsSync(filePath)) {
    currentRegistry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  let componentPath = "registry/new-york/chat-drawer/chat-drawer.tsx";
  if (fileName.includes('default')) {
    componentPath = "registry/default/chat-drawer/chat-drawer.tsx";
  }
  
  const updatedRegistry = {
    "$schema": fileName.includes('public/r/') ? "https://ui.shadcn.com/schema/registry-item.json" : undefined,
    "name": "chat-drawer",
    "type": "registry:component",
    "title": "Chat Drawer",
    "description": generateDescription(features),
    "registryDependencies": registryDependencies,
    "devDependencies": dependencies,
    "files": [
      {
        "path": componentPath,
        "type": "registry:component",
        ...(fileName.includes('public/r/') ? { "content": componentContent } : {})
      }
    ],
    ...(fileName.includes('public/r/') ? {
      "categories": ["chat", "drawer", "ai"],
      "meta": {
        "features": features,
        "lastUpdated": new Date().toISOString()
      }
    } : {})
  };
  
  Object.keys(updatedRegistry).forEach(key => {
    if (updatedRegistry[key] === undefined) {
      delete updatedRegistry[key];
    }
  });
  
  fs.writeFileSync(filePath, JSON.stringify(updatedRegistry, null, 2));
}

async function updateMainRegistryFiles(data) {
  const { dependencies, registryDependencies, features } = data;
  
  const registryJsonPath = path.join(__dirname, '../registry.json');
  if (fs.existsSync(registryJsonPath)) {
    const registryJson = JSON.parse(fs.readFileSync(registryJsonPath, 'utf8'));
    
    const chatDrawerItem = registryJson.items.find(item => item.name === 'chat-drawer');
    if (chatDrawerItem) {
      chatDrawerItem.description = generateDescription(features);
      chatDrawerItem.registryDependencies = registryDependencies;
      chatDrawerItem.devDependencies = dependencies;
    }
    
    fs.writeFileSync(registryJsonPath, JSON.stringify(registryJson, null, 2));
    console.log('✅ Updated: registry.json');
  }
  
  const registryIndexPath = path.join(__dirname, '../registry/index.ts');
  if (fs.existsSync(registryIndexPath)) {
    let indexContent = fs.readFileSync(registryIndexPath, 'utf8');
    
    const updatedContent = indexContent.replace(
      /name: "chat-drawer",[\s\S]*?(?=},|\}$)/,
      `name: "chat-drawer",
      type: "registry:component",
      title: "Chat Drawer",
      description: "${generateDescription(features)}",
      registryDependencies: ${JSON.stringify(registryDependencies)},
      devDependencies: ${JSON.stringify(dependencies)},
      files: [
        {
          path: "registry/new-york/chat-drawer/chat-drawer.tsx",
          type: "registry:component"
        }
      ]`
    );
    
    fs.writeFileSync(registryIndexPath, updatedContent);
    console.log('✅ Updated: registry/index.ts');
  }
}

function extractImports(content) {
  const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      statement: match[0],
      module: match[1]
    });
  }
  
  return imports;
}

function extractNpmDependencies(imports) {
  const npmDeps = new Set();
  
  imports.forEach(imp => {
    if (!imp.module.startsWith('.') && !imp.module.startsWith('@/')) {
      if (imp.module.startsWith('@')) {
        const parts = imp.module.split('/');
        if (parts.length >= 2) {
          npmDeps.add(`${parts[0]}/${parts[1]}`);
        }
      } else {
        npmDeps.add(imp.module.split('/')[0]);
      }
    }
  });
  
  return Array.from(npmDeps).sort();
}

function extractRegistryDependencies(imports) {
  const registryDeps = new Set();
  
  imports.forEach(imp => {
    if (imp.module.startsWith('@/components/ui/')) {
      const component = imp.module.replace('@/components/ui/', '');
      registryDeps.add(component);
    }
  });
  
  return Array.from(registryDeps).sort();
}

function extractFeatures(content) {
  const features = [];
  
  const featurePatterns = [
    { pattern: /useEffect.*scroll/i, feature: "Auto-scrolling messages" },
    { pattern: /Loader2.*animate-spin/i, feature: "Loading states with animations" },
    { pattern: /DrawerClose/i, feature: "Close button with smooth transitions" },
    { pattern: /useChat/i, feature: "AI chat integration" },
    { pattern: /responsive|sm:|md:|lg:/i, feature: "Responsive design" },
    { pattern: /bottomRef.*scrollIntoView/i, feature: "Auto-scrolling messages" },
    { pattern: /isLoading.*typing/i, feature: "Loading states with animations" },
    { pattern: /useRef/i, feature: "Auto-scrolling messages" },
    { pattern: /X.*from.*lucide/i, feature: "Close button with smooth transitions" }
  ];
  
  featurePatterns.forEach(({ pattern, feature }) => {
    if (pattern.test(content) && !features.includes(feature)) {
      features.push(feature);
    }
  });
  
  if (features.length === 0) {
    features.push("Chat interface", "Drawer component");
  }
  
  return features;
}

function generateDescription(features) {
  const baseDesc = "A reusable global drawer chat component with AI integration";
  const featureDesc = features.length > 0 
    ? `. Features ${features.slice(0, 3).join(', ').toLowerCase()}`
    : "";
  const suffix = " and responsive design.";
  
  return baseDesc + featureDesc + suffix;
}

if (require.main === module) {
  updateChatDrawerRegistry();
}

module.exports = { updateChatDrawerRegistry };
