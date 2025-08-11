// Application Data
const appData = {
  "simulatedThreats": [
    {"name": "Trojan.Win32.Generic", "type": "Trojan", "risk": "High", "location": "C:\\Users\\Downloads\\suspicious_file.exe"},
    {"name": "Adware.WebHelper", "type": "Adware", "risk": "Medium", "location": "C:\\Program Files\\BrowserHelper\\helper.dll"},
    {"name": "PUP.Optional.Toolbar", "type": "PUP", "risk": "Low", "location": "C:\\Users\\AppData\\toolbar_installer.exe"},
    {"name": "Worm.VBS.LoveLetter", "type": "Worm", "risk": "High", "location": "C:\\Temp\\love_letter.vbs"},
    {"name": "Spyware.Keylogger", "type": "Spyware", "risk": "High", "location": "C:\\Windows\\System32\\keylog.dll"}
  ],
  "scanLocations": [
    "C:\\Windows\\System32\\",
    "C:\\Program Files\\",
    "C:\\Users\\Documents\\",
    "C:\\Users\\Downloads\\",
    "C:\\Users\\AppData\\",
    "C:\\Temp\\",
    "D:\\Programs\\",
    "C:\\Windows\\Temp\\",
    "C:\\ProgramData\\",
    "C:\\Users\\Desktop\\"
  ],
  "protectionModules": [
    {"name": "Real-time File Scanning", "description": "Scans files as they are accessed", "enabled": true},
    {"name": "Web Protection", "description": "Blocks malicious websites and downloads", "enabled": true},
    {"name": "Email Protection", "description": "Scans email attachments for threats", "enabled": true},
    {"name": "USB Protection", "description": "Scans removable media when connected", "enabled": false},
    {"name": "Behavioral Analysis", "description": "Monitors suspicious program behavior", "enabled": true}
  ],
  "scanStats": {
    "filesScannedToday": 15847,
    "threatsBlockedToday": 3,
    "lastScanDate": "2025-08-11",
    "virusDefinitionVersion": "25.08.11.02",
    "lastUpdateDate": "2025-08-11"
  },
  "educational": {
    "tooltips": {
      "realTimeProtection": "Real-time protection continuously monitors your system for threats",
      "quarantine": "Quarantine isolates suspicious files so they cannot harm your system",
      "heuristics": "Heuristic analysis detects unknown threats by analyzing suspicious behavior",
      "definitions": "Virus definitions are signatures that help identify known malware"
    }
  }
};

// Application State
let currentScan = null;
let detectedThreats = [];
let quarantinedItems = [
  { name: "suspicious_installer.exe", path: "C:\\Temp\\suspicious_installer.exe", date: "2025-08-10", risk: "Medium" },
  { name: "malware.dll", path: "C:\\Windows\\System32\\malware.dll", date: "2025-08-09", risk: "High" }
];

// DOM Elements
const elements = {
  scanNowBtn: document.getElementById('scanNowBtn'),
  quickScanBtn: document.getElementById('quickScanBtn'),
  fullScanBtn: document.getElementById('fullScanBtn'),
  customScanBtn: document.getElementById('customScanBtn'),
  cancelScanBtn: document.getElementById('cancelScanBtn'),
  scanProgress: document.getElementById('scanProgress'),
  progressBar: document.getElementById('progressBar'),
  progressStatus: document.getElementById('progressStatus'),
  progressDetails: document.getElementById('progressDetails'),
  protectionStatus: document.getElementById('protectionStatus'),
  protectionModules: document.getElementById('protectionModules'),
  scanResults: document.getElementById('scanResults'),
  scanSummary: document.getElementById('scanSummary'),
  threatsList: document.getElementById('threatsList'),
  quarantineItems: document.getElementById('quarantineItems'),
  quarantineCount: document.getElementById('quarantineCount'),
  clearQuarantineBtn: document.getElementById('clearQuarantineBtn'),
  checkUpdatesBtn: document.getElementById('checkUpdatesBtn'),
  updateProgress: document.getElementById('updateProgress'),
  updateProgressBar: document.getElementById('updateProgressBar'),
  updateStatus: document.getElementById('updateStatus'),
  educationalModal: document.getElementById('educationalModal'),
  threatModal: document.getElementById('threatModal'),
  modalClose: document.getElementById('modalClose'),
  threatModalClose: document.getElementById('threatModalClose')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  renderProtectionModules();
  renderQuarantineItems();
});

