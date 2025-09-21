import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  PictureInPicture2,
  Settings,
  Download,
  RotateCcw
} from 'lucide-react';

const EnhancedVideoPlayer = ({ 
  src, 
  title = "Training Video",
  poster = "",
  className = "",
  onTimeUpdate,
  onEnded,
  autoPlay = false,
  controls = true
}) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check for Picture-in-Picture support
    setIsPiPSupported('requestPictureInPicture' in video);
    
    // Request notification permission for PiP alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

  const handlePiPEnter = () => {
    setIsPiPActive(true);
    console.log('🎥 Picture-in-Picture activated! Look for the floating video window.');
    
    // Show browser notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Picture-in-Picture Active', {
        body: 'Your video is now playing in a floating window!',
        icon: '/favicon.ico',
        tag: 'pip-active'
      });
    }
  };

  const handlePiPLeave = () => {
    setIsPiPActive(false);
    console.log('🎥 Picture-in-Picture deactivated.');
  };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('enterpictureinpicture', handlePiPEnter);
    video.addEventListener('leavepictureinpicture', handlePiPLeave);
    video.addEventListener('volumechange', handleVolumeChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('enterpictureinpicture', handlePiPEnter);
      video.removeEventListener('leavepictureinpicture', handlePiPLeave);
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported) return;

    try {
      if (isPiPActive) {
        await document.exitPictureInPicture();
      } else {
        // Ensure video is playing before requesting PiP
        if (video.paused) {
          await video.play();
          setIsPlaying(true);
        }
        
        const pipWindow = await video.requestPictureInPicture();
        
        // Log success for debugging
        console.log('PiP window created:', pipWindow);
        
        // Delay positioning to ensure window is fully created
        setTimeout(() => {
          try {
            // Get current screen dimensions
            const screenWidth = window.screen.availWidth || window.innerWidth;
            const screenHeight = window.screen.availHeight || window.innerHeight;
            
            // Set reasonable PiP window size (16:9 aspect ratio)
            const pipWidth = Math.min(400, screenWidth * 0.25);
            const pipHeight = Math.round(pipWidth * 9 / 16);
            
            console.log(`Positioning PiP window: ${pipWidth}x${pipHeight} on screen ${screenWidth}x${screenHeight}`);
            
            // Position in bottom-right corner with margins
            const x = screenWidth - pipWidth - 30;
            const y = screenHeight - pipHeight - 120; // Extra margin for taskbar
            
            // Some browsers support window manipulation
            if (typeof pipWindow.resizeTo === 'function') {
              pipWindow.resizeTo(pipWidth, pipHeight);
            }
            if (typeof pipWindow.moveTo === 'function') {
              pipWindow.moveTo(Math.max(0, x), Math.max(0, y));
            }
            
            console.log(`PiP window positioned at: ${x}, ${y}`);
            
          } catch (positionError) {
            console.log('PiP positioning not supported:', positionError.message);
          }
        }, 100);
        
        console.log('Picture-in-Picture activated successfully');
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
      
      let errorMessage = 'Picture-in-Picture failed. ';
      
      if (error.name === 'InvalidStateError') {
        errorMessage += 'Make sure the video is playing first, then try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Your browser does not support Picture-in-Picture for this video.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage += 'Picture-in-Picture was blocked. Check your browser settings.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      errorMessage += '\n\nTroubleshooting tips:\n• Make sure the video is playing\n• Try refreshing the page\n• Check if other tabs have PiP active';
      
      alert(errorMessage);
    }
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(true)}
      />

      {/* Custom Controls Overlay */}
      {controls && (
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          
          {/* Play/Pause Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 ml-1" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Progress Bar */}
            <div className="relative">
              <div 
                ref={progressRef}
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-red-600 rounded-full relative transition-all"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full transform scale-0 hover:scale-100 transition-transform"></div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => skipTime(-10)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Skip back 10s"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Skip forward 10s"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <span className="text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Playback Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-sm font-medium"
                    title="Playback speed"
                  >
                    {playbackRate}x
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-24">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-left px-3 py-1 rounded hover:bg-white/20 transition-colors text-sm ${
                            playbackRate === rate ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={downloadVideo}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Download video"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Picture-in-Picture Button */}
                {isPiPSupported && (
                  <div className="relative">
                    <button
                      onClick={togglePictureInPicture}
                      className={`p-2 hover:bg-white/20 rounded-full transition-all duration-200 ${
                        isPiPActive 
                          ? 'text-red-400 bg-red-400/20 ring-2 ring-red-400/50' 
                          : 'text-white hover:text-red-400'
                      }`}
                      title={isPiPActive ? "Exit Picture-in-Picture (Look for floating window)" : "Picture-in-Picture"}
                    >
                      <PictureInPicture2 className="h-4 w-4" />
                    </button>
                    
                    {isPiPActive && (
                      <div className="absolute -top-12 -right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap animate-pulse">
                        Look for floating window!
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Video Title */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">{title}</span>
          </div>

          {/* PiP Status Indicator */}
          {isPiPActive && (
            <div className="absolute top-4 right-4 max-w-xs">
              <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3 animate-pulse">
                <PictureInPicture2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">Picture-in-Picture Active</div>
                  <div className="text-xs opacity-90 mt-1">
                    Look for a floating video window on your screen!
                    <br />Click the PiP button again to return.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default EnhancedVideoPlayer;