import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import ImageDisplay from '../components/ImageDisplay';
import MirrorReflection from '../components/MirrorReflection';
import LightAnimation from '../components/LightAnimation';
import ParticleEffect from '../components/ParticleEffect';
import AudioPlayer from '../components/AudioPlayer';
import DialogueDisplay from '../components/DialogueDisplay';
import CircularGlowAnimation from '../components/CircularGlowAnimation';
import CelebrationAnimation from '../components/CelebrationAnimation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentAudio, clearCurrentAudio } from '../store/slices/audioSlice';
import api from '../lib/api';
import { 
  setShowImages, 
  setImageType, 
  setFadeIn, 
  setShowMirrorReflection,
  setShowLightAnimation,
  setShowParticles,
  setLightIntensity,
  setDialogueText,
  setShowDialogue,
  resetMirrorState 
} from '../store/slices/uiSlice';

const MirrorScreen = () => {
  const dispatch = useAppDispatch();
  const { socket, connected } = useSocket();
  
  // Redux state
  const session = useAppSelector((state) => state.session.session);
  const currentAudio = useAppSelector((state) => state.audio.currentAudio);
  const showImages = useAppSelector((state) => state.ui.showImages);
  const imageType = useAppSelector((state) => state.ui.imageType);
  const fadeIn = useAppSelector((state) => state.ui.fadeIn);
  const showMirrorReflection = useAppSelector((state) => state.ui.showMirrorReflection);
  const showLightAnimation = useAppSelector((state) => state.ui.showLightAnimation);
  const showParticles = useAppSelector((state) => state.ui.showParticles);
  const lightIntensity = useAppSelector((state) => state.ui.lightIntensity);
  const dialogueText = useAppSelector((state) => state.ui.dialogueText);
  const showDialogue = useAppSelector((state) => state.ui.showDialogue);
  const showCelebration = useAppSelector((state) => state.ui.showCelebration);
  const [currentDialogueSequence, setCurrentDialogueSequence] = useState(null);
  
  // Positive Flow specific state
  const [positiveFlowState, setPositiveFlowState] = useState({
    currentAudioSequence: null,
    showCircularGlow: false,
    showFirstImages: false,
    showSecondImages: false,
    circularGlowDuration: 0,
  });
  
  // Neutral Flow specific state
  const [neutralFlowState, setNeutralFlowState] = useState({
    currentAudioSequence: null,
    showNeutralImages: false,
    showPositiveImages: false,
  });
  
  // Negative Flow specific state
  const [negativeFlowState, setNegativeFlowState] = useState({
    currentAudioSequence: null,
    showNegativeImages: false,
    showPositiveImages: false,
  });
  
  // Ref to track last audio sequence for audio_stop handler
  const lastAudioSequenceRef = useRef(null);

  // Positive flow dialogue mapping by sequence number
  const positiveFlowDialogues = {
    1: 'जो भाव आपने चुना है, वह कोई साधारण भावना नहीं\nयह आपके भीतर की रौशनी है। एक ऐसी रौशनी जो आपके जीवन को दिशा देती है।',
    2: 'अब सामने की ओर दर्पण में केवल देखें\nबस देखिए कोई प्रतिक्रिया न दें',
    3: 'हर प्रेम में एक healing होती है।,\nऔर हर खुशी में एक नई ऊर्जा,\nऔर हर प्रकाश के आसपास एक छोटा-सा साया भी होता है।',
    4: 'जो चमक जो softness आप महसूस कर रहे हैं\nवह आपके भीतर पहले से मौजूद प्रेम और खुशी का प्रतिबिंब है।',
    5: 'आइए, आज हम एक छोटा-सा प्रण करें।\ntable पर रखे \'प्रण\' में से किसी एक का बटन दबाएँ।',
    6: 'पर याद रखिए— आपने रौशनी को चुना है।\nआपने प्रेम को चुना है। आपने खुशी को चुना है।',
    7: 'अब स्क्रीन पर दिखाई दे रही रौशनी को देखें\nयह रौशनी बढ़ रही है\nफैल रही है\nऔर आपके भीतर की positivity को और मजबूत कर रही है।',
    8: 'इस निरंकार का आधार लेकर अपने भीतर के सुकून को महसूस कीजिए।',
    9: 'अब कृपया बाहर की ओर जाएँ और अपना \'प्रॉमिस बैंड\' ग्रहण कर लें।\nशुक्रिया जी धन निरंकार जी।',
  };
  
  // Also keep filename mapping as fallback
  const positiveFlowDialoguesByFilename = {
    '1.Before-Seeing-Mirror.mp3': positiveFlowDialogues[1],
    '2.Seeing-Mirror.mp3': positiveFlowDialogues[2],
    '3.After-Positive-Images-Record-1.mp3': positiveFlowDialogues[3],
    '4.After-Positive-Images-Record-2.mp3': positiveFlowDialogues[4],
    '5.Choosing-Promise.mp3': positiveFlowDialogues[5],
    '6.Enlightenment-Record-1.mp3': positiveFlowDialogues[6],
    '7.Enlightenment-Record-1.mp3.mp3': positiveFlowDialogues[7],
    '8.Nirankar-Ka-Aadhar.mp3': positiveFlowDialogues[8],
    '9.Dhan-Nirankar-Ji.mp3': positiveFlowDialogues[9],
  };

  // Negative flow dialogue mapping by sequence number
  const negativeFlowDialogues = {
    1: 'अब सामने की ओर दर्पण में केवल देखें\nबस देखिए ****प्रतिक्रिया न दें',
    2: 'अभी आपने जो देखा वह आप नहीं थे। वह केवल आपके विचारों का प्रतिबिंब था।\nआप सिर्फ ये विचार नहीं हैं, आप उनसे कहीं ज्यादा बढ़कर हैं।',
    3: 'हमारे जीवन में हर परिस्थिति के दो पहलू होते हैं—\nनकारात्मक और सकारात्मक। और यह पूरी तरह हमारे हाथ में है कि हम कौन-सा रास्ता चुनते हैं।',
    4: 'आइए, आज हम एक छोटा-सा प्रण करें।\ntable पर रखे \'प्रण\' में से किसी एक का बटन दबाएँ।',
    5: 'याद रखिए— हर दिन एक नई opportunity है।\nपॉज़िटिविटी को अपनाएँ और नेगेटिविटी को पॉज़िटिविटी में बदलने की शक्ति आपके अंदर है।\nआपका जीवन आपके ही हाथों में है।',
    6: 'अभी आपने भीतर का अँधेरा भी देखा और रौशनी भी\nऔर अब जो रौशनी आप देखने जा रहे हैं\nवह कोई और नहीं— वह आप स्वयं हैं।',
    7: 'You are the light. The light you see is YOU.',
    8: 'इस निरंकार का आधार लेकर अपने भीतर के सुकून को महसूस कीजिए।',
    9: 'अब कृपया बाहर की ओर जाएँ और अपना \'प्रॉमिस बैंड\' ग्रहण कर लें।\nशुक्रिया जी धन निरंकार जी।',
  };

  // Negative flow filename mapping
  const negativeFlowDialoguesByFilename = {
    '1.Seeing-Mirror.mp3': negativeFlowDialogues[1],
    '2.After-Negative-Images.mp3': negativeFlowDialogues[2],
    '3.After-Positive-Images.mp3': negativeFlowDialogues[3],
    '4.Choosing-Promise.mp3': negativeFlowDialogues[4],
    '5.Enlightenment-Record-1.mp3': negativeFlowDialogues[5],
    '6.Enlightenment-Record-2.mp3': negativeFlowDialogues[6],
    '7.You-Are-the-Light.mp3': negativeFlowDialogues[7],
    '8.Nirankar-Ka-Aadhar.mp3': negativeFlowDialogues[8],
    '9.Dhan-Nirankar-Ji.mp3': negativeFlowDialogues[9],
  };

  // Neutral flow dialogue mapping by sequence number
  const neutralFlowDialogues = {
    1: 'अब सामने की ओर दर्पण में केवल देखें\nबस देखिए ****प्रतिक्रिया न दें',
    2: 'अभी आपने जो देखा, यह धुंध यह हल्का-सा खालीपन\nयह भी आप नहीं हैं यह केवल एक *स्थिति* है, जो आई है और चली जाएगी।',
    3: 'स्क्रीन पर जो धुंधलापन आप देख रहे हैं, वह धीरे-धीरे हटने लगा है\nजैसे सुबह की धूप, रात की ठंडक को पिघला देती है।',
    4: 'जीवन में कई तरह के पल आते हैं, कुछ स्पष्ट, कुछ उलझे हुए और हर पल हमें थोड़ा-थोड़ा आगे बढ़ना सिखाता है।',
    5: 'आइए, आज हम एक छोटा-सा प्रण करें।\ntable पर रखे \'प्रण\' में से किसी एक का बटन दबाएँ।',
    6: 'अब देखिए थोड़ा साफ़ दिखाई देने लगा है थोड़ी रोशनी बढ़ रही है',
    7: 'अब जो रौशनी आपके सामने प्रकट हो रही है\nवह आप ही हैं, आपकी clarity आपकी शांति आपकी दिशा।',
    8: 'इस निरंकार का आधार लेकर इस नयी ऊर्जा को अपने भीतर महसूस करें',
    9: 'अब कृपया बाहर की ओर जाएँ और अपना \'प्रॉमिस बैंड\' ग्रहण कर लें।\nशुक्रिया जी धन निरंकार जी।',
  };

  // Neutral flow filename mapping (note: typos in filenames preserved)
  const neutralFlowDialoguesByFilename = {
    '1.Seeing-Mirror.mp3': neutralFlowDialogues[1],
    '2.After-Nuteral-Images.mp3': neutralFlowDialogues[2],
    '3.With-Positive-Images.mp3': neutralFlowDialogues[3],
    '4.Affter-Positive-Images.mp3': neutralFlowDialogues[4],
    '5.Choosing-Promise.mp3': neutralFlowDialogues[5],
    '6.Enlightenment-Record-1.mp3': neutralFlowDialogues[6],
    '7.Enlightenment-Record-2.mp3': neutralFlowDialogues[7],
    '8.Nirankar-Ka-Aadhar.mp3': neutralFlowDialogues[8],
    '9.Dhan-Nirankar-Ji.mp3': neutralFlowDialogues[9],
  };

  // Map session age groups to image age groups
  const mapAgeGroup = (sessionAgeGroup) => {
    const mapping = {
      'KIDS': '4-9',
      'PRE-TEEN': '9-14',
      'TEEN+': '15+'
    };
    return mapping[sessionAgeGroup] || sessionAgeGroup;
  };
  
  // Mirror screen should NOT play audio - it's only for visuals
  // Audio will be played by table screen

  useEffect(() => {
    if (!socket || !session) return;

    // Handle audio events
    socket.on('audio_play', async ({ audioPath, audioId }) => {
      dispatch(setCurrentAudio(audioPath));
      // Trigger play event
      window.dispatchEvent(new Event('audio:play'));
      
      // Handle Positive Flow specifically
      if (session?.category === 'POSITIVE' && audioId) {
        try {
          const audioResponse = await api.get(`/api/audio/${audioId}`);
          const audioData = audioResponse.data;
          const sequence = audioData.sequence;
          const fileName = audioData.fileName || audioPath.split('/').pop();
          
          console.log('Positive Flow - Audio Sequence:', sequence, 'FileName:', fileName);
          
          // Update positive flow state and ref
          lastAudioSequenceRef.current = sequence;
          setPositiveFlowState(prev => ({
            ...prev,
            currentAudioSequence: sequence,
            showCircularGlow: false,
            showFirstImages: false,
            showSecondImages: false,
          }));
          
          // Hide everything first
          dispatch(setShowImages(false));
          dispatch(setShowMirrorReflection(false));
          dispatch(setShowLightAnimation(false));
          dispatch(setShowParticles(false));
          dispatch(setShowDialogue(false));
          
          // Handle each sequence
          if (sequence === 1) {
            // Audio 1: Circular glow animation
            console.log('Positive Flow: Audio 1 - Showing circular glow');
            setPositiveFlowState(prev => ({
              ...prev,
              showCircularGlow: true,
              circularGlowDuration: 15000, // Default duration, will be updated if we get actual duration
            }));
            // Don't show dialogue for Audio 1
          } else if (sequence === 2) {
            // Audio 2: Blank screen (nothing)
            console.log('Positive Flow: Audio 2 - Blank screen');
            // Everything is already hidden above
          } else if (sequence === 3 || sequence === 4 || sequence === 5) {
            // Audio 3, 4, 5: Show dialogues with typewriter
            console.log(`Positive Flow: Audio ${sequence} - Showing dialogue`);
            const dialogue = positiveFlowDialogues[sequence];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(sequence);
            }
          } else if (sequence === 6) {
            // Audio 6: Show dialogue first, images will show after audio completes
            console.log('Positive Flow: Audio 6 - Showing dialogue, images will show after audio completes');
            // DO NOT show images here - only show dialogue
            const dialogue = positiveFlowDialogues[6];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(6);
            }
            // Images will be shown in audio_stop handler
          } else if (sequence === 7) {
            // Audio 7: Circular glow that brightens
            console.log('Positive Flow: Audio 7 - Showing circular glow that brightens');
            setPositiveFlowState(prev => ({
              ...prev,
              showCircularGlow: true,
              circularGlowDuration: 15000, // Default duration
            }));
            // Also show dialogue
            const dialogue = positiveFlowDialogues[7];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(7);
            }
          } else if (sequence === 8 || sequence === 9) {
            // Audio 8, 9: Show dialogues with typewriter
            console.log(`Positive Flow: Audio ${sequence} - Showing dialogue`);
            const dialogue = positiveFlowDialogues[sequence];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(sequence);
            }
          }
        } catch (error) {
          console.error('Error handling Positive Flow audio:', error);
        }
      }
      
      // Handle Neutral Flow specifically
      if (session?.category === 'NEUTRAL' && audioId) {
        try {
          const audioResponse = await api.get(`/api/audio/${audioId}`);
          const audioData = audioResponse.data;
          const sequence = audioData.sequence;
          const fileName = audioData.fileName || audioPath.split('/').pop();
          
          console.log('Neutral Flow - Audio Sequence:', sequence, 'FileName:', fileName);
          
          // Update neutral flow state and ref
          lastAudioSequenceRef.current = sequence;
          setNeutralFlowState(prev => ({
            ...prev,
            currentAudioSequence: sequence,
            showNeutralImages: false,
            showPositiveImages: false,
          }));
          
          // Hide everything first
          dispatch(setShowImages(false));
          dispatch(setShowMirrorReflection(false));
          dispatch(setShowLightAnimation(false));
          dispatch(setShowParticles(false));
          dispatch(setShowDialogue(false));
          
          // Handle each sequence
          if (sequence === 1) {
            // Audio 1: Blank screen (nothing visible)
            console.log('Neutral Flow: Audio 1 - Blank screen');
            // Everything is already hidden above
          } else if (sequence === 2) {
            // Audio 2: Show dialogues only, no images
            console.log('Neutral Flow: Audio 2 - Showing dialogue only');
            // Ensure images are hidden and clear imageType to prevent stale state
            dispatch(setShowImages(false));
            dispatch(setImageType(null));
            setNeutralFlowState(prev => ({
              ...prev,
              showNeutralImages: false,
              showPositiveImages: false,
            }));
            const dialogue = neutralFlowDialogues[2];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(2);
            }
          } else if (sequence === 3) {
            // Audio 3: Show dialogue first, images will show after audio completes
            console.log('✓✓✓ Neutral Flow: Audio 3 - Showing dialogue, images will show after audio completes ✓✓✓');
            // DO NOT show images here - only show dialogue
            const dialogue = neutralFlowDialogues[3];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(3);
            }
            // Images will be shown in audio_stop handler
          } else if (sequence >= 4 && sequence <= 9) {
            // Audio 4-9: Show dialogues only
            console.log(`Neutral Flow: Audio ${sequence} - Showing dialogue only`);
            const dialogue = neutralFlowDialogues[sequence];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(sequence);
            }
          }
        } catch (error) {
          console.error('Error handling Neutral Flow audio:', error);
        }
      }
      
      // Handle Negative Flow specifically
      if (session?.category === 'NEGATIVE' && audioId) {
        try {
          const audioResponse = await api.get(`/api/audio/${audioId}`);
          const audioData = audioResponse.data;
          const sequence = audioData.sequence;
          const fileName = audioData.fileName || audioPath.split('/').pop();
          
          console.log('Negative Flow - Audio Sequence:', sequence, 'FileName:', fileName);
          
          // Update negative flow state and ref
          lastAudioSequenceRef.current = sequence;
          setNegativeFlowState(prev => ({
            ...prev,
            currentAudioSequence: sequence,
            showNegativeImages: false,
            showPositiveImages: false,
          }));
          
          // Hide everything first
          dispatch(setShowImages(false));
          dispatch(setShowMirrorReflection(false));
          dispatch(setShowLightAnimation(false));
          dispatch(setShowParticles(false));
          dispatch(setShowDialogue(false));
          
          // Handle each sequence
          if (sequence === 1) {
            // Audio 1: Blank screen (nothing visible)
            console.log('Negative Flow: Audio 1 - Blank screen');
            // Everything is already hidden above
          } else if (sequence >= 2 && sequence <= 9) {
            // Audio 2-9: Show dialogues only
            console.log(`Negative Flow: Audio ${sequence} - Showing dialogue only`);
            const dialogue = negativeFlowDialogues[sequence];
            if (dialogue) {
              dispatch(setDialogueText(dialogue));
              dispatch(setShowDialogue(true));
              setCurrentDialogueSequence(sequence);
            }
          }
        } catch (error) {
          console.error('Error handling Negative Flow audio:', error);
        }
      }
      
      // Show dialogue for all flows (POSITIVE, NEGATIVE, NEUTRAL)
      if (session?.category && audioId) {
        console.log('=== DIALOGUE DEBUG ===');
        console.log('Audio Path:', audioPath);
        console.log('Audio ID:', audioId);
        console.log('Session Category:', session?.category);
        
        // Select dialogue mappings based on category
        let dialogues = null;
        let dialoguesByFilename = null;
        
        if (session.category === 'POSITIVE') {
          dialogues = positiveFlowDialogues;
          dialoguesByFilename = positiveFlowDialoguesByFilename;
        } else if (session.category === 'NEGATIVE') {
          dialogues = negativeFlowDialogues;
          dialoguesByFilename = negativeFlowDialoguesByFilename;
        } else if (session.category === 'NEUTRAL') {
          dialogues = neutralFlowDialogues;
          dialoguesByFilename = neutralFlowDialoguesByFilename;
        }
        
        if (!dialogues || !dialoguesByFilename) {
          console.log('No dialogue mappings found for category:', session.category);
          return;
        }
        
        try {
          // Fetch audio data to get sequence number and fileName
          const audioResponse = await api.get(`/api/audio/${audioId}`);
          const audioData = audioResponse.data;
          
          console.log('=== AUDIO DATA ===');
          console.log('Sequence:', audioData.sequence);
          console.log('FileName:', audioData.fileName);
          console.log('Category:', audioData.category);
          console.log('FilePath:', audioData.filePath);
          console.log('Available dialogues for sequences:', Object.keys(dialogues));
          
          // Try to get dialogue by sequence number (most reliable)
          let dialogue = dialogues[audioData.sequence];
          
          console.log('Dialogue by sequence:', dialogue ? 'FOUND' : 'NOT FOUND');
          
          // If not found by sequence, try by filename
          if (!dialogue) {
            const audioFileName = audioData.fileName || audioPath.split('/').pop();
            console.log('Trying filename match:', audioFileName);
            dialogue = dialoguesByFilename[audioFileName];
            
            // If still not found, try partial match on filename
            if (!dialogue) {
              console.log('Trying partial filename match...');
              const matchingKey = Object.keys(dialoguesByFilename).find(key => {
                // Remove .mp3 for comparison
                const keyBase = key.replace('.mp3', '').toLowerCase();
                const fileBase = audioFileName.replace('.mp3', '').toLowerCase();
                
                // Check if filename contains key or vice versa
                return fileBase.includes(keyBase) || keyBase.includes(fileBase) ||
                       // Also check if sequence number matches
                       (key.match(/^(\d+)\./) && audioFileName.match(/^(\d+)\./) && 
                        key.match(/^(\d+)\./)[1] === audioFileName.match(/^(\d+)\./)[1]);
              });
              
              if (matchingKey) {
                dialogue = dialoguesByFilename[matchingKey];
                console.log('✓ Found dialogue by filename partial match:', matchingKey);
              }
            } else {
              console.log('✓ Found dialogue by exact filename match');
            }
          }
          
          // Only set dialogue if not already handled by Positive Flow, Neutral Flow, or Negative Flow logic above
          if (dialogue && session?.category !== 'POSITIVE' && session?.category !== 'NEUTRAL' && session?.category !== 'NEGATIVE') {
            console.log('✓✓✓ SETTING DIALOGUE ✓✓✓');
            console.log('Sequence:', audioData.sequence);
            console.log('Dialogue preview:', dialogue.substring(0, 50) + '...');
            dispatch(setDialogueText(dialogue));
            dispatch(setShowDialogue(true));
            // Set current dialogue sequence for animations
            setCurrentDialogueSequence(audioData.sequence);
          } else if (!dialogue) {
            console.error('✗✗✗ NO DIALOGUE FOUND ✗✗✗');
            console.error('Audio sequence:', audioData.sequence);
            console.error('Audio filename:', audioData.fileName);
            console.error('Available sequences:', Object.keys(dialogues).map(k => parseInt(k)).sort((a,b) => a-b));
            console.error('Available filenames:', Object.keys(dialoguesByFilename));
          }
        } catch (error) {
          console.error('Error fetching audio data:', error);
          // Fallback: try to match by filename from path
          const audioFileName = audioPath ? audioPath.split('/').pop() : '';
          console.log('Fallback: trying filename from path:', audioFileName);
          const dialogue = dialoguesByFilename[audioFileName];
          if (dialogue) {
            console.log('✓ Setting dialogue by filename fallback');
            dispatch(setDialogueText(dialogue));
            dispatch(setShowDialogue(true));
          } else {
            console.error('✗ Fallback also failed for:', audioFileName);
          }
        }
        console.log('=== END DEBUG ===');
      }
    });

    socket.on('audio_pause', () => {
      window.dispatchEvent(new Event('audio:pause'));
    });

    socket.on('audio_stop', () => {
      // Handle Positive Flow: After Audio 2, show first 4 images
      const lastSequence = lastAudioSequenceRef.current;
      
      console.log('=== AUDIO STOP EVENT RECEIVED ===');
      console.log('Session category:', session?.category);
      console.log('Last sequence from ref:', lastSequence);
      console.log('Positive flow state:', JSON.stringify(positiveFlowState, null, 2));
      console.log('Current audio sequence from state:', positiveFlowState.currentAudioSequence);
      
      // Use currentAudioSequence from state as fallback if ref is not set
      let sequenceToCheck = lastSequence;
      if (sequenceToCheck === null || sequenceToCheck === undefined) {
        if (session?.category === 'POSITIVE') {
          sequenceToCheck = positiveFlowState.currentAudioSequence;
        } else if (session?.category === 'NEUTRAL') {
          sequenceToCheck = neutralFlowState.currentAudioSequence;
        } else if (session?.category === 'NEGATIVE') {
          sequenceToCheck = negativeFlowState.currentAudioSequence;
        }
      }
      
      console.log('Sequence to check:', sequenceToCheck);
      console.log('Will show images?', 
        (session?.category === 'POSITIVE' && sequenceToCheck === 2) ||
        (session?.category === 'NEUTRAL' && sequenceToCheck === 1) ||
        (session?.category === 'NEGATIVE' && (sequenceToCheck === 1 || sequenceToCheck === 2))
      );
      
      if (session?.category === 'POSITIVE' && sequenceToCheck === 2) {
        console.log('✓✓✓ Positive Flow: Audio 2 ended - Showing first 4 images for 10 seconds ✓✓✓');
        console.log('  - Only bg1 background audio should be playing during image display');
        console.log('  - Setting imageType: POS-EMOTION');
        console.log('  - Setting showImages: true');
        console.log('  - Setting fadeIn: true');
        console.log('  - Setting showFirstImages: true');
        
        dispatch(setImageType('POS-EMOTION'));
        dispatch(setShowImages(true));
        dispatch(setFadeIn(true));
        setPositiveFlowState(prev => ({
          ...prev,
          showFirstImages: true,
        }));
        
        console.log('✓✓✓ Images should now be visible! ✓✓✓');
        
        // Hide images after 10 seconds and play audio 3
        setTimeout(async () => {
          console.log('Positive Flow: First 4 images display completed - Playing audio 3');
          dispatch(setShowImages(false));
          setPositiveFlowState(prev => ({
            ...prev,
            showFirstImages: false,
          }));
          
          // Fetch and play audio 3
          try {
            const audioResponse = await api.get('/api/audio', {
              params: {
                category: 'POSITIVE'
              }
            });
            
            // Find audio with sequence 3
            const audio3 = audioResponse.data.find(audio => audio.sequence === 3);
            
            if (audio3) {
              console.log('Playing audio 3:', audio3.fileName);
              if (socket) {
                socket.emit('audio_play', {
                  audioPath: audio3.filePath,
                  audioId: audio3._id
                });
              }
            } else {
              console.error('Audio 3 not found in database. Available sequences:', 
                audioResponse.data.map(a => a.sequence).sort((a, b) => a - b));
            }
          } catch (error) {
            console.error('Error fetching audio 3:', error);
          }
          }, 10000); // 10 seconds
      } else if (session?.category === 'POSITIVE' && sequenceToCheck === 6) {
        // Audio 6: Show images AFTER dialogue completes
        console.log('✓✓✓ Positive Flow: Audio 6 ended - Hiding dialogue and showing next 4 images ✓✓✓');
        console.log('  - Hiding dialogue');
        console.log('  - Setting imageType: POS-EMOTION');
        console.log('  - Setting showImages: true');
        console.log('  - Setting fadeIn: true');
        console.log('  - Setting showSecondImages: true');
        
        // Hide dialogue first
        dispatch(setShowDialogue(false));
        
        // Then show images
        dispatch(setImageType('POS-EMOTION'));
        dispatch(setShowImages(true));
        dispatch(setFadeIn(true));
        setPositiveFlowState(prev => ({
          ...prev,
          showSecondImages: true,
        }));
        
        console.log('✓✓✓ Images should now be visible! ✓✓✓');
      } else if (session?.category === 'NEUTRAL' && sequenceToCheck === 1) {
        console.log('✓✓✓ Neutral Flow: Audio 1 ended - Showing first 4 neutral images for 10 seconds ✓✓✓');
        console.log('  - Setting imageType: NEG-EMOTION');
        console.log('  - Setting showImages: true');
        console.log('  - Setting fadeIn: true');
        console.log('  - Setting showNeutralImages: true');
        
        dispatch(setImageType('NEG-EMOTION'));
        dispatch(setShowImages(true));
        dispatch(setFadeIn(true));
        dispatch(setShowParticles(true));
        setNeutralFlowState(prev => ({
          ...prev,
          showNeutralImages: true,
        }));
        
        console.log('✓✓✓ Neutral images should now be visible! ✓✓✓');
        
        // Hide images after 10 seconds and play audio 2
        setTimeout(async () => {
          console.log('Neutral Flow: First 4 neutral images display completed - Playing audio 2');
          dispatch(setShowImages(false));
          setNeutralFlowState(prev => ({
            ...prev,
            showNeutralImages: false,
          }));
          
          // Fetch and play audio 2
          try {
            const audioResponse = await api.get('/api/audio', {
              params: {
                category: 'NEUTRAL'
              }
            });
            
            // Find audio with sequence 2
            const audio2 = audioResponse.data.find(audio => audio.sequence === 2);
            
            if (audio2) {
              console.log('Playing audio 2:', audio2.fileName);
              if (socket) {
                socket.emit('audio_play', {
                  audioPath: audio2.filePath,
                  audioId: audio2._id
                });
              }
            } else {
              console.error('Audio 2 not found in database. Available sequences:', 
                audioResponse.data.map(a => a.sequence).sort((a, b) => a - b));
            }
          } catch (error) {
            console.error('Error fetching audio 2:', error);
          }
        }, 10000); // 10 seconds
      } else if (session?.category === 'NEUTRAL' && sequenceToCheck === 3) {
        // Audio 3: Show images AFTER dialogue completes
        console.log('✓✓✓ Neutral Flow: Audio 3 ended - Hiding dialogue and showing 4 positive images ✓✓✓');
        console.log('  - Session category:', session?.category, '(should be NEUTRAL)');
        console.log('  - Session ageGroup:', session?.ageGroup, '-> mapped:', mapAgeGroup(session?.ageGroup));
        console.log('  - Hiding dialogue');
        console.log('  - Setting imageType: POS-EMOTION');
        console.log('  - Setting showImages: true');
        console.log('  - Setting fadeIn: true');
        console.log('  - Setting showPositiveImages: true');
        
        // Hide dialogue first
        dispatch(setShowDialogue(false));
        
        // Set state to show positive images
        setNeutralFlowState(prev => ({
          ...prev,
          showNeutralImages: false,
          showPositiveImages: true,
        }));
        
        // Set imageType and show images
        dispatch(setImageType('POS-EMOTION'));
        setTimeout(() => {
          console.log('  - Now showing images with POS-EMOTION type (fade in/out effect enabled)');
          dispatch(setShowImages(true));
          dispatch(setFadeIn(true));
          // No light/particle animations
          dispatch(setShowLightAnimation(false));
          dispatch(setShowParticles(false));
        }, 250);
        
        console.log('✓✓✓ Positive images should now be visible! ✓✓✓');
      } else if (session?.category === 'NEGATIVE' && sequenceToCheck === 1) {
        console.log('✓✓✓ Negative Flow: Audio 1 ended - Showing first 4 negative images for 10 seconds ✓✓✓');
        console.log('  - Setting imageType: NEG-EMOTION');
        console.log('  - Setting showImages: true');
        console.log('  - Setting fadeIn: true');
        console.log('  - Setting showNegativeImages: true');
        
        dispatch(setImageType('NEG-EMOTION'));
        dispatch(setShowImages(true));
        dispatch(setFadeIn(true));
        setNegativeFlowState(prev => ({
          ...prev,
          showNegativeImages: true,
        }));
        
        console.log('✓✓✓ Negative images should now be visible! ✓✓✓');
        
        // Hide images after 10 seconds and play audio 2
        setTimeout(async () => {
          console.log('Negative Flow: First 4 negative images display completed - Playing audio 2');
          dispatch(setShowImages(false));
          setNegativeFlowState(prev => ({
            ...prev,
            showNegativeImages: false,
          }));
          
          // Fetch and play audio 2
          try {
            const audioResponse = await api.get('/api/audio', {
              params: {
                category: 'NEGATIVE'
              }
            });
            
            // Find audio with sequence 2
            const audio2 = audioResponse.data.find(audio => audio.sequence === 2);
            
            if (audio2) {
              console.log('Playing audio 2:', audio2.fileName);
              if (socket) {
                socket.emit('audio_play', {
                  audioPath: audio2.filePath,
                  audioId: audio2._id
                });
              }
            } else {
              console.error('Audio 2 not found in database. Available sequences:', 
                audioResponse.data.map(a => a.sequence).sort((a, b) => a - b));
            }
          } catch (error) {
            console.error('Error fetching audio 2:', error);
          }
        }, 10000); // 10 seconds
      } else if (session?.category === 'NEGATIVE' && sequenceToCheck === 2) {
        console.log('✓✓✓ Negative Flow: Audio 2 ended - Showing first 4 positive images for 10 seconds ✓✓✓');
        console.log('  - Setting imageType: POS-EMOTION');
        console.log('  - Setting showImages: true');
        console.log('  - Setting fadeIn: true');
        console.log('  - Setting showPositiveImages: true');
        
        dispatch(setImageType('POS-EMOTION'));
        dispatch(setShowImages(true));
        dispatch(setFadeIn(true));
        setNegativeFlowState(prev => ({
          ...prev,
          showPositiveImages: true,
        }));
        
        console.log('✓✓✓ Positive images should now be visible! ✓✓✓');
        
        // Hide images after 10 seconds and play audio 3
        setTimeout(async () => {
          console.log('Negative Flow: First 4 positive images display completed - Playing audio 3');
          dispatch(setShowImages(false));
          setNegativeFlowState(prev => ({
            ...prev,
            showPositiveImages: false,
          }));
          
          // Fetch and play audio 3
          try {
            const audioResponse = await api.get('/api/audio', {
              params: {
                category: 'NEGATIVE'
              }
            });
            
            // Find audio with sequence 3
            const audio3 = audioResponse.data.find(audio => audio.sequence === 3);
            
            if (audio3) {
              console.log('Playing audio 3:', audio3.fileName);
              if (socket) {
                socket.emit('audio_play', {
                  audioPath: audio3.filePath,
                  audioId: audio3._id
                });
              }
            } else {
              console.error('Audio 3 not found in database. Available sequences:', 
                audioResponse.data.map(a => a.sequence).sort((a, b) => a - b));
            }
          } catch (error) {
            console.error('Error fetching audio 3:', error);
          }
        }, 10000); // 10 seconds
      } else {
        console.log('✗ Condition not met for showing images');
        console.log('  - Category is POSITIVE?', session?.category === 'POSITIVE');
        console.log('  - Category is NEUTRAL?', session?.category === 'NEUTRAL');
        console.log('  - Category is NEGATIVE?', session?.category === 'NEGATIVE');
        console.log('  - Sequence:', sequenceToCheck);
      }
      console.log('=== END AUDIO STOP DEBUG ===');
      
      dispatch(clearCurrentAudio());
      // Don't hide dialogue on stop for Positive Flow sequences 3-9, Neutral Flow sequences 2-9, or Negative Flow sequences 2-9
      if (session?.category === 'POSITIVE' && lastSequence && lastSequence >= 3 && lastSequence <= 9) {
        // Keep dialogue for Positive Flow sequences 3-9
      } else if (session?.category === 'NEUTRAL' && lastSequence && lastSequence >= 2 && lastSequence <= 9) {
        // Keep dialogue for Neutral Flow sequences 2-9
      } else if (session?.category === 'NEGATIVE' && lastSequence && lastSequence >= 2 && lastSequence <= 9) {
        // Keep dialogue for Negative Flow sequences 2-9
      } else {
        dispatch(setShowDialogue(false));
      }
      window.dispatchEvent(new Event('audio:stop'));
    });

    // Handle cue points
    socket.on('cue_trigger', ({ cuePoint, data }) => {
      console.log('Mirror cue triggered:', cuePoint, data);
      
      // Handle positive flow specifically - DISABLED: Positive Flow is now handled in audio_play
      // We ignore cue triggers for Positive Flow to prevent old animations from showing
      if (session?.category === 'POSITIVE') {
        console.log('Positive Flow: Ignoring cue trigger - handled in audio_play');
        return; // Don't process cue triggers for Positive Flow
      } else if (session?.category === 'NEUTRAL') {
        // Handle neutral flow specifically - DISABLED: Neutral Flow is now handled in audio_play
        // We ignore cue triggers for Neutral Flow to prevent old animations from showing
        console.log('Neutral Flow: Ignoring cue trigger - handled in audio_play');
        return; // Don't process cue triggers for Neutral Flow
      } else if (session?.category === 'NEGATIVE') {
        // Handle negative flow specifically - DISABLED: Negative Flow is now handled in audio_play
        // We ignore cue triggers for Negative Flow to prevent old animations from showing
        console.log('Negative Flow: Ignoring cue trigger - handled in audio_play');
        return; // Don't process cue triggers for Negative Flow
      } else {
        // Handle other flows (negative, neutral)
        switch (cuePoint) {
          case 'MIRROR_FADE':
            console.log('Mirror fading...');
            dispatch(setFadeIn(true));
            dispatch(setShowImages(false));
            dispatch(setShowMirrorReflection(true));
            dispatch(setShowLightAnimation(false));
            dispatch(setShowParticles(false));
            break;
          case 'SHOW_NEG_IMAGES':
            console.log('Showing negative images...');
            dispatch(setImageType('NEG-EMOTION'));
            dispatch(setShowImages(true));
            dispatch(setFadeIn(true));
            dispatch(setShowMirrorReflection(false));
            dispatch(setShowLightAnimation(false));
            dispatch(setShowParticles(true));
            break;
          case 'SHOW_POS_IMAGES':
            console.log('Showing positive images...', data);
            dispatch(setImageType('POS-EMOTION'));
            dispatch(setShowImages(true));
            dispatch(setFadeIn(true));
            dispatch(setShowMirrorReflection(false));
            dispatch(setShowLightAnimation(true));
            dispatch(setLightIntensity(0.6));
            dispatch(setShowParticles(true));
            break;
          case 'ENDING':
            console.log('Showing ending images...');
            dispatch(setImageType('ENDING'));
            dispatch(setShowImages(true));
            dispatch(setFadeIn(true));
            dispatch(setShowMirrorReflection(false));
            dispatch(setShowLightAnimation(true));
            dispatch(setLightIntensity(0.4));
            dispatch(setShowParticles(true));
            break;
          default:
            break;
        }
      }
    });

    // Handle session reset
    socket.on('session_reset', () => {
      console.log('Session reset received - resetting mirror screen');
      dispatch(resetMirrorState());
      setCurrentDialogueSequence(null);
      lastAudioSequenceRef.current = null;
      setPositiveFlowState({
        currentAudioSequence: null,
        showCircularGlow: false,
        showFirstImages: false,
        showSecondImages: false,
        circularGlowDuration: 0,
      });
      setNeutralFlowState({
        currentAudioSequence: null,
        showNeutralImages: false,
        showPositiveImages: false,
      });
      setNegativeFlowState({
        currentAudioSequence: null,
        showNegativeImages: false,
        showPositiveImages: false,
      });
    });

    // Handle phase changes
    socket.on('phase_changed', ({ phase }) => {
      console.log('Phase changed on mirror screen:', phase, 'Category:', session?.category);
      
      if (phase === 'INIT' || phase === 'AGE_SELECTION') {
        // Reset mirror screen state when session resets
        dispatch(resetMirrorState());
        setCurrentDialogueSequence(null);
      } else if (phase === 'CATEGORY_FLOW' && session?.category === 'POSITIVE') {
        // Positive flow started - prepare for mirror phase
        console.log('Positive flow started - preparing mirror screen');
        dispatch(setShowImages(false));
        dispatch(setShowMirrorReflection(false));
        dispatch(setShowLightAnimation(false));
        dispatch(setShowParticles(false));
        dispatch(setFadeIn(false));
        dispatch(setShowDialogue(false));
        lastAudioSequenceRef.current = null;
        setPositiveFlowState({
          currentAudioSequence: null,
          showCircularGlow: false,
          showFirstImages: false,
          showSecondImages: false,
          circularGlowDuration: 0,
        });
      } else if (phase === 'CATEGORY_FLOW' && session?.category === 'NEUTRAL') {
        // Neutral flow started - prepare for mirror phase
        console.log('Neutral flow started - preparing mirror screen');
        dispatch(setShowImages(false));
        dispatch(setShowMirrorReflection(false));
        dispatch(setShowLightAnimation(false));
        dispatch(setShowParticles(false));
        dispatch(setFadeIn(false));
        dispatch(setShowDialogue(false));
        lastAudioSequenceRef.current = null;
        setNeutralFlowState({
          currentAudioSequence: null,
          showNeutralImages: false,
          showPositiveImages: false,
        });
      } else if (phase === 'CATEGORY_FLOW' && session?.category === 'NEGATIVE') {
        // Negative flow started - prepare for mirror phase
        console.log('Negative flow started - preparing mirror screen');
        dispatch(setShowImages(false));
        dispatch(setShowMirrorReflection(false));
        dispatch(setShowLightAnimation(false));
        dispatch(setShowParticles(false));
        dispatch(setFadeIn(false));
        dispatch(setShowDialogue(false));
        lastAudioSequenceRef.current = null;
        setNegativeFlowState({
          currentAudioSequence: null,
          showNegativeImages: false,
          showPositiveImages: false,
        });
      } else if (phase === 'PRAN_SELECTION' && session?.category === 'POSITIVE') {
        // Pran selection in positive flow - handled by audio sequence, don't enable old animations
        console.log('Pran selection in positive flow - handled by audio sequence');
        // Don't enable old animations - they're handled in audio_play handler
      } else if (phase === 'ENDING' && session?.category === 'POSITIVE') {
        // Ending phase in positive flow - handled by audio sequence, don't enable old animations
        console.log('Ending phase in positive flow - handled by audio sequence');
        // Don't enable old animations - they're handled in audio_play handler
      }
    });

    return () => {
      socket.off('audio_play');
      socket.off('audio_pause');
      socket.off('audio_stop');
      socket.off('cue_trigger');
      socket.off('phase_changed');
      socket.off('session_reset');
    };
  }, [socket, session, dispatch]);

  if (!connected) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
        <div className="text-2xl">Connecting...</div>
      </div>
    );
  }

  // Determine light color based on emotion type - all yellow/gold (removed blue)
  const getLightColor = () => {
    if (imageType === 'POS-EMOTION') {
      return 'rgba(255, 255, 200, 0.3)'; // Warm golden light
    } else if (imageType === 'NEG-EMOTION') {
      return 'rgba(255, 220, 100, 0.2)'; // Yellow light (removed blue)
    } else if (imageType === 'ENDING') {
      return 'rgba(255, 240, 200, 0.25)'; // Soft warm light
    }
    return 'rgba(255, 220, 100, 0.2)'; // Yellow light (removed blue)
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Base background - pure black */}
      <div className="absolute inset-0 bg-black z-0" />
      
      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      
      {/* Main image display - base layer (no z-index) */}
      {showImages && session?.category && session?.ageGroup && imageType ? (() => {
        // Determine imageRange for Positive Flow and Neutral Flow
        // Note: displayOrder is 0-indexed (0, 1, 2, 3, 4, 5, 6, 7)
        let imageRange = null;
        if (session?.category === 'POSITIVE' && positiveFlowState.showFirstImages) {
          imageRange = { start: 0, end: 3 }; // First 4 images: displayOrder 0, 1, 2, 3
          console.log('✓ ImageDisplay: Rendering first 4 images (displayOrder 0-3)');
          console.log('  - showImages:', showImages);
          console.log('  - category:', session?.category);
          console.log('  - ageGroup:', session?.ageGroup);
          console.log('  - imageType:', imageType);
          console.log('  - showFirstImages:', positiveFlowState.showFirstImages);
        } else if (session?.category === 'POSITIVE' && positiveFlowState.showSecondImages) {
          imageRange = { start: 4, end: 7 }; // Next 4 images: displayOrder 4, 5, 6, 7
          console.log('ImageDisplay: Using next 4 images (displayOrder 4-7)');
        } else if (session?.category === 'NEUTRAL' && neutralFlowState.showNeutralImages) {
          imageRange = { start: 0, end: 3 }; // First 4 neutral images: displayOrder 0, 1, 2, 3
          console.log('✓ ImageDisplay: Rendering first 4 neutral images (displayOrder 0-3)');
          console.log('  - showImages:', showImages);
          console.log('  - category:', session?.category);
          console.log('  - ageGroup:', session?.ageGroup);
          console.log('  - imageType:', imageType);
          console.log('  - showNeutralImages:', neutralFlowState.showNeutralImages);
        } else if (session?.category === 'NEUTRAL' && neutralFlowState.showPositiveImages) {
          imageRange = { start: 0, end: 3 }; // First 4 positive images: displayOrder 0, 1, 2, 3
          console.log('✓✓✓ ImageDisplay: Rendering first 4 POSITIVE images for neutral flow (displayOrder 0-3) ✓✓✓');
          console.log('  - showImages:', showImages);
          console.log('  - category:', session?.category, '(should be NEUTRAL)');
          console.log('  - ageGroup:', session?.ageGroup, '-> mapped:', mapAgeGroup(session?.ageGroup));
          console.log('  - imageType:', imageType, '(should be POS-EMOTION)');
          console.log('  - showPositiveImages:', neutralFlowState.showPositiveImages);
          console.log('  - imageRange:', imageRange);
          if (imageType !== 'POS-EMOTION') {
            console.error('⚠️ WARNING: imageType is not POS-EMOTION! It is:', imageType);
          }
        } else if (session?.category === 'NEGATIVE' && negativeFlowState.showNegativeImages) {
          imageRange = { start: 0, end: 3 }; // First 4 negative images: displayOrder 0, 1, 2, 3
          console.log('✓ ImageDisplay: Rendering first 4 negative images for negative flow (displayOrder 0-3)');
          console.log('  - showImages:', showImages);
          console.log('  - category:', session?.category, '(should be NEGATIVE)');
          console.log('  - ageGroup:', session?.ageGroup, '-> mapped:', mapAgeGroup(session?.ageGroup));
          console.log('  - imageType:', imageType, '(should be NEG-EMOTION)');
          console.log('  - showNegativeImages:', negativeFlowState.showNegativeImages);
          console.log('  - imageRange:', imageRange);
          if (imageType !== 'NEG-EMOTION') {
            console.error('⚠️ WARNING: imageType is not NEG-EMOTION! It is:', imageType);
          }
        } else if (session?.category === 'NEGATIVE' && negativeFlowState.showPositiveImages) {
          imageRange = { start: 0, end: 3 }; // First 4 positive images: displayOrder 0, 1, 2, 3
          console.log('✓✓✓ ImageDisplay: Rendering first 4 POSITIVE images for negative flow (displayOrder 0-3) ✓✓✓');
          console.log('  - showImages:', showImages);
          console.log('  - category:', session?.category, '(should be NEGATIVE)');
          console.log('  - ageGroup:', session?.ageGroup, '-> mapped:', mapAgeGroup(session?.ageGroup));
          console.log('  - imageType:', imageType, '(should be POS-EMOTION)');
          console.log('  - showPositiveImages:', negativeFlowState.showPositiveImages);
          console.log('  - imageRange:', imageRange);
          if (imageType !== 'POS-EMOTION') {
            console.error('⚠️ WARNING: imageType is not POS-EMOTION! It is:', imageType);
          }
        } else {
          console.log('ImageDisplay: No imageRange set.');
          if (session?.category === 'POSITIVE') {
            console.log('  - showFirstImages:', positiveFlowState.showFirstImages, 'showSecondImages:', positiveFlowState.showSecondImages);
          } else if (session?.category === 'NEUTRAL') {
            console.log('  - showNeutralImages:', neutralFlowState.showNeutralImages, 'showPositiveImages:', neutralFlowState.showPositiveImages);
          } else if (session?.category === 'NEGATIVE') {
            console.log('  - showNegativeImages:', negativeFlowState.showNegativeImages, 'showPositiveImages:', negativeFlowState.showPositiveImages);
          }
        }
        
        // Log the actual values being passed to ImageDisplay
        const mappedAgeGroup = mapAgeGroup(session.ageGroup);
        const imageKey = `${session.category}-${imageType}-${session.ageGroup}-${
          session.category === 'NEGATIVE' 
            ? (negativeFlowState.showPositiveImages ? 'pos' : negativeFlowState.showNegativeImages ? 'neg' : 'none')
            : session.category === 'NEUTRAL'
            ? (neutralFlowState.showPositiveImages ? 'pos' : neutralFlowState.showNeutralImages ? 'neg' : 'none')
            : 'none'
        }-${imageRange ? `${imageRange.start}-${imageRange.end}` : 'all'}`;
        console.log('📸 ImageDisplay Props:', {
          category: session.category,
          ageGroup: mappedAgeGroup,
          type: imageType,
          imageRange: imageRange,
          showPositiveImages: session.category === 'NEGATIVE' ? negativeFlowState.showPositiveImages : neutralFlowState.showPositiveImages,
          showNegativeImages: session.category === 'NEGATIVE' ? negativeFlowState.showNegativeImages : false,
          showNeutralImages: session.category === 'NEUTRAL' ? neutralFlowState.showNeutralImages : false,
          key: imageKey
        });
        
        // Warn if imageType is wrong for neutral flow positive images
        if (session.category === 'NEUTRAL' && neutralFlowState.showPositiveImages && imageType !== 'POS-EMOTION') {
          console.error('⚠️⚠️⚠️ ERROR: imageType should be POS-EMOTION but is:', imageType);
        }
        
        // Warn if imageType is wrong for negative flow images
        if (session.category === 'NEGATIVE' && negativeFlowState.showNegativeImages && imageType !== 'NEG-EMOTION') {
          console.error('⚠️⚠️⚠️ ERROR: imageType should be NEG-EMOTION but is:', imageType);
        }
        if (session.category === 'NEGATIVE' && negativeFlowState.showPositiveImages && imageType !== 'POS-EMOTION') {
          console.error('⚠️⚠️⚠️ ERROR: imageType should be POS-EMOTION but is:', imageType);
        }
        
        return (
          <div className="absolute inset-0 z-10">
            <ImageDisplay
              key={imageKey}
              category={session.category}
              ageGroup={mappedAgeGroup}
              type={imageType}
              fadeIn={fadeIn}
              imageRange={imageRange}
            />
          </div>
        );
      })() : (
        <div 
          className={`absolute inset-0 transition-opacity duration-2000 z-10 bg-black`}
        />
      )}


      {/* Circular Glow Animation for Positive Flow Audio 1 and Audio 7 */}
      {/* Only show when NOT displaying images */}
      {session?.category === 'POSITIVE' && 
       positiveFlowState.showCircularGlow && 
       !showImages && (
        <CircularGlowAnimation
          show={positiveFlowState.showCircularGlow}
          duration={positiveFlowState.circularGlowDuration}
          color="rgba(255, 220, 100, 0.6)"
        />
      )}

      {/* Animation during dialogue - only show when NOT displaying images */}
      {showDialogue && 
       !showImages && (
        <CircularGlowAnimation
          show={showDialogue}
          duration={30000} // Long duration to keep it visible during dialogue
          color="rgba(255, 220, 100, 0.6)"
        />
      )}
      
      {/* Dialogue display - shown during all flows - highest z-index for text (z-50) */}
      <DialogueDisplay
        text={dialogueText}
        show={showDialogue}
      />

      {/* Mirror reflection effect - hidden for Positive Flow */}
      {session?.category !== 'POSITIVE' && (
        <MirrorReflection 
          show={showMirrorReflection}
          onComplete={() => {
            // Optional: callback when mirror effect completes
          }}
        />
      )}

      {/* Light animation - hidden for Positive Flow */}
      {session?.category !== 'POSITIVE' && (
        <LightAnimation 
          show={showLightAnimation}
          intensity={lightIntensity}
          color={getLightColor()}
        />
      )}

      {/* Particle effects - hidden for Positive Flow */}
      {session?.category !== 'POSITIVE' && (
        <ParticleEffect 
          show={showParticles}
          type={imageType === 'POS-EMOTION' ? 'gentle' : 'gentle'}
          color={getLightColor()}
        />
      )}

      {/* Celebration Animation - Enhanced for mirror screen */}
      {showCelebration && (
        <CelebrationAnimation
          onComplete={() => {
            // Celebration completes - handled by table screen
          }}
        />
      )}

      {/* Mirror screen doesn't play audio - only table screen plays audio
          But we keep AudioPlayer for visual sync if needed in future */}
      {currentAudio && (
        <AudioPlayer
          audioPath={currentAudio}
          onEnded={() => {
            // Handle audio end (not used on mirror screen)
          }}
          forcePlay={false}
          autoPlay={false}
        />
      )}
    </div>
  );
};

export default MirrorScreen;