function initializeApp() {
  // Update stats display
  document.getElementById('filesScanned').textContent = appData.scanStats.filesScannedToday.toLocaleString();
  document.getElementById('threatsBlocked').textContent = appData.scanStats.threatsBlockedToday;
  document.getElementById('definitionVersion').textContent = appData.scanStats.virusDefinitionVersion;
  document.getElementById('lastUpdate').textContent = formatDate(appData.scanStats.lastUpdateDate);
  
  // Set protection status
  updateProtectionStatus('Protected');
}

function setupEventListeners() {
  // Scan buttons
  elements.scanNowBtn.addEventListener('click', () => startScan('quick'));
  elements.quickScanBtn.addEventListener('click', () => startScan('quick'));
  elements.fullScanBtn.addEventListener('click', () => startScan('full'));
  elements.customScanBtn.addEventListener('click', () => startScan('custom'));
  elements.cancelScanBtn.addEventListener('click', cancelScan);

  // Quarantine - Fixed: Ensure event listener is properly attached
  if (elements.clearQuarantineBtn) {
    elements.clearQuarantineBtn.addEventListener('click', clearQuarantine);
  }

  // Updates - Fixed: Ensure event listener is properly attached
  if (elements.checkUpdatesBtn) {
    elements.checkUpdatesBtn.addEventListener('click', checkForUpdates);
  }

  // Modals
  if (elements.modalClose) {
    elements.modalClose.addEventListener('click', closeModal);
  }
  if (elements.threatModalClose) {
    elements.threatModalClose.addEventListener('click', closeThreatModal);
  }

  // Settings
  const scanSensitivity = document.getElementById('scanSensitivity');
  const autoUpdate = document.getElementById('autoUpdate');
  const notifications = document.getElementById('notifications');
  
  if (scanSensitivity) {
    scanSensitivity.addEventListener('input', updateScanSensitivity);
  }
  if (autoUpdate) {
    autoUpdate.addEventListener('change', toggleAutoUpdate);
  }
  if (notifications) {
    notifications.addEventListener('change', toggleNotifications);
  }

  // Tooltips
  document.querySelectorAll('.tooltip').forEach(tooltip => {
    tooltip.addEventListener('click', showEducationalModal);
  });
}

function renderProtectionModules() {
  if (!elements.protectionModules) return;
  
  elements.protectionModules.innerHTML = '';
  
  appData.protectionModules.forEach((module, index) => {
    const moduleElement = document.createElement('div');
    moduleElement.className = 'protection-module';
    moduleElement.innerHTML = `
      <div class="module-info">
        <h4>${module.name}</h4>
        <p>${module.description}</p>
      </div>
      <label class="toggle-container">
        <input type="checkbox" ${module.enabled ? 'checked' : ''} data-module="${index}">
        <span class="toggle-slider"></span>
      </label>
    `;
    
    // Fixed: Properly attach event listener to the checkbox
    const checkbox = moduleElement.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', function(e) {
        toggleProtectionModule(index, e.target.checked);
      });
    }
    
    elements.protectionModules.appendChild(moduleElement);
  });
}

