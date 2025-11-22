/**
 * Audio Manager - Handles frontend audio playback and backend state sync
 */
class AudioManager {
  constructor(socket) {
    this.socket = socket;
  }

  /**
   * Play audio and notify backend for state tracking
   * @param {string} audioPath - Asset path like "/assets/Audio/Common/bg1.mp3"
   * @param {string} audioId - MongoDB audio ID
   * @param {number} queueIndex - Current position in queue
   */
  playAudio(audioPath, audioId, queueIndex = null) {
    // Notify backend for state tracking (one-way, no broadcast)
    if (this.socket) {
      this.socket.emit('audio_state_update', {
        audioPath,
        audioId,
        state: 'PLAYING',
        queueIndex: queueIndex
      });
    }
  }

  /**
   * Pause audio and notify backend
   */
  pauseAudio() {
    if (this.socket) {
      this.socket.emit('audio_state_update', {
        state: 'PAUSED'
      });
    }
  }

  /**
   * Stop audio and notify backend
   */
  stopAudio() {
    if (this.socket) {
      this.socket.emit('audio_state_update', {
        audioPath: null,
        audioId: null,
        state: 'STOPPED',
        queueIndex: null
      });
    }
  }

  /**
   * Check for cue points in audio metadata
   * @param {string} audioId - MongoDB audio ID
   * @param {object} session - Current session object
   * @returns {Promise<object|null>} Cue point data or null
   */
  async checkCuePoint(audioId, session) {
    if (!audioId) {
      console.log('checkCuePoint: No audioId provided');
      return null;
    }
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      console.log(`checkCuePoint: Checking audio ${audioId} for cue points...`);
      const response = await fetch(`${API_BASE_URL}/api/audio/${audioId}`);
      const audio = await response.json();
      
      console.log(`checkCuePoint: Audio data received:`, {
        fileName: audio?.fileName,
        sequence: audio?.sequence,
        category: audio?.category,
        cuePoint: audio?.cuePoint
      });
      
      if (audio && audio.cuePoint && audio.cuePoint !== 'NONE') {
        console.log(`checkCuePoint: Cue point found! ${audio.cuePoint} for audio ${audio.fileName}`);
        return {
          cuePoint: audio.cuePoint,
          data: {
            category: session?.category,
            ageGroup: session?.ageGroup,
            audioId: audio._id,
            audioName: audio.fileName
          }
        };
      } else {
        console.log(`checkCuePoint: No cue point found (cuePoint: ${audio?.cuePoint || 'undefined'})`);
      }
    } catch (error) {
      console.error('Error checking cue point:', error);
    }
    
    return null;
  }
}

export default AudioManager;

