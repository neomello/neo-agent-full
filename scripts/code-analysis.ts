import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ANSI Code Colors
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";

const ROOT_DIR = path.resolve(__dirname, '..');

let issuesFound = 0;
let healthScore = 100;

// Scopes Definition
const SCOPES: Record<string, { rootDirs: string[], dashboard?: boolean }> = {
    'state': { rootDirs: ['src/state'] },
    'tools': { rootDirs: ['src/executors/tools', 'src/adapters'] },
    'core': { rootDirs: ['src/mcp', 'src/executors'] },
    'dashboard': { rootDirs: [], dashboard: true },
    'all': { rootDirs: ['src'], dashboard: true }
};

// Valid Args
const args = process.argv.slice(2);
const scopeArg = args.find(a => a.startsWith('--scope='))?.split('=')[1] || 'all';

if (!SCOPES[scopeArg]) {
    console.error(`${RED}Erro: Escopo '${scopeArg}' inválido.${RESET}`);
    process.exit(1);
}

const currentScope = SCOPES[scopeArg];

function logHeader(title: string) {
    console.log(`\n${CYAN}=== ${title} ===${RESET}`);
}

function logError(msg: string) {
    console.log(`${RED}🔴 ${msg}${RESET}`);
    issuesFound++;
    healthScore -= 10;
}

function logWarning(msg: string) {
    console.log(`${YELLOW}⚠️  ${msg}${RESET}`);
    issuesFound++;
    healthScore -= 5;
}

function logSuccess(msg: string) {
    console.log(`${GREEN}✅ ${msg}${RESET}`);
}

function execCmd(cmd: string, cwd: string = ROOT_DIR): boolean {
    try {
        console.log(`${GRAY}> ${cmd}${RESET}`);
        execSync(cmd, { cwd, stdio: 'inherit' });
        return true;
    } catch (e) {
        return false;
    }
}

// 1. Static Analysis (ESLint)
function runLinter() {
    logHeader("Static Analysis (ESLint)");

    let success = true;

    // Root Check
    if (currentScope.rootDirs.length > 0) {
        const dirs = currentScope.rootDirs.map(d => `"${d}"`).join(' ');
        // Only run if directories exist
        const validDirs = currentScope.rootDirs.filter(d => fs.existsSync(path.join(ROOT_DIR, d)));

        if (validDirs.length > 0) {
            console.log("Analyzing Root Project...");
            if (!execCmd(`npx eslint ${validDirs.join(' ')} --ext .ts,.tsx`)) {
                logError("ESLint found issues in Backend/Root code.");
                success = false;
            } else {
                logSuccess("Backend Code linting passed.");
            }
        }
    }

    // Dashboard Check
    if (currentScope.dashboard) {
        console.log("Analyzing Dashboard...");
        // Usually Next.js lint is 'next lint'
        if (!execCmd(`npm run lint`, path.join(ROOT_DIR, 'dashboard'))) {
            logError("ESLint found issues in Dashboard.");
            success = false;
        } else {
            logSuccess("Dashboard linting passed.");
        }
    }
}

// 2. Type Checking (TypeScript)
function runTypeCheck() {
    logHeader("Type Safety (TypeScript Compiler)");

    // Root
    if (currentScope.rootDirs.length > 0) {
        console.log("Compiling Root Project (Dry Run)...");
        // tsc checks the whole project defined in tsconfig, strict scoping is hard, so we verify consistency
        if (!execCmd(`npx tsc --noEmit`)) {
            logError("TypeScript Compilation failed for Root Project.");
        } else {
            logSuccess("Root Project compiles successfully.");
        }
    }

    // Dashboard
    if (currentScope.dashboard) {
        console.log("Compiling Dashboard (Dry Run)...");
        // We can use tsc directly inside dashboard
        if (!execCmd(`npx tsc --noEmit`, path.join(ROOT_DIR, 'dashboard'))) {
            logError("TypeScript Compilation failed for Dashboard.");
        } else {
            logSuccess("Dashboard compiles successfully.");
        }
    }
}

// 3. Custom heuristics (Env Checks)
function checkEnvVars() {
    logHeader("Configuration & Hygiene");

    // Check .env availability
    const envPath = path.join(ROOT_DIR, '.env');
    if (!fs.existsSync(envPath)) {
        logWarning("File .env is missing. Application might fail at runtime.");
    } else {
        logSuccess(".env file is present.");
    }

    // Check .env.example consistency
    const examplePath = path.join(ROOT_DIR, '.env.example');
    if (fs.existsSync(examplePath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const exampleContent = fs.readFileSync(examplePath, 'utf-8');

        // Simple key extraction
        const getKeys = (c: string) => c.split('\n').map(l => l.split('=')[0].trim()).filter(k => k && !k.startsWith('#'));

        const envKeys = new Set(getKeys(envContent));
        const exampleKeys = getKeys(exampleContent);

        const missing = exampleKeys.filter(k => !envKeys.has(k));
        if (missing.length > 0) {
            logWarning(`Variables defined in .env.example but missing in .env: ${missing.join(', ')}`);
        } else {
            logSuccess(".env variables match documentation.");
        }
    }
}

function main() {
    console.log(`${CYAN}Starting NΞØ Agent Auditor (Expert Mode)...${RESET}`);
    console.log(`Scope: ${GREEN}${scopeArg}${RESET}`);

    // Run Phases
    runLinter();
    runTypeCheck();
    checkEnvVars();

    // Final Report
    console.log(`\n---------------------------------`);
    if (healthScore < 0) healthScore = 0;

    let scoreColor = GREEN;
    if (healthScore < 80) scoreColor = YELLOW;
    if (healthScore < 50) scoreColor = RED;

    console.log(`Deep Analysis Complete.`);
    console.log(`Issues Found: ${issuesFound}`);
    console.log(`NΞØ Health Score: ${scoreColor}${healthScore}/100${RESET}\n`);

    if (healthScore < 100) {
        process.exit(1);
    }
}

main();