function renderQuarantineItems() {
  if (!elements.quarantineItems || !elements.quarantineCount) return;
  
  elements.quarantineItems.innerHTML = '';
  elements.quarantineCount.textContent = quarantinedItems.length;
  
  if (quarantinedItems.length === 0) {
    elements.quarantineItems.innerHTML = '<p class="text-center" style="color: var(--color-text-secondary); padding: var(--space-16);">No items in quarantine</p>';
    return;
  }
  
  quarantinedItems.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'quarantine-item';
    itemElement.innerHTML = `
      <div class="quarantine-info">
        <strong>${item.name}</strong>
        <span>${item.path}</span>
        <span>Quarantined: ${formatDate(item.date)} - Risk: ${item.risk}</span>
      </div>
      <div class="quarantine-actions">
        <button class="btn btn--outline btn--sm restore-btn" data-index="${index}">Restore</button>
        <button class="btn btn--secondary btn--sm delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
    
    // Add event listeners for restore and delete buttons
    const restoreBtn = itemElement.querySelector('.restore-btn');
    const deleteBtn = itemElement.querySelector('.delete-btn');
    
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => restoreItem(index));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteItem(index));
    }
    
    elements.quarantineItems.appendChild(itemElement);
  });
}

function startScan(type) {
  if (currentScan) return;
  
  currentScan = {
    type: type,
    progress: 0,
    filesScanned: 0,
    timeElapsed: 0,
    detectedThreats: [],
    isActive: true
  };
  
  // Hide scan results and show progress
  if (elements.scanResults) {
    elements.scanResults.classList.add('hidden');
  }
  if (elements.scanProgress) {
    elements.scanProgress.classList.remove('hidden');
  }
  
  // Update protection status
  updateProtectionStatus('Scanning');
  
  // Disable scan buttons
  toggleScanButtons(false);
  
  // Start scan simulation
  simulateScan(type);
}

function simulateScan(type) {
  const scanDuration = getScanDuration(type);
  const totalFiles = getTotalFiles(type);
  const startTime = Date.now();
  
  const scanInterval = setInterval(() => {
    if (!currentScan || !currentScan.isActive) {
      clearInterval(scanInterval);
      return;
    }
    
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / scanDuration) * 100, 100);
    const filesScanned = Math.floor((progress / 100) * totalFiles);
    
    currentScan.progress = progress;
    currentScan.filesScanned = filesScanned;
    currentScan.timeElapsed = Math.floor(elapsed / 1000);
    
    updateScanProgress();
    
    // Simulate threat detection
    if (Math.random() < 0.02 && currentScan.detectedThreats.length < 2) {
      detectThreat();
    }
    
    if (progress >= 100) {
      clearInterval(scanInterval);
      completeScan();
    }
  }, 100);
}

function updateScanProgress() {
  const currentLocation = getCurrentScanLocation();
  
  if (elements.progressBar) {
    elements.progressBar.style.width = `${currentScan.progress}%`;
  }
  if (elements.progressStatus) {
    elements.progressStatus.textContent = `Scanning: ${currentLocation}`;
  }
  if (elements.progressDetails) {
    elements.progressDetails.textContent = `${currentScan.filesScanned.toLocaleString()} files scanned - ${currentScan.timeElapsed}s elapsed`;
  }
}

function getCurrentScanLocation() {
  const locations = appData.scanLocations;
  const index = Math.floor((currentScan.progress / 100) * locations.length);
  return locations[Math.min(index, locations.length - 1)] + getRandomFileName();
}

function getRandomFileName() {
  const files = ['explorer.exe', 'system.dll', 'config.ini', 'data.tmp', 'cache.db', 'log.txt', 'service.exe'];
  return files[Math.floor(Math.random() * files.length)];
}

function detectThreat() {
  const availableThreats = appData.simulatedThreats.filter(threat => 
    !currentScan.detectedThreats.some(detected => detected.name === threat.name)
  );
  
  if (availableThreats.length > 0) {
    const threat = availableThreats[Math.floor(Math.random() * availableThreats.length)];
    currentScan.detectedThreats.push(threat);
    showThreatAlert(threat);
  }
}

function showThreatAlert(threat) {
  const threatInfo = document.getElementById('threatInfo');
  if (!threatInfo) return;
  
  threatInfo.innerHTML = `
    <div class="threat-details">
      <h4>${threat.name}</h4>
      <p><strong>Type:</strong> ${threat.type}</p>
      <p><strong>Risk Level:</strong> <span class="text-${threat.risk.toLowerCase() === 'high' ? 'error' : threat.risk.toLowerCase() === 'medium' ? 'warning' : 'success'}">${threat.risk}</span></p>
      <p><strong>Location:</strong> ${threat.location}</p>
    </div>
  `;
  
  // Set up threat action buttons
  const quarantineBtn = document.getElementById('quarantineThreatBtn');
  const deleteBtn = document.getElementById('deleteThreatBtn');
  const ignoreBtn = document.getElementById('ignoreThreatBtn');
  
  if (quarantineBtn) {
    quarantineBtn.onclick = () => quarantineThreat(threat);
  }
  if (deleteBtn) {
    deleteBtn.onclick = () => deleteThreat(threat);
  }
  if (ignoreBtn) {
    ignoreBtn.onclick = () => ignoreThreat(threat);
  }
  
  if (elements.threatModal) {
    elements.threatModal.classList.remove('hidden');
  }
}

function quarantineThreat(threat) {
  quarantinedItems.push({
    name: threat.name,
    path: threat.location,
    date: new Date().toISOString().split('T')[0],
    risk: threat.risk
  });
  
  renderQuarantineItems();
  closeThreatModal();
  showNotification('Threat quarantined successfully', 'success');
}

function deleteThreat(threat) {
  closeThreatModal();
  showNotification('Threat deleted successfully', 'success');
}

function ignoreThreat(threat) {
  closeThreatModal();
  showNotification('Threat ignored', 'warning');
}

function completeScan() {
  currentScan.isActive = false;
  
  // Hide progress and show results
  if (elements.scanProgress) {
    elements.scanProgress.classList.add('hidden');
  }
  if (elements.scanResults) {
    elements.scanResults.classList.remove('hidden');
  }
  
  // Update protection status
  updateProtectionStatus(currentScan.detectedThreats.length > 0 ? 'Threats Found' : 'Protected');
  
  // Show scan results
  displayScanResults();
  
  // Update last scan time
  const now = new Date();
  const lastScanElement = document.getElementById('lastScanTime');
  if (lastScanElement) {
    lastScanElement.textContent = formatDateTime(now);
  }
  
  // Enable scan buttons
  toggleScanButtons(true);
  
  currentScan = null;
}

function displayScanResults() {
  if (!currentScan) return;
  
  const hasThreats = currentScan.detectedThreats.length > 0;
  
  if (elements.scanSummary) {
    elements.scanSummary.className = `scan-summary ${hasThreats ? 'has-threats' : ''}`;
    elements.scanSummary.innerHTML = `
      <h4>${hasThreats ? '⚠️ Threats Detected' : '✅ System Clean'}</h4>
      <p>Scan completed: ${currentScan.filesScanned.toLocaleString()} files scanned in ${currentScan.timeElapsed} seconds</p>
      <p>Threats found: <strong class="${hasThreats ? 'text-error' : 'text-success'}">${currentScan.detectedThreats.length}</strong></p>
    `;
  }
  
  if (elements.threatsList) {
    elements.threatsList.innerHTML = '';
    
    if (hasThreats) {
      currentScan.detectedThreats.forEach((threat, index) => {
        const threatElement = document.createElement('div');
        threatElement.className = 'threat-item';
        threatElement.innerHTML = `
          <div class="threat-details">
            <h4>${threat.name}</h4>
            <p>${threat.location} - Risk: ${threat.risk}</p>
          </div>
          <div class="threat-actions">
            <button class="btn btn--primary btn--sm quarantine-threat-btn" data-index="${index}">Quarantine</button>
            <button class="btn btn--secondary btn--sm delete-threat-btn" data-index="${index}">Delete</button>
          </div>
        `;
        
        const quarantineBtn = threatElement.querySelector('.quarantine-threat-btn');
        const deleteBtn = threatElement.querySelector('.delete-threat-btn');
        
        if (quarantineBtn) {
          quarantineBtn.addEventListener('click', () => quarantineThreat(threat));
        }
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => deleteThreat(threat));
        }
        
        elements.threatsList.appendChild(threatElement);
      });
    }
  }
}

function cancelScan() {
  if (currentScan) {
    currentScan.isActive = false;
    currentScan = null;
  }
  
  if (elements.scanProgress) {
    elements.scanProgress.classList.add('hidden');
  }
  updateProtectionStatus('Protected');
  toggleScanButtons(true);
}

// Fixed: Ensure the update function works properly
function checkForUpdates() {
  if (!elements.updateProgress || !elements.updateProgressBar || !elements.updateStatus || !elements.checkUpdatesBtn) {
    return;
  }
  
  elements.updateProgress.classList.remove('hidden');
  elements.checkUpdatesBtn.disabled = true;
  elements.updateStatus.textContent = 'Checking for updates...';
  
  let progress = 0;
  const updateInterval = setInterval(() => {
    progress += Math.random() * 15 + 5; // Faster progress for better UX
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(updateInterval);
      
      elements.updateProgressBar.style.width = '100%';
      elements.updateStatus.textContent = 'Update complete';
      
      setTimeout(() => {
        elements.updateProgress.classList.add('hidden');
        elements.checkUpdatesBtn.disabled = false;
        
        // Update version and date
        const now = new Date();
        const version = `25.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.03`;
        const definitionVersionElement = document.getElementById('definitionVersion');
        const lastUpdateElement = document.getElementById('lastUpdate');
        
        if (definitionVersionElement) {
          definitionVersionElement.textContent = version;
        }
        if (lastUpdateElement) {
          lastUpdateElement.textContent = formatDate(now.toISOString().split('T')[0]);
        }
        
        showNotification('Virus definitions updated successfully', 'success');
      }, 1000);
    } else {
      elements.updateProgressBar.style.width = `${progress}%`;
      elements.updateStatus.textContent = progress < 50 ? 'Downloading updates...' : 'Installing updates...';
    }
  }, 200);
}

// Fixed: Ensure protection module toggles work properly
function toggleProtectionModule(index, enabled) {
  if (index >= 0 && index < appData.protectionModules.length) {
    appData.protectionModules[index].enabled = enabled;
    showNotification(`${appData.protectionModules[index].name} ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }
}

