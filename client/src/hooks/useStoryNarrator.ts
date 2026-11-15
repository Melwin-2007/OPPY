import { useEffect, useRef, useState, useCallback } from 'react';

export function useStoryNarrator(textToSpeak: string, captionId: string | number) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeIdRef = useRef<string | number | null>(null);

  const cleanText = (raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/\[.*?\]/g, '')
      .replace(/MER-B/g, 'M-E-R B')
      .replace(/5-DOF/g, 'five-degree-of-freedom')
      .replace(/\bIDD-RAT\b/g, 'I-D-D and RAT')
      .replace(/\bIDD\b/g, 'I-D-D')
      .replace(/\bRAT\b/g, 'Rock Abrasion Tool, or RAT')
      .replace(/\bAPXS\b/g, 'A-P-X-S')
      .replace(/\bMI\b/g, 'Microscopic Imager')
      .replace(/\bMB\b/g, 'Mössbauer Spectrometer')
      .replace(/\bPMA\b/g, 'P-M-A')
      .replace(/\bPancam\b/g, 'Pan-cam')
      .replace(/\bNavcams\b/g, 'Nav-cams')
      .replace(/\bNavcam\b/g, 'Nav-cam')
      .replace(/\bMini-TES\b/g, 'Mini-T-E-S')
      .replace(/\bWEB\b/g, 'Warm Electronics Box')
      .replace(/\bRAD6000\b/g, 'Rad six-thousand')
      .replace(/\bPu-238\b/g, 'Plutonium two thirty-eight')
      .replace(/\bRHU\b/g, 'R-H-U')
      .replace(/\bHGA\b/g, 'H-G-A')
      .replace(/\bUHF\b/g, 'U-H-F')
      .replace(/\bGaAs\b/g, 'gallium arsenide')
      .replace(/GaInP\/GaAs\/Ge/g, 'gallium indium phosphide, gallium arsenide, and germanium')
      .replace(/8-Ah/g, 'eight amp-hour')
      .replace(/Li-Ion/g, 'lithium-ion')
      .replace(/28–32 VDC|28–32 V DC/g, 'twenty-eight to thirty-two volts direct current')
      .replace(/28 V DC/g, 'twenty-eight volts direct current')
      .replace(/−105°C|-105°C/g, 'minus one hundred and five degrees Celsius')
      .replace(/19,000 km\/h/g, 'nineteen thousand kilometers per hour')
      .replace(/45\.16 km/g, 'forty-five point one six kilometers')
      .replace(/4\.5 mm/g, 'four point five millimeters')
      .replace(/192 meters/g, 'one hundred and ninety-two meters')
      .replace(/1 meter/g, 'one meter')
      .replace(/5,111 Sols/g, 'five thousand one hundred and eleven sols')
      .replace(/5111/g, 'fifty-one eleven')
      .replace(/Sol 30\b/g, 'Sol thirty')
      .replace(/Sol 446–484/g, 'Sol four forty-six to four eighty-four')
      .replace(/Sol 4027/g, 'Sol four thousand twenty-seven')
      .replace(/217,594/g, 'two hundred seventeen thousand five hundred ninety-four')
      .replace(/55×/g, 'fifty-five times')
      .replace(/55 times/g, 'fifty-five times')
      .replace(/90 Sols|90-sol|90 days/g, 'ninety sols')
      .replace(/25 km/g, 'twenty-five kilometers')
      .replace(/128 Wh/g, 'one hundred twenty-eight watt-hours')
      .replace(/900 Wh\/sol/g, 'nine hundred watt-hours per sol')
      .replace(/~100 Wh/g, 'approximately one hundred watt-hours')
      .replace(/140 W/g, 'one hundred forty watts')
      .replace(/1 Watt/g, 'one watt')
      .replace(/1\.5m/g, 'one point five meters')
      .replace(/2\.3m/g, 'two point three meters')
      .replace(/1\.6m/g, 'one point six meters')
      .replace(/0\.28m/g, 'zero point two eight meters')
      .replace(/20 MHz/g, 'twenty megahertz')
      .replace(/128 MB/g, 'one hundred twenty-eight megabytes')
      .replace(/256 MB/g, 'two hundred fifty-six megabytes')
      .replace(/25 cm/g, 'twenty-five centimeter')
      .replace(/32°/g, 'thirty-two degrees')
      .replace(/360°/g, 'three hundred sixty degrees')
      .replace(/±90°/g, 'plus or minus ninety degrees')
      .replace(/MIMOS II/g, 'Mimos two')
      .replace(/tau > 10\.8/g, 'tau greater than ten point eight')
      .replace(/645 watt-hours/g, 'six hundred forty-five watt-hours')
      .replace(/22 watt-hours/g, 'twenty-two watt-hours')
      .replace(/2003/g, 'two thousand and three')
      .replace(/2004/g, 'two thousand and four')
      .replace(/2005/g, 'two thousand and five')
      .replace(/2007/g, 'two thousand and seven')
      .replace(/2010/g, 'twenty ten')
      .replace(/2014/g, 'twenty fourteen')
      .replace(/2015/g, 'twenty fifteen')
      .replace(/2018/g, 'twenty eighteen')
      .replace(/2019/g, 'twenty nineteen')
      .replace(/14 Years/g, 'fourteen years')
      .replace(/15 years/g, 'fifteen years')
      .replace(/—/g, ', ')
      .replace(/–/g, ' to ')
      .replace(/·/g, ', ')
      .replace(/'/g, "'")
      .trim();
  };

  const getElegantFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const list = window.speechSynthesis.getVoices();
    if (!list || list.length === 0) return null;

    // 1. British / UK English Female (Highest elegance, clear articulation & storytelling cadence)
    let v = list.find((x) => 
      /en[-_]GB/i.test(x.lang) && 
      /female|sonia|libby|hazel|maisie|susan|victoria|amy|serena|kate/i.test(x.name)
    );
    if (!v) {
      v = list.find((x) => /en[-_]GB/i.test(x.lang) && !/male|david|george|oliver|brian/i.test(x.name));
    }

    // 2. Commonwealth / Foreign Accented English Female (Irish, Australian, South African)
    if (!v) {
      v = list.find((x) => 
        /en[-_](IE|AU|NZ|ZA|IN)/i.test(x.lang) && 
        /female|karen|moira|catherine|clara|fiona|neerja|natasha/i.test(x.name)
      );
    }
    if (!v) {
      v = list.find((x) => /en[-_](IE|AU|NZ|ZA)/i.test(x.lang) && !/male/i.test(x.name));
    }

    // 3. High-quality natural English female voice
    if (!v) {
      v = list.find((x) => 
        x.lang.startsWith('en') && 
        /female|natural|samantha|aria|jenny|zira/i.test(x.name) && 
        !/male|david|mark/i.test(x.name)
      );
    }

    // 4. Any en-GB voice
    if (!v) {
      v = list.find((x) => /en[-_]GB/i.test(x.lang));
    }

    // 5. Fallback English
    return v || list.find((x) => x.lang.startsWith('en')) || list[0] || null;
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    setIsSpeaking(false);
    activeIdRef.current = null;
    currentUtteranceRef.current = null;
  }, []);

  const speak = useCallback((text: string, id: string | number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !isVoiceEnabled || !text) return;

    const cleaned = cleanText(text);
    if (!cleaned) return;

    // Guaranteed NO overlap: immediately cancel previous speech
    stop();

    activeIdRef.current = id;
    const voice = getElegantFemaleVoice();

    const u = new SpeechSynthesisUtterance(cleaned);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang || 'en-GB';
    } else {
      u.lang = 'en-GB';
    }

    // Storytelling pacing & cadence
    u.rate = 0.91;  // slightly relaxed, articulate pacing for clear words
    u.pitch = 1.02; // warm, resonant tone
    u.volume = 1.0;

    u.onstart = () => {
      setIsSpeaking(true);
    };

    u.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    u.onerror = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = u;
    (window as any).__activeNarratorUtterance = u; // prevent Chrome GC bug

    try {
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }, [isVoiceEnabled, stop, getElegantFemaleVoice]);

  // Trigger speech whenever captionId or text changes
  useEffect(() => {
    if (!isVoiceEnabled || !textToSpeak) {
      stop();
      return;
    }

    speak(textToSpeak, captionId);

    return () => {
      stop();
    };
  }, [captionId, textToSpeak, isVoiceEnabled, speak, stop]);

  // Keep voices loaded and handle Chrome long-utterance pause bug
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const handleVoicesChanged = () => {
      // Re-trigger with selected voice if speaking
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    const heartbeat = setInterval(() => {
      if (isSpeaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 1500);

    return () => {
      clearInterval(heartbeat);
      stop();
    };
  }, [isSpeaking, stop]);

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      stop();
      setIsVoiceEnabled(false);
    } else {
      setIsVoiceEnabled(true);
    }
  };

  return {
    isVoiceEnabled,
    isSpeaking,
    toggleVoice,
    stop
  };
}

