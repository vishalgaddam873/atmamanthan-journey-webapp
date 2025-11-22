// Audio Coordinator - Manages which tab should play audio
// Uses BroadcastChannel API for cross-tab communication

class AudioCoordinator {
  constructor() {
    this.channel = typeof window !== 'undefined' && window.BroadcastChannel 
      ? new BroadcastChannel('audio_coordination')
      : null;
    this.isAudioMaster = false;
    this.tabId = this.generateTabId();
    this.listeners = [];
    
    if (this.channel) {
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    }
    
    // Try to become audio master on initialization
    this.requestMasterRole();
    
    // Listen for storage events as fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
    
    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.releaseMasterRole();
      });
    }
  }
  
  generateTabId() {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  requestMasterRole() {
    if (!this.channel) {
      // Fallback to localStorage
      const currentMaster = localStorage.getItem('audio_master_tab');
      if (!currentMaster) {
        localStorage.setItem('audio_master_tab', this.tabId);
        this.isAudioMaster = true;
        this.notifyListeners();
      } else if (currentMaster === this.tabId) {
        this.isAudioMaster = true;
        this.notifyListeners();
      } else {
        // Check if master tab is still alive
        this.checkMasterAlive();
      }
      return;
    }
    
    // Check if there's already a master
    const currentMaster = localStorage.getItem('audio_master_tab');
    
    if (!currentMaster || currentMaster === this.tabId) {
      // No master or we are the master
      localStorage.setItem('audio_master_tab', this.tabId);
      this.isAudioMaster = true;
      this.broadcast({ type: 'master_claimed', tabId: this.tabId });
      this.notifyListeners();
    } else {
      // Another tab is master, check if it's alive
      this.checkMasterAlive();
    }
  }
  
  checkMasterAlive() {
    // Ping the master tab
    if (this.channel) {
      this.broadcast({ type: 'ping_master', tabId: this.tabId });
      
      // Wait for response, if no response in 1 second, become master
      setTimeout(() => {
        const currentMaster = localStorage.getItem('audio_master_tab');
        if (currentMaster && currentMaster !== this.tabId) {
          // No response, assume master is dead, become master
          localStorage.setItem('audio_master_tab', this.tabId);
          this.isAudioMaster = true;
          this.broadcast({ type: 'master_claimed', tabId: this.tabId });
          this.notifyListeners();
        }
      }, 1000);
    }
  }
  
  releaseMasterRole() {
    if (this.isAudioMaster) {
      localStorage.removeItem('audio_master_tab');
      this.isAudioMaster = false;
      if (this.channel) {
        this.broadcast({ type: 'master_released', tabId: this.tabId });
      }
      this.notifyListeners();
    }
  }
  
  handleMessage(data) {
    if (data.type === 'ping_master' && this.isAudioMaster) {
      // Respond to ping
      this.broadcast({ type: 'master_alive', tabId: this.tabId });
    } else if (data.type === 'master_claimed' && data.tabId !== this.tabId) {
      // Another tab became master
      if (this.isAudioMaster) {
        this.isAudioMaster = false;
        this.notifyListeners();
      }
    } else if (data.type === 'master_alive' && data.tabId !== this.tabId) {
      // Master is alive, we are not master
      if (this.isAudioMaster) {
        this.isAudioMaster = false;
        this.notifyListeners();
      }
    }
  }
  
  handleStorageEvent(event) {
    if (event.key === 'audio_master_tab') {
      const currentMaster = localStorage.getItem('audio_master_tab');
      if (currentMaster !== this.tabId) {
        this.isAudioMaster = false;
        this.notifyListeners();
      } else if (currentMaster === this.tabId) {
        this.isAudioMaster = true;
        this.notifyListeners();
      }
    }
  }
  
  broadcast(data) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
  }
  
  shouldPlayAudio() {
    return this.isAudioMaster;
  }
  
  onMasterChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.isAudioMaster));
  }
  
  // Force this tab to be master (useful for table screen)
  forceMaster() {
    localStorage.setItem('audio_master_tab', this.tabId);
    this.isAudioMaster = true;
    if (this.channel) {
      this.broadcast({ type: 'master_claimed', tabId: this.tabId });
    }
    this.notifyListeners();
  }
}

// Singleton instance
let coordinatorInstance = null;

export const getAudioCoordinator = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      shouldPlayAudio: () => false,
      forceMaster: () => {},
      onMasterChange: () => () => {},
      isAudioMaster: false
    };
  }
  
  if (!coordinatorInstance) {
    coordinatorInstance = new AudioCoordinator();
  }
  return coordinatorInstance;
};

export default getAudioCoordinator;