// Fixed: Ensure quarantine clearing works
function clearQuarantine() {
  quarantinedItems = [];
  renderQuarantineItems();
  showNotification('Quarantine cleared', 'success');
}

function restoreItem(index) {
  if (index >= 0 && index < quarantinedItems.length) {
    const item = quarantinedItems[index];
    quarantinedItems.splice(index, 1);
    renderQuarantineItems();
    showNotification(`${item.name} restored`, 'success');
  }
}

function deleteItem(index) {
  if (index >= 0 && index < quarantinedItems.length) {
    const item = quarantinedItems[index];
    quarantinedItems.splice(index, 1);
    renderQuarantineItems();
    showNotification(`${item.name} deleted`, 'success');
  }
}

function updateProtectionStatus(status) {
  if (!elements.protectionStatus) return;
  
  const indicator = elements.protectionStatus.querySelector('.status-indicator');
  const text = elements.protectionStatus.querySelector('.status-text');
  
  if (!indicator || !text) return;
  
  // Remove existing status classes
  indicator.className = 'status-indicator';
  
  text.textContent = status;
  
  switch (status) {
    case 'Protected':
      indicator.classList.add('status-protected');
      break;
    case 'Scanning':
      indicator.classList.add('status-scanning');
      break;
    case 'Threats Found':
      indicator.classList.add('status-threat');
      break;
  }
}

