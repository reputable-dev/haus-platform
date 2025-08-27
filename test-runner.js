#!/usr/bin/env node
/**
 * Standalone TDD Framework Test Runner
 * Validates the comprehensive testing framework without React Native dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output for better readability
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class TDDFrameworkValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async runTest(name, testFn) {
    this.results.total++;
    try {
      log('blue', `\n🧪 Running: ${name}`);
      const result = await testFn();
      this.results.passed++;
      log('green', `✅ PASSED: ${name}`);
      this.results.details.push({ name, status: 'PASSED', result });
    } catch (error) {
      this.results.failed++;
      log('red', `❌ FAILED: ${name} - ${error.message}`);
      this.results.details.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async validatePackageJson() {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredScripts = [
      'test:contracts',
      'test:security', 
      'test:integration',
      'test:api',
      'test:performance',
      'test:error-boundary'
    ];
    
    const missing = requiredScripts.filter(script => !packageJson.scripts[script]);
    if (missing.length > 0) {
      throw new Error(`Missing test scripts: ${missing.join(', ')}`);
    }
    
    return `All ${requiredScripts.length} test scripts are defined`;
  }

  async validateTestDirectories() {
    const requiredDirs = [
      '__tests__/contracts',
      '__tests__/security',
      '__tests__/integration', 
      '__tests__/api',
      '__tests__/performance',
      '__tests__/error-boundary'
    ];
    
    const missing = requiredDirs.filter(dir => !fs.existsSync(path.join(__dirname, dir)));
    if (missing.length > 0) {
      throw new Error(`Missing test directories: ${missing.join(', ')}`);
    }
    
    return `All ${requiredDirs.length} test directories exist`;
  }

  async validateContractTests() {
    const contractDir = path.join(__dirname, '__tests__/contracts');
    const files = fs.readdirSync(contractDir);
    
    const expectedFiles = [
      'pica-comprehensive.contract.test.ts',
      'pica-integration-matrix.test.ts',
      'pica-api.contract.test.ts'
    ];
    
    const missing = expectedFiles.filter(file => !files.includes(file));
    if (missing.length > 0) {
      throw new Error(`Missing contract test files: ${missing.join(', ')}`);
    }
    
    // Validate test content
    for (const file of expectedFiles) {
      const content = fs.readFileSync(path.join(contractDir, file), 'utf8');
      if (!content.includes('describe') || !content.includes('test')) {
        throw new Error(`Invalid test structure in ${file}`);
      }
    }
    
    return `All ${expectedFiles.length} contract test files are valid`;
  }

  async validateSecurityTests() {
    const securityDir = path.join(__dirname, '__tests__/security');
    if (!fs.existsSync(securityDir)) {
      throw new Error('Security test directory missing');
    }
    
    const files = fs.readdirSync(securityDir);
    if (files.length === 0) {
      throw new Error('No security test files found');
    }
    
    return `Security tests directory contains ${files.length} test files`;
  }

  async validateCIConfiguration() {
    const ciPath = path.join(__dirname, '.github/workflows/tdd-quality-gates.yml');
    if (!fs.existsSync(ciPath)) {
      throw new Error('CI configuration file missing');
    }
    
    const content = fs.readFileSync(ciPath, 'utf8');
    const requiredJobs = ['contracts', 'security', 'integration', 'api', 'performance', 'e2e'];
    const missing = requiredJobs.filter(job => !content.includes(job));
    
    if (missing.length > 0) {
      throw new Error(`CI missing job configurations: ${missing.join(', ')}`);
    }
    
    return `CI configuration contains all ${requiredJobs.length} required jobs`;
  }

  async validatePicaIntegration() {
    // Check if backend service exists
    const serviceFile = path.join(__dirname, 'backend/services/pica.service.ts');
    if (!fs.existsSync(serviceFile)) {
      throw new Error('Pica service implementation missing');
    }
    
    const content = fs.readFileSync(serviceFile, 'utf8');
    const requiredMethods = ['generateAuthToken', 'getAvailableIntegrations', 'executeAction'];
    const missing = requiredMethods.filter(method => !content.includes(method));
    
    if (missing.length > 0) {
      throw new Error(`Pica service missing methods: ${missing.join(', ')}`);
    }
    
    return 'Pica service implementation contains all required methods';
  }

  async validateTestCoverage() {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.jest || !packageJson.jest.coverageThreshold) {
      throw new Error('Coverage thresholds not configured');
    }
    
    const thresholds = packageJson.jest.coverageThreshold.global;
    const requiredThresholds = ['branches', 'functions', 'lines', 'statements'];
    const missing = requiredThresholds.filter(t => !thresholds[t] || thresholds[t] < 90);
    
    if (missing.length > 0) {
      throw new Error(`Low coverage thresholds for: ${missing.join(', ')}`);
    }
    
    return 'Coverage thresholds set to >= 90% for all metrics';
  }

  async validateDocumentation() {
    const docFiles = [
      'PICA_COMPREHENSIVE_TESTING.md',
      'PICA_INTEGRATION_SETUP_GUIDE.md',
      'PRODUCTION_READY_TASKLIST.md'
    ];
    
    const missing = docFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
    if (missing.length > 0) {
      throw new Error(`Missing documentation files: ${missing.join(', ')}`);
    }
    
    return `All ${docFiles.length} documentation files exist`;
  }

  async runAllTests() {
    log('cyan', '\n🚀 TDD FRAMEWORK VALIDATION STARTING...\n');
    
    await this.runTest('Package.json Test Scripts', () => this.validatePackageJson());
    await this.runTest('Test Directory Structure', () => this.validateTestDirectories());
    await this.runTest('Contract Tests Implementation', () => this.validateContractTests());
    await this.runTest('Security Tests Setup', () => this.validateSecurityTests());
    await this.runTest('CI/CD Configuration', () => this.validateCIConfiguration());
    await this.runTest('Pica Integration Implementation', () => this.validatePicaIntegration());
    await this.runTest('Test Coverage Configuration', () => this.validateTestCoverage());
    await this.runTest('Documentation Completeness', () => this.validateDocumentation());
    
    this.printSummary();
  }

  printSummary() {
    log('cyan', '\n📊 TDD FRAMEWORK VALIDATION SUMMARY');
    log('cyan', '=====================================');
    
    log('blue', `\nTotal Tests: ${this.results.total}`);
    log('green', `Passed: ${this.results.passed}`);
    log('red', `Failed: ${this.results.failed}`);
    
    const successRate = (this.results.passed / this.results.total) * 100;
    log('yellow', `Success Rate: ${successRate.toFixed(1)}%\n`);
    
    if (this.results.failed === 0) {
      log('green', '🎉 ALL TESTS PASSED - TDD FRAMEWORK IS READY!');
      log('green', '✅ Framework can be integrated into SDLC pipeline');
    } else {
      log('red', '⚠️  SOME TESTS FAILED - FRAMEWORK NEEDS FIXES');
      log('yellow', '\n🔍 Issues to address:');
      this.results.details.filter(d => d.status === 'FAILED').forEach(detail => {
        log('red', `  • ${detail.name}: ${detail.error}`);
      });
    }
    
    log('cyan', '\n📋 Detailed Results:');
    this.results.details.forEach(detail => {
      const icon = detail.status === 'PASSED' ? '✅' : '❌';
      const color = detail.status === 'PASSED' ? 'green' : 'red';
      log(color, `  ${icon} ${detail.name}`);
      if (detail.result) {
        log('blue', `      ${detail.result}`);
      }
    });
    
    log('cyan', '\n🚀 Next Steps:');
    log('blue', '1. Fix any failed validation tests');
    log('blue', '2. Run actual test suite execution');
    log('blue', '3. Analyze test performance and coverage');
    log('blue', '4. Document framework integration patterns');
    log('blue', '5. Deploy to SDLC pipeline\n');
  }
}

// Run the validation
async function main() {
  const validator = new TDDFrameworkValidator();
  await validator.runAllTests();
  
  // Exit with appropriate code
  process.exit(validator.results.failed === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = TDDFrameworkValidator;