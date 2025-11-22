import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import getCdnUrl from '../lib/cdnUtils';

const ImageDisplay = ({ category, ageGroup, type, fadeIn = false, imageRange = null }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0);
  const containerRef = useRef(null);
  const cycleTimeoutRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Preload images for smooth transitions
  useEffect(() => {
    if (images.length === 0) return;

    images.forEach((img) => {
      // Use CDN URL
      const imageUrl = getCdnUrl(img.filePath);
      const preloadImg = new Image();
      preloadImg.src = imageUrl;
    });
  }, [images]);

  useEffect(() => {
    if (!category || !ageGroup || !type) {
      console.log('ImageDisplay: Missing required props', { category, ageGroup, type });
      return;
    }

    const fetchImages = async () => {
      try {
        setLoading(true);
        console.log('ImageDisplay: Fetching images with params:', { category, ageGroup, type, imageRange });
        const response = await api.get('/api/images', {
          params: { category, ageGroup, type }
        });
        console.log('ImageDisplay: Received images from API:', response.data.length);
        let sortedImages = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
        
        // Filter by imageRange if provided (e.g., { start: 1, end: 4 } for first 4 images)
        if (imageRange && imageRange.start !== undefined && imageRange.end !== undefined) {
          const beforeFilter = sortedImages.length;
          sortedImages = sortedImages.filter(img => {
            const order = img.displayOrder || 0;
            return order >= imageRange.start && order <= imageRange.end;
          });
          console.log(`ImageDisplay: Filtered from ${beforeFilter} to ${sortedImages.length} images (displayOrder ${imageRange.start}-${imageRange.end})`);
        } else {
          console.log(`ImageDisplay: No imageRange filter, showing all ${sortedImages.length} images`);
        }
        
        setImages(sortedImages);
        setCurrentIndex(0);
        setScale(1);
        setOpacity(0);
        
        if (sortedImages.length === 0) {
          console.warn('ImageDisplay: No images found! Check database for:', { category, ageGroup, type });
        }
      } catch (error) {
        console.error('ImageDisplay: Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [category, ageGroup, type, imageRange]);

  // Animation cycle: Fade In → Hold → Fade Out → Next Image
  // For 4 images in 10 seconds: 2.5 seconds per image
  useEffect(() => {
    if (!fade || images.length === 0) {
      // Clear any running animations
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      return;
    }

    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    // Calculate timing: 2.5 seconds per image
    // - Fade in: 0.5s
    // - Hold: 1.5s
    // - Fade out: 0.5s
    const FADE_IN_DURATION = 500;
    const HOLD_DURATION = 1500;
    const FADE_OUT_DURATION = 500;
    const TOTAL_DURATION = FADE_IN_DURATION + HOLD_DURATION + FADE_OUT_DURATION; // 2.5 seconds

    const runAnimationCycle = () => {
      // Step 1: Fade in (0 → 1) over 0.5 seconds
      setOpacity(0);
      setScale(1);
      
      const t1 = setTimeout(() => {
        setOpacity(1);
      }, 50); // Start fade in immediately
      timeoutsRef.current.push(t1);

      // Step 2: Hold at full opacity for 1.5 seconds
      const t2 = setTimeout(() => {
        // Step 3: Fade out (1 → 0) over 0.5 seconds
        setOpacity(0);
        
        // Step 4: Switch to next image after fade out
        const t3 = setTimeout(() => {
          if (images.length > 1) {
            setCurrentIndex((prev) => {
              const next = (prev + 1) % images.length;
              return next;
            });
            setScale(1);
            // Restart cycle with new image
            const t4 = setTimeout(() => {
              runAnimationCycle();
            }, 50);
            timeoutsRef.current.push(t4);
          } else {
            // Single image: restart cycle
            const t4 = setTimeout(() => {
              runAnimationCycle();
            }, 50);
            timeoutsRef.current.push(t4);
          }
        }, FADE_OUT_DURATION);
        timeoutsRef.current.push(t3);
      }, FADE_IN_DURATION + HOLD_DURATION);
      timeoutsRef.current.push(t2);
    };

    // Start the cycle
    runAnimationCycle();

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, [fade, images.length]);

  useEffect(() => {
    if (fadeIn && images.length > 0) {
      // Delay fade in slightly for smoother effect
      const timeout = setTimeout(() => {
        setFade(true);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setFade(false);
      // Clear timeouts when fading out
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
    }
  }, [fadeIn, images.length]);

  // Restart animation when image index changes (for smooth transitions)
  useEffect(() => {
    if (fade && images.length > 0 && currentIndex >= 0) {
      // Reset state for new image
      setOpacity(1);
      setScale(1);
    }
  }, [currentIndex, fade, images.length]);

  if (loading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return <div className="w-full h-full bg-black" />;
  }

  const currentImage = images[currentIndex];

  // Construct full URL using CDN
  const getImageUrl = (img) => {
    if (!img) return '';
    return getCdnUrl(img.filePath);
  };

  const currentImageUrl = getImageUrl(currentImage);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
    >
      {/* Current Image with Zoom Animation */}
      {currentImage && (
        <img
          key={`image-${currentIndex}`}
          src={currentImageUrl}
          alt={`${category} ${ageGroup} ${type} - ${currentIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: opacity,
            transform: `scale(${scale}) translateZ(0)`,
            transition: `
              opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)
            `,
            transformOrigin: 'center center',
            imageRendering: 'high-quality',
            WebkitImageRendering: 'high-quality',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
            filter: 'contrast(1.05) brightness(1.02)',
          }}
          loading="eager"
          decoding="async"
          onError={(e) => {
            console.error('Image load error:', currentImageUrl);
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Very subtle vignette overlay for depth - reduced opacity for clarity */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-black/5" />
      
      {/* Minimal edge glow - reduced for clarity */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.03)',
        }}
      />
    </div>
  );
};

export default ImageDisplay;
