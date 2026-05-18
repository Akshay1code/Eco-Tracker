import { useEffect, useRef, useState } from 'react';

const EMOTIONS = [
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'angry', label: 'Angry' },
  { id: 'proud', label: 'Proud' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function AuthEarthMascot({
  mode = 'signup',
  speechMessage,
  emotionId,
  action,
  interactive = mode === 'login',
  className = '',
}) {
  const mascotRef = useRef(null);
  const reactionTimeoutRef = useRef(null);
  const gazeResetTimeoutRef = useRef(null);
  const trackedTargetRef = useRef(null);
  const [emotionIndex, setEmotionIndex] = useState(mode === 'login' ? 0 : 3);
  const [isReacting, setIsReacting] = useState(false);

  const forcedEmotion = emotionId ? EMOTIONS.find((item) => item.id === emotionId) : null;
  const emotion = forcedEmotion || EMOTIONS[emotionIndex];
  const resolvedSpeechMessage = speechMessage || (
    mode === 'signup'
      ? "Yes, you are welcome to join our army. Let's go zero carbon emission."
      : 'Welcome back, champion.'
  );

  useEffect(() => {
    if (forcedEmotion) {
      return;
    }
    setEmotionIndex(mode === 'login' ? 0 : 3);
  }, [forcedEmotion, mode]);

  useEffect(() => () => {
    if (reactionTimeoutRef.current) {
      window.clearTimeout(reactionTimeoutRef.current);
    }
    if (gazeResetTimeoutRef.current) {
      window.clearTimeout(gazeResetTimeoutRef.current);
    }
  }, []);

  const updatePose = (clientX, clientY) => {
    const node = mascotRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);
    const offsetX = clamp((clientX - centerX) / (window.innerWidth * 0.34), -1, 1);
    const offsetY = clamp((clientY - centerY) / (window.innerHeight * 0.28), -1, 1);

    node.style.setProperty('--earth-tilt-x', offsetX.toFixed(3));
    node.style.setProperty('--earth-tilt-y', offsetY.toFixed(3));
    node.style.setProperty('--earth-look-x', (offsetX * 0.92).toFixed(3));
    node.style.setProperty('--earth-look-y', (offsetY * 0.92).toFixed(3));
    node.style.setProperty('--earth-hover', '1');
  };

  const updatePoseFromElement = (element) => {
    if (!(element instanceof Element)) return;
    const rect = element.getBoundingClientRect();
    updatePose(rect.left + (rect.width / 2), rect.top + (rect.height / 2));
  };

  const resetPose = () => {
    const node = mascotRef.current;
    if (!node) return;

    node.style.setProperty('--earth-tilt-x', '0');
    node.style.setProperty('--earth-tilt-y', '0');
    node.style.setProperty('--earth-look-x', '0');
    node.style.setProperty('--earth-look-y', '0');
    node.style.setProperty('--earth-hover', '0');
  };

  useEffect(() => {
    if (mode !== 'login') return undefined;

    const resolveTrackable = (target) => {
      if (!(target instanceof Element)) return null;
      const candidate = target.closest(
        '.auth-right input, .auth-right button, .auth-right textarea, .auth-right [role="button"], .auth-right label, .auth-right a'
      );
      return candidate instanceof Element ? candidate : null;
    };

    const handleFocusIn = (event) => {
      const target = resolveTrackable(event.target);
      if (!target) return;
      trackedTargetRef.current = target;
      updatePoseFromElement(target);
    };

    const handleInput = () => {
      if (trackedTargetRef.current) {
        updatePoseFromElement(trackedTargetRef.current);
      }
    };

    const handleClick = (event) => {
      const target = resolveTrackable(event.target);
      if (!target) return;

      trackedTargetRef.current = target;
      updatePoseFromElement(target);

      if (gazeResetTimeoutRef.current) {
        window.clearTimeout(gazeResetTimeoutRef.current);
      }

      if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        gazeResetTimeoutRef.current = window.setTimeout(() => {
          const activeTarget = resolveTrackable(document.activeElement);
          trackedTargetRef.current = activeTarget;
          if (activeTarget) {
            updatePoseFromElement(activeTarget);
          } else {
            resetPose();
          }
        }, 900);
      }
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        const activeTarget = resolveTrackable(document.activeElement);
        trackedTargetRef.current = activeTarget;
        if (activeTarget) {
          updatePoseFromElement(activeTarget);
        } else {
          resetPose();
        }
      }, 0);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('input', handleInput);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('input', handleInput);
      document.removeEventListener('click', handleClick);
    };
  }, [mode]);

  const cycleEmotion = () => {
    if (!interactive || forcedEmotion) {
      return;
    }

    setEmotionIndex((prev) => (prev + 1) % EMOTIONS.length);
    setIsReacting(true);

    if (reactionTimeoutRef.current) {
      window.clearTimeout(reactionTimeoutRef.current);
    }

    reactionTimeoutRef.current = window.setTimeout(() => {
      setIsReacting(false);
    }, 460);
  };

  const mascotClassName = [
    'auth-earth-mascot',
    `auth-earth-mascot--${mode}`,
    className,
    action ? `auth-earth-mascot--action-${action}` : '',
    interactive ? '' : 'auth-earth-mascot--static',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={mascotRef}
      className={mascotClassName}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : -1}
      aria-label={
        interactive
          ? `EcoTracker earth mascot. Current mood: ${emotion.label}. Click to change mood.`
          : `EcoTracker earth mascot. ${resolvedSpeechMessage}`
      }
      onPointerMove={(e) => updatePose(e.clientX, e.clientY)}
      onPointerEnter={(e) => updatePose(e.clientX, e.clientY)}
      onPointerLeave={() => {
        if (trackedTargetRef.current) {
          updatePoseFromElement(trackedTargetRef.current);
          return;
        }
        resetPose();
      }}
      onClick={interactive ? cycleEmotion : undefined}
      onKeyDown={(e) => {
        if (!interactive) {
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cycleEmotion();
        }
      }}
    >
      <div className={`earth-speech-cloud earth-speech-cloud--${mode}`}>
        {resolvedSpeechMessage}
      </div>

      <div className="earth-shadow" />

      <div className="earth-character-stage">
        <div className={`earth-character earth-character--${emotion.id} ${isReacting ? 'is-reacting' : ''}`}>
          <div className="earth-aura">
            <span className="earth-spark earth-spark--one" />
            <span className="earth-spark earth-spark--two" />
            <span className="earth-spark earth-spark--three" />
            <span className="earth-squiggle earth-squiggle--left" />
            <span className="earth-squiggle earth-squiggle--right" />
            <span className="earth-steam earth-steam--left" />
            <span className="earth-steam earth-steam--right" />
          </div>

          <div className="earth-arm earth-arm--left">
            <div className="earth-hand">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="earth-arm earth-arm--right">
            <div className="earth-hand earth-hand--rest" />
          </div>

          <div className="earth-trophy">
            <span className="earth-trophy-handle earth-trophy-handle--left" />
            <span className="earth-trophy-handle earth-trophy-handle--right" />
            <span className="earth-trophy-cup" />
            <span className="earth-trophy-stem" />
            <span className="earth-trophy-base" />
          </div>

          <div className="earth-globe">
            <span className="earth-continent earth-continent--one" />
            <span className="earth-continent earth-continent--two" />
            <span className="earth-continent earth-continent--three" />
            <span className="earth-continent earth-continent--four" />
            <span className="earth-continent earth-continent--five" />
            <span className="earth-continent earth-continent--six" />
            <span className="earth-continent earth-continent--seven" />

            <div className="earth-face">
              <span className="earth-brow earth-brow--left" />
              <span className="earth-brow earth-brow--right" />

              <div className="earth-eye earth-eye--left">
                <span className="earth-eye-spark earth-eye-spark--big" />
                <span className="earth-eye-spark earth-eye-spark--small" />
              </div>

              <div className="earth-eye earth-eye--right">
                <span className="earth-eye-spark earth-eye-spark--big" />
                <span className="earth-eye-spark earth-eye-spark--small" />
              </div>

              <span className="earth-cheek earth-cheek--left" />
              <span className="earth-cheek earth-cheek--right" />
              <span className="earth-tear earth-tear--left" />
              <span className="earth-tear earth-tear--right" />

              <div className="earth-mouth">
                <span className="earth-mouth-tongue" />
              </div>
            </div>
          </div>

          <div className="earth-legs">
            <div className="earth-leg earth-leg--left">
              <span className="earth-shoe earth-shoe--left" />
            </div>
            <div className="earth-leg earth-leg--right">
              <span className="earth-shoe earth-shoe--right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthEarthMascot;