function toggleScanButtons(enabled) {
  const buttons = [elements.scanNowBtn, elements.quickScanBtn, elements.fullScanBtn, elements.customScanBtn];
  buttons.forEach(btn => {
    if (btn) {
      btn.disabled = !enabled;
    }
  });
}

function getScanDuration(type) {
  switch (type) {
    case 'quick': return 8000; // 8 seconds
    case 'full': return 25000; // 25 seconds
    case 'custom': return 12000; // 12 seconds
    default: return 8000;
  }
}

function getTotalFiles(type) {
  switch (type) {
    case 'quick': return 2500;
    case 'full': return 12000;
    case 'custom': return 5500;
    default: return 2500;
  }
}

function showEducationalModal(e) {
  const tooltip = e.target.getAttribute('data-tooltip');
  if (tooltip && elements.educationalModal) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (modalTitle) modalTitle.textContent = 'Security Information';
    if (modalContent) modalContent.textContent = tooltip;
    elements.educationalModal.classList.remove('hidden');
  }
}

function closeModal() {
  if (elements.educationalModal) {
    elements.educationalModal.classList.add('hidden');
  }
}

function closeThreatModal() {
  if (elements.threatModal) {
    elements.threatModal.classList.add('hidden');
  }
}

function showNotification(message, type) {
  // Simple notification system - could be enhanced with a proper notification component
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    box-shadow: var(--shadow-lg);
    z-index: 1001;
    color: var(--color-text);
    font-size: var(--font-size-sm);
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

function updateScanSensitivity(e) {
  const sensitivity = ['Low', 'Medium', 'High'][e.target.value - 1];
  showNotification(`Scan sensitivity set to ${sensitivity}`, 'info');
}

function toggleAutoUpdate(e) {
  showNotification(`Automatic updates ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
}

function toggleNotifications(e) {
  showNotification(`Desktop notifications ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatDateTime(date) {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.add('hidden');
  }
});

// Educational tips on first load
setTimeout(() => {
  showNotification('💡 This is an educational antivirus simulator. No real files are scanned or affected.', 'info');
}, 2000);