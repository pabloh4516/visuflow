import { useState, useRef, useEffect } from 'react';
import { GeneratorConfig, PopupSize, CustomPosition, defaultBackgrounds } from '@/types/generator';
import { DraggablePopup } from './DraggablePopup';

interface MiniPreviewProps {
  config: GeneratorConfig;
  onInteraction?: () => void;
  onPositionChange?: (position: CustomPosition) => void;
  device?: 'desktop' | 'mobile';
}

const sizeMap: Record<PopupSize, string> = {
  small: '260px',
  medium: '320px',
  large: '380px',
};

export function MiniPreview({ config, onInteraction, onPositionChange, device = 'mobile' }: MiniPreviewProps) {
  const { globalStyles, popupConfig, popupType, popupTemplate, popupSize, popupPosition, customPosition, desktopScreenshot, mobileScreenshot } = config;
  const popupWidth = sizeMap[popupSize];
  const containerRef = useRef<HTMLDivElement>(null);
  const currentScreenshot = device === 'desktop' ? desktopScreenshot : mobileScreenshot;
  
  // Slider state for captcha
  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Reset slider when template changes
  useEffect(() => {
    setSliderProgress(0);
    setIsVerified(false);
    setIsDragging(false);
  }, [popupType, popupTemplate]);

  const handleSliderStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isVerified) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Global event handlers for slider drag (works on mobile)
  useEffect(() => {
    if (!isDragging || !sliderRef.current) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!sliderRef.current || isVerified) return;
      e.preventDefault();
      
      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const progress = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderProgress(progress);
      
      if (progress >= 95) {
        setIsVerified(true);
        setSliderProgress(100);
        setIsDragging(false);
        onInteraction?.();
      }
    };

    const handleGlobalEnd = () => {
      if (!isVerified && sliderProgress < 95) {
        setSliderProgress(0);
      }
      setIsDragging(false);
    };

    // Add global listeners with passive: false for touch events
    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('touchend', handleGlobalEnd);
    document.addEventListener('touchcancel', handleGlobalEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
      document.removeEventListener('touchcancel', handleGlobalEnd);
    };
  }, [isDragging, isVerified, sliderProgress, onInteraction]);

  const getTemplateStyles = () => {
    switch (popupTemplate) {
      case 1:
        return { borderRadius: '12px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' };
      case 2:
        return { borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: `2px solid ${globalStyles.buttonColor}40` };
      case 3:
        return { borderRadius: '4px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', borderTop: `4px solid ${globalStyles.buttonColor}` };
      case 4:
        return { borderRadius: '16px', padding: '24px', boxShadow: `0 0 30px ${globalStyles.buttonColor}30` };
      case 5:
        return { borderRadius: '20px', padding: '20px', boxShadow: '0 10px 60px rgba(0,0,0,0.4)', border: `1px solid ${globalStyles.textColor}10` };
      default:
        return { borderRadius: '12px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' };
    }
  };

  // COOKIES POPUP - 5 Templates
  const renderCookiesPopup = () => {
    const title = popupConfig.title || 'Este site utiliza cookies';
    const desc = popupConfig.description || 'Utilizamos cookies para melhorar sua experiência.';
    const btnPrimary = popupConfig.primaryButtonText || 'Aceitar';
    const btnSecondary = popupConfig.secondaryButtonText || 'Recusar';

    switch (popupTemplate) {
      case 1: // Clássico
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🍪</div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '11px', marginBottom: '12px', lineHeight: '1.4' }}>
              {desc}
            </p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '8px 20px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '11px' }}>
                {btnPrimary}
              </button>
              <button style={{ backgroundColor: 'transparent', color: globalStyles.textColor, padding: '8px 16px', borderRadius: '6px', border: `1px solid ${globalStyles.textColor}30`, fontSize: '11px' }}>
                {btnSecondary}
              </button>
            </div>
          </div>
        );
      case 2: // Moderno
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${globalStyles.buttonColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <span style={{ fontSize: '24px' }}>🍪</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.6, fontSize: '11px', marginBottom: '16px' }}>
              {desc}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '10px 24px', borderRadius: '50px', border: 'none', fontWeight: '600', fontSize: '11px' }}>
                {btnPrimary}
              </button>
              <button style={{ backgroundColor: 'transparent', color: globalStyles.buttonColor, padding: '10px 20px', borderRadius: '50px', border: `2px solid ${globalStyles.buttonColor}`, fontSize: '11px' }}>
                {btnSecondary}
              </button>
            </div>
          </div>
        );
      case 3: // Minimalista
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>🍪</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: globalStyles.textColor, fontSize: '11px', lineHeight: '1.5', marginBottom: '12px' }}>
                  {desc}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '6px 16px', borderRadius: '4px', border: 'none', fontSize: '10px' }}>
                    OK
                  </button>
                  <button style={{ backgroundColor: 'transparent', color: globalStyles.textColor, padding: '6px 12px', border: 'none', fontSize: '10px', textDecoration: 'underline' }}>
                    Saiba mais
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 4: // GDPR
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <h3 style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '600' }}>
                Privacidade e Cookies
              </h3>
            </div>
            <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '10px', marginBottom: '12px', lineHeight: '1.5' }}>
              {desc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '11px', width: '100%' }}>
                Aceitar todos
              </button>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ flex: 1, backgroundColor: `${globalStyles.textColor}10`, color: globalStyles.textColor, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '10px' }}>
                  Essenciais
                </button>
                <button style={{ flex: 1, backgroundColor: `${globalStyles.textColor}10`, color: globalStyles.textColor, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '10px' }}>
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        );
      case 5: // Flutuante
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${globalStyles.buttonColor}, ${globalStyles.buttonColor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '20px' }}>🍪</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: globalStyles.textColor, fontSize: '10px', marginBottom: '8px' }}>
                {desc}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '10px', fontWeight: '600' }}>
                  {btnPrimary}
                </button>
                <button style={{ backgroundColor: 'transparent', color: globalStyles.textColor, padding: '6px 10px', border: 'none', fontSize: '10px', opacity: 0.7 }}>
                  {btnSecondary}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // COUNTRY POPUP - 5 Templates (Redesigned)
  const renderCountryPopup = () => {
    const countries = popupConfig.countries || [];
    const title = popupConfig.title || 'Selecione seu país';

    switch (popupTemplate) {
      case 1: // Globe Interactive - Modern with animated globe
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: `linear-gradient(135deg, ${globalStyles.buttonColor}, ${globalStyles.buttonColor}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 12px',
              boxShadow: `0 8px 24px ${globalStyles.buttonColor}40`
            }}>
              <span style={{ fontSize: '28px' }}>🌍</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '14px' }}>
              Escolha sua localização
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {countries.slice(0, 3).map((c, i) => (
                <button key={c.code} style={{
                  backgroundColor: i === 0 ? globalStyles.buttonColor : `${globalStyles.textColor}06`,
                  color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor,
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: i === 0 ? 'none' : `1px solid ${globalStyles.textColor}12`,
                  display: 'flex', alignItems: 'center', gap: '12px',
                  fontSize: '12px', fontWeight: i === 0 ? '600' : '400',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '20px' }}>{c.flag}</span>
                  <span>{c.name}</span>
                  {i === 0 && <span style={{ marginLeft: 'auto', fontSize: '14px' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        );
      case 2: // Search Style - With search input aesthetic
        return (
          <div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '10px', textAlign: 'center' }}>
              {title}
            </h3>
            <div style={{
              backgroundColor: `${globalStyles.textColor}06`,
              borderRadius: '10px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '12px', border: `1px solid ${globalStyles.textColor}10`
            }}>
              <span style={{ opacity: 0.4, fontSize: '14px' }}>🔍</span>
              <span style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '11px' }}>Buscar país...</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflow: 'hidden' }}>
              {countries.slice(0, 4).map((c, i) => (
                <button key={c.code} style={{
                  backgroundColor: i === 0 ? `${globalStyles.buttonColor}12` : 'transparent',
                  color: globalStyles.textColor,
                  padding: '10px 12px', borderRadius: '8px',
                  border: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '12px',
                }}>
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  <span style={{ fontWeight: i === 0 ? '600' : '400' }}>{c.name}</span>
                  {i === 0 && <span style={{ marginLeft: 'auto', color: globalStyles.buttonColor, fontSize: '12px' }}>●</span>}
                </button>
              ))}
            </div>
          </div>
        );
      case 3: // Premium Grid - Elegant grid with shadows
        return (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
              {title}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {countries.slice(0, 4).map((c, i) => (
                <button key={c.code} style={{
                  backgroundColor: i === 0 ? globalStyles.buttonColor : globalStyles.backgroundColor,
                  color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor,
                  padding: '16px 10px', borderRadius: '14px',
                  border: i === 0 ? 'none' : `2px solid ${globalStyles.textColor}10`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  boxShadow: i === 0 ? `0 8px 20px ${globalStyles.buttonColor}30` : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: '28px' }}>{c.flag}</span>
                  <span style={{ fontSize: '10px', fontWeight: '600' }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4: // Netflix Style - Premium dropdown
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>🌐</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '14px' }}>
              Para uma melhor experiência
            </p>
            <div style={{
              background: `linear-gradient(135deg, ${globalStyles.textColor}08, ${globalStyles.textColor}04)`,
              borderRadius: '12px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '12px', border: `1px solid ${globalStyles.textColor}10`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{countries[0]?.flag || '🌍'}</span>
                <span style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '600' }}>{countries[0]?.name || 'Selecionar'}</span>
              </div>
              <span style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '10px' }}>▼</span>
            </div>
            <button style={{ 
              backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor,
              padding: '12px', borderRadius: '10px', border: 'none',
              fontWeight: '600', fontSize: '12px', width: '100%',
              boxShadow: `0 4px 14px ${globalStyles.buttonColor}30`
            }}>
              Continuar
            </button>
          </div>
        );
      case 5: // Region Cards - Detailed cards
        return (
          <div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
              {title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {countries.slice(0, 3).map((c, i) => (
                <div key={c.code} style={{
                  background: i === 0 
                    ? `linear-gradient(135deg, ${globalStyles.buttonColor}15, ${globalStyles.buttonColor}08)`
                    : `linear-gradient(135deg, ${globalStyles.textColor}05, transparent)`,
                  borderRadius: '14px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  border: i === 0 ? `2px solid ${globalStyles.buttonColor}40` : `1px solid ${globalStyles.textColor}08`,
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    backgroundColor: globalStyles.backgroundColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <span style={{ fontSize: '24px' }}>{c.flag}</span>
                  </div>
                  <div>
                    <div style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '600' }}>{c.name}</div>
                    <div style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '10px' }}>{c.code}</div>
                  </div>
                  {i === 0 && (
                    <div style={{ 
                      marginLeft: 'auto', width: '20px', height: '20px',
                      borderRadius: '50%', backgroundColor: globalStyles.buttonColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ color: globalStyles.buttonTextColor, fontSize: '10px' }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // GENDER POPUP - 5 Templates (Redesigned)
  const renderGenderPopup = () => {
    const genderOptions = popupConfig.genderOptions || [];
    const title = popupConfig.title || 'Selecione seu gênero';

    switch (popupTemplate) {
      case 1: // Gradient Avatars - Modern with gradient backgrounds
        return (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '16px' }}>
              Personalize sua experiência
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              {genderOptions.map((o, i) => (
                <button key={o.value} style={{
                  background: i === 0 
                    ? `linear-gradient(135deg, ${globalStyles.buttonColor}, ${globalStyles.buttonColor}cc)`
                    : `linear-gradient(135deg, ${globalStyles.textColor}10, ${globalStyles.textColor}05)`,
                  color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor,
                  padding: '18px 22px', borderRadius: '16px', border: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  boxShadow: i === 0 ? `0 10px 25px ${globalStyles.buttonColor}35` : '0 4px 12px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: i === 0 ? 'rgba(255,255,255,0.25)' : `${globalStyles.textColor}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '22px' }}>
                      {o.value === 'male' ? '👨' : o.value === 'female' ? '👩' : '🧑'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600' }}>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2: // Pill Buttons - Modern pills with icons
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '50%',
              background: `${globalStyles.buttonColor}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ fontSize: '24px' }}>⚧</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
              {title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {genderOptions.map((o, i) => (
                <button key={o.value} style={{
                  backgroundColor: i === 0 ? globalStyles.buttonColor : 'transparent',
                  color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor,
                  padding: '12px 20px', borderRadius: '50px',
                  border: i === 0 ? 'none' : `2px solid ${globalStyles.textColor}15`,
                  fontSize: '12px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: i === 0 ? `0 6px 18px ${globalStyles.buttonColor}30` : 'none',
                }}>
                  <span>{o.value === 'male' ? '♂️' : o.value === 'female' ? '♀️' : '⚧️'}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3: // Card Selection - Professional cards
        return (
          <div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
              {title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {genderOptions.map((o, i) => (
                <div key={o.value} style={{
                  background: i === 0 
                    ? `linear-gradient(135deg, ${globalStyles.buttonColor}12, ${globalStyles.buttonColor}06)`
                    : `${globalStyles.textColor}04`,
                  borderRadius: '14px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  border: i === 0 ? `2px solid ${globalStyles.buttonColor}35` : `1px solid ${globalStyles.textColor}08`,
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: i === 0 ? globalStyles.buttonColor : `${globalStyles.textColor}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '20px', filter: i === 0 ? 'brightness(1.2)' : 'none' }}>
                      {o.value === 'male' ? '👨' : o.value === 'female' ? '👩' : '🧑'}
                    </span>
                  </div>
                  <div>
                    <div style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '600' }}>{o.label}</div>
                    <div style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '10px' }}>
                      {o.value === 'male' ? 'Masculino' : o.value === 'female' ? 'Feminino' : 'Outro gênero'}
                    </div>
                  </div>
                  {i === 0 && (
                    <div style={{
                      marginLeft: 'auto', width: '22px', height: '22px',
                      borderRadius: '50%', backgroundColor: globalStyles.buttonColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ color: globalStyles.buttonTextColor, fontSize: '11px' }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 4: // Circle Icons - Minimalist circles
        return (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
              {title}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
              {genderOptions.map((o, i) => (
                <button key={o.value} style={{
                  width: '70px', height: '70px', borderRadius: '50%',
                  background: i === 0 
                    ? `linear-gradient(135deg, ${globalStyles.buttonColor}, ${globalStyles.buttonColor}bb)`
                    : `${globalStyles.textColor}08`,
                  color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor,
                  border: i === 0 ? 'none' : `2px solid ${globalStyles.textColor}12`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  boxShadow: i === 0 ? `0 8px 20px ${globalStyles.buttonColor}35` : 'none',
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {o.value === 'male' ? '👨' : o.value === 'female' ? '👩' : '🧑'}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {genderOptions.map((o, i) => (
                <span key={o.value} style={{ 
                  width: '70px', textAlign: 'center',
                  color: globalStyles.textColor, fontSize: '10px', fontWeight: i === 0 ? '600' : '400',
                  opacity: i === 0 ? 1 : 0.6
                }}>
                  {o.label}
                </span>
              ))}
            </div>
          </div>
        );
      case 5: // Modern Form - Clean radio style
        return (
          <div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '6px', textAlign: 'center' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '14px', textAlign: 'center' }}>
              Selecione uma opção para continuar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {genderOptions.map((o, i) => (
                <label key={o.value} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  backgroundColor: i === 0 ? `${globalStyles.buttonColor}10` : 'transparent',
                  border: `1px solid ${i === 0 ? globalStyles.buttonColor + '30' : globalStyles.textColor + '10'}`,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: `2px solid ${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '30'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i === 0 && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: globalStyles.buttonColor }} />}
                  </div>
                  <span style={{ color: globalStyles.textColor, fontSize: '12px', fontWeight: i === 0 ? '600' : '400' }}>{o.label}</span>
                </label>
              ))}
            </div>
            <button style={{
              backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor,
              padding: '12px', borderRadius: '10px', border: 'none',
              fontWeight: '600', fontSize: '12px', width: '100%',
              boxShadow: `0 4px 14px ${globalStyles.buttonColor}25`
            }}>
              Continuar
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // AGE POPUP - 5 Templates (Redesigned)
  const renderAgePopup = () => {
    const title = popupConfig.title || 'Verificação de Idade';
    const desc = popupConfig.description || 'Você tem 18 anos ou mais?';

    switch (popupTemplate) {
      case 1: // Gate Premium - Dramatic YES/NO
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '70px', height: '70px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${globalStyles.buttonColor}20, ${globalStyles.buttonColor}10)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', border: `3px solid ${globalStyles.buttonColor}30`
            }}>
              <span style={{ fontSize: '32px' }}>🔞</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.6, fontSize: '11px', marginBottom: '18px', lineHeight: '1.4' }}>
              {desc}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{
                flex: 1, backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor,
                padding: '14px', borderRadius: '12px', border: 'none',
                fontWeight: '700', fontSize: '14px',
                boxShadow: `0 8px 20px ${globalStyles.buttonColor}35`
              }}>
                SIM, TENHO +18
              </button>
              <button style={{
                flex: 1, backgroundColor: `${globalStyles.textColor}08`, color: globalStyles.textColor,
                padding: '14px', borderRadius: '12px', border: `1px solid ${globalStyles.textColor}15`,
                fontWeight: '500', fontSize: '14px'
              }}>
                NÃO
              </button>
            </div>
          </div>
        );
      case 2: // Verification Badge - Professional badge
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: `linear-gradient(135deg, ${globalStyles.buttonColor}, ${globalStyles.buttonColor}cc)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', boxShadow: `0 8px 20px ${globalStyles.buttonColor}30`
            }}>
              <span style={{ fontSize: '26px' }}>🔒</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '14px' }}>
              Conteúdo para maiores de 18 anos
            </p>
            <div style={{
              backgroundColor: `${globalStyles.buttonColor}08`, borderRadius: '12px',
              padding: '14px', marginBottom: '14px', border: `1px solid ${globalStyles.buttonColor}20`
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px',
                  backgroundColor: globalStyles.buttonColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ color: globalStyles.buttonTextColor, fontSize: '12px' }}>✓</span>
                </div>
                <span style={{ color: globalStyles.textColor, fontSize: '11px', textAlign: 'left', lineHeight: '1.3' }}>
                  Declaro ter 18 anos ou mais
                </span>
              </label>
            </div>
            <button style={{
              backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor,
              padding: '12px', borderRadius: '10px', border: 'none',
              fontWeight: '600', fontSize: '12px', width: '100%'
            }}>
              Verificar e Continuar
            </button>
          </div>
        );
      case 3: // Birth Date Input - Modern date fields
        return (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
              Data de Nascimento
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '14px' }}>
              Informe para verificar sua idade
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                flex: 1, backgroundColor: `${globalStyles.textColor}06`, borderRadius: '10px',
                padding: '12px 8px', border: `1px solid ${globalStyles.textColor}10`
              }}>
                <div style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '9px', marginBottom: '4px' }}>DIA</div>
                <div style={{ color: globalStyles.textColor, fontSize: '18px', fontWeight: '700' }}>15</div>
              </div>
              <div style={{
                flex: 1, backgroundColor: `${globalStyles.textColor}06`, borderRadius: '10px',
                padding: '12px 8px', border: `1px solid ${globalStyles.textColor}10`
              }}>
                <div style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '9px', marginBottom: '4px' }}>MÊS</div>
                <div style={{ color: globalStyles.textColor, fontSize: '18px', fontWeight: '700' }}>03</div>
              </div>
              <div style={{
                flex: 1.2, backgroundColor: `${globalStyles.textColor}06`, borderRadius: '10px',
                padding: '12px 8px', border: `1px solid ${globalStyles.textColor}10`
              }}>
                <div style={{ color: globalStyles.textColor, opacity: 0.4, fontSize: '9px', marginBottom: '4px' }}>ANO</div>
                <div style={{ color: globalStyles.textColor, fontSize: '18px', fontWeight: '700' }}>1995</div>
              </div>
            </div>
            <button style={{
              backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor,
              padding: '12px', borderRadius: '10px', border: 'none',
              fontWeight: '600', fontSize: '12px', width: '100%',
              boxShadow: `0 4px 14px ${globalStyles.buttonColor}25`
            }}>
              Verificar Idade
            </button>
          </div>
        );
      case 4: // Age Selector - Range buttons
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%',
              backgroundColor: `${globalStyles.buttonColor}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ fontSize: '24px' }}>🎂</span>
            </div>
            <h3 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px', marginBottom: '14px' }}>
              Selecione sua faixa etária
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['+18', '+21', '+25'].map((age, i) => (
                <button key={age} style={{
                  flex: 1, padding: '14px 8px', borderRadius: '12px',
                  backgroundColor: i === 0 ? globalStyles.buttonColor : 'transparent',
                  color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor,
                  border: i === 0 ? 'none' : `2px solid ${globalStyles.textColor}15`,
                  fontWeight: '700', fontSize: '14px',
                  boxShadow: i === 0 ? `0 6px 16px ${globalStyles.buttonColor}30` : 'none'
                }}>
                  {age}
                </button>
              ))}
            </div>
            <button style={{
              backgroundColor: `${globalStyles.textColor}08`, color: globalStyles.textColor,
              padding: '10px', borderRadius: '8px', border: 'none',
              fontSize: '11px', width: '100%', opacity: 0.7
            }}>
              Menor de idade? Sair
            </button>
          </div>
        );
      case 5: // Legal Confirmation - Terms style
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: `${globalStyles.buttonColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px' }}>⚖️</span>
              </div>
              <div>
                <h3 style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>
                  {title}
                </h3>
                <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px' }}>
                  Confirmação obrigatória
                </p>
              </div>
            </div>
            <div style={{
              backgroundColor: `${globalStyles.textColor}04`, borderRadius: '10px',
              padding: '12px', marginBottom: '12px', border: `1px solid ${globalStyles.textColor}08`
            }}>
              <p style={{ color: globalStyles.textColor, fontSize: '10px', lineHeight: '1.5', opacity: 0.7 }}>
                Ao continuar, você confirma que tem 18 anos ou mais e concorda com os termos de uso e política de privacidade.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                flex: 2, backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor,
                padding: '12px', borderRadius: '10px', border: 'none',
                fontWeight: '600', fontSize: '11px'
              }}>
                Concordo e Aceito
              </button>
              <button style={{
                flex: 1, backgroundColor: 'transparent', color: globalStyles.textColor,
                padding: '12px', borderRadius: '10px', border: `1px solid ${globalStyles.textColor}15`,
                fontSize: '11px'
              }}>
                Sair
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // CAPTCHA POPUP - 5 Templates
  const renderCaptchaPopup = () => {
    const title = popupConfig.title || 'Verificação de Segurança';
    const btnText = popupConfig.primaryButtonText || 'Não sou um robô';

    switch (popupTemplate) {
      case 1: // reCAPTCHA (clickable checkbox)
        return (
          <div 
            style={{ background: '#f9f9f9', borderRadius: '4px', padding: '12px', border: '1px solid #d3d3d3', cursor: 'pointer' }}
            onClick={() => { if (!isVerified) { setIsVerified(true); onInteraction?.(); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                border: `2px solid ${isVerified ? '#4caf50' : '#c1c1c1'}`, 
                borderRadius: '2px', 
                background: isVerified ? '#4caf50' : '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {isVerified && <span style={{ color: '#fff', fontSize: '16px' }}>✓</span>}
              </div>
              <span style={{ color: '#4b4b4b', fontSize: '13px' }}>{isVerified ? 'Verificado!' : btnText}</span>
              <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4285f4, #34a853)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>
                </div>
                <div style={{ fontSize: '8px', color: '#555' }}>reCAPTCHA</div>
              </div>
            </div>
          </div>
        );
      case 2: // Cloudflare (auto-verifying with animation)
        return (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div 
              style={{ cursor: isVerified ? 'default' : 'pointer' }}
              onClick={() => { if (!isVerified) { setSliderProgress(100); setIsVerified(true); } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: isVerified ? 'linear-gradient(135deg, #34a853, #4caf50)' : 'linear-gradient(135deg, #f38020, #f9a825)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.5s',
                }}>
                  <span style={{ fontSize: '24px', color: '#fff' }}>{isVerified ? '✓' : '☁️'}</span>
                </div>
              </div>
              <h3 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                {isVerified ? '✓ Verificado!' : 'Verificando navegador...'}
              </h3>
              <div style={{ width: '100%', height: '4px', backgroundColor: `${globalStyles.textColor}15`, borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ 
                  width: isVerified ? '100%' : '60%', 
                  height: '100%', 
                  background: isVerified ? '#4caf50' : 'linear-gradient(90deg, #f38020, #f9a825)', 
                  borderRadius: '2px',
                  transition: 'width 0.5s',
                }} />
              </div>
              {!isVerified && (
                <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '9px' }}>
                  Clique para verificar
                </p>
              )}
            </div>
            {isVerified && (
              <button 
                onClick={() => onInteraction?.()}
                style={{ 
                  marginTop: '12px',
                  width: '100%',
                  padding: '10px 20px', 
                  backgroundColor: globalStyles.buttonColor, 
                  color: globalStyles.buttonTextColor, 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, filter 0.2s',
                }}
              >
                Continuar →
              </button>
            )}
          </div>
        );
      case 3: // hCaptcha (clickable checkbox)
        return (
          <div 
            style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px', border: '1px solid #e0e0e0', cursor: 'pointer' }}
            onClick={() => { if (!isVerified) { setIsVerified(true); onInteraction?.(); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '28px', 
                height: '28px', 
                border: `2px solid ${isVerified ? '#4caf50' : '#0074bf'}`, 
                borderRadius: '4px', 
                background: isVerified ? '#4caf50' : '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {isVerified && <span style={{ color: '#fff', fontSize: '18px' }}>✓</span>}
              </div>
              <span style={{ color: '#333', fontSize: '13px', fontWeight: '500' }}>{isVerified ? 'Verificado!' : 'Sou humano'}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #0074bf, #00a0dc)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>h</span>
                </div>
                <span style={{ fontSize: '7px', color: '#666', marginTop: '2px' }}>hCaptcha</span>
              </div>
            </div>
          </div>
        );
      case 4: // Slider
        return (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
              {isVerified ? '✓ Verificado!' : 'Arraste para verificar'}
            </h3>
            <div 
              ref={sliderRef}
              style={{
                height: '44px',
                backgroundColor: isVerified ? `${globalStyles.buttonColor}20` : `${globalStyles.textColor}10`,
                borderRadius: '22px',
                position: 'relative',
                border: `1px solid ${isVerified ? globalStyles.buttonColor : globalStyles.textColor}20`,
                cursor: isDragging ? 'grabbing' : 'grab',
                overflow: 'hidden',
                transition: 'background-color 0.3s',
              }}
            >
              {/* Progress bar */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${sliderProgress}%`,
                backgroundColor: globalStyles.buttonColor,
                borderRadius: '22px',
                transition: isDragging ? 'none' : 'width 0.3s',
              }} />
              {/* Slider handle */}
              <div 
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
                style={{
                  position: 'absolute',
                  left: `calc(${sliderProgress}% - ${sliderProgress > 50 ? '32px' : '4px'})`,
                  top: '4px',
                  width: '36px',
                  height: '36px',
                  backgroundColor: isVerified ? globalStyles.buttonColor : '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transition: isDragging ? 'none' : 'left 0.3s',
                  userSelect: 'none',
                }}
              >
                <span style={{ color: isVerified ? globalStyles.buttonTextColor : globalStyles.buttonColor, fontSize: '16px' }}>
                  {isVerified ? '✓' : '→'}
                </span>
              </div>
              {!isVerified && sliderProgress < 30 && (
                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: globalStyles.textColor, opacity: 0.4, fontSize: '11px', pointerEvents: 'none' }}>
                  Arraste →
                </span>
              )}
            </div>
          </div>
        );
      case 5: // Puzzle (also draggable)
        return (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: globalStyles.textColor, fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
              {isVerified ? '✓ Verificado!' : 'Complete o puzzle'}
            </h3>
            <div style={{
              width: '100%',
              height: '100px',
              background: `linear-gradient(45deg, ${globalStyles.buttonColor}30, ${globalStyles.buttonColor}10)`,
              borderRadius: '8px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              border: `1px solid ${globalStyles.textColor}15`,
              overflow: 'hidden',
            }}>
              {/* Puzzle piece (draggable) */}
              <div 
                ref={sliderRef}
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
                style={{
                  position: 'absolute',
                  left: `calc(${sliderProgress * 0.6}% + 10px)`,
                  width: '40px',
                  height: '40px',
                  backgroundColor: globalStyles.buttonColor,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transition: isDragging ? 'none' : 'left 0.3s',
                  userSelect: 'none',
                  opacity: isVerified ? 0.8 : 1,
                }}
              >
                <span style={{ color: globalStyles.buttonTextColor, fontSize: '20px' }}>{isVerified ? '✓' : '🧩'}</span>
              </div>
              {/* Target slot */}
              <div style={{
                position: 'absolute',
                right: '20px',
                width: '44px',
                height: '44px',
                border: `2px dashed ${isVerified ? globalStyles.buttonColor : globalStyles.buttonColor}`,
                borderRadius: '6px',
                backgroundColor: isVerified ? `${globalStyles.buttonColor}30` : 'transparent',
                transition: 'background-color 0.3s',
              }} />
            </div>
            <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '10px' }}>
              {isVerified ? 'Verificação concluída' : 'Arraste a peça para o lugar'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPopupContent = () => {
    switch (popupType) {
      case 'cookies':
        return renderCookiesPopup();
      case 'country':
        return renderCountryPopup();
      case 'gender':
        return renderGenderPopup();
      case 'age':
        return renderAgePopup();
      case 'captcha':
        return renderCaptchaPopup();
      default:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: globalStyles.textColor, fontSize: '12px' }}>Selecione um tipo de popup</p>
          </div>
        );
    }
  };

  const templateStyles = getTemplateStyles();

  // Get position styles for predefined positions
  const getPositionStyles = (): React.CSSProperties => {
    if (popupPosition === 'custom') {
      // For custom position, we use the DraggablePopup component instead
      return {};
    }
    
    const position = popupPosition || 'center';
    const base: React.CSSProperties = {
      position: 'absolute',
      padding: '16px',
    };
    
    switch (position) {
      case 'top':
        return { ...base, top: '16px', left: '50%', transform: 'translateX(-50%)' };
      case 'top-left':
        return { ...base, top: '16px', left: '16px' };
      case 'top-right':
        return { ...base, top: '16px', right: '16px' };
      case 'bottom':
        return { ...base, bottom: '16px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-left':
        return { ...base, bottom: '16px', left: '16px' };
      case 'bottom-right':
        return { ...base, bottom: '16px', right: '16px' };
      case 'center':
      default:
        return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const positionStyles = getPositionStyles();
  const isCustomPosition = popupPosition === 'custom';
  const currentCustomPosition = customPosition || { x: 50, y: 50 };

  const handlePositionChange = (newPosition: CustomPosition) => {
    onPositionChange?.(newPosition);
  };

  const popupContent = (
    <div
      style={{
        backgroundColor: globalStyles.backgroundColor,
        fontFamily: globalStyles.fontFamily,
        ...templateStyles,
      }}
    >
      {renderPopupContent()}
    </div>
  );

  // Get background style based on config
  const getBackgroundStyle = () => {
    if (config.useDefaultBackground) {
      const selectedBg = defaultBackgrounds.find(bg => bg.id === config.defaultBackgroundId);
      return selectedBg?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    return null;
  };

  const backgroundGradient = getBackgroundStyle();

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-lg" style={{ backgroundColor: '#1a1a2e' }}>
      {backgroundGradient ? (
        <div 
          className="absolute inset-0" 
          style={{ background: backgroundGradient }} 
        />
      ) : currentScreenshot ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${currentScreenshot})` }} 
        />
      ) : (
        <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
      )}
      <div className="absolute inset-0 transition-opacity duration-300" style={{ backgroundColor: `rgba(0,0,0,${globalStyles.overlayOpacity})` }} />
      
      {isCustomPosition ? (
        <DraggablePopup
          position={currentCustomPosition}
          onPositionChange={handlePositionChange}
          containerRef={containerRef}
          popupWidth={popupWidth}
          isEnabled={true}
        >
          <div style={{
            backgroundColor: globalStyles.backgroundColor,
            fontFamily: globalStyles.fontFamily,
            ...templateStyles,
          }}>
            {renderPopupContent()}
          </div>
        </DraggablePopup>
      ) : (
        <div
          className="transition-all duration-300"
          style={{
            ...positionStyles,
            width: popupWidth,
            maxWidth: '90%',
            backgroundColor: globalStyles.backgroundColor,
            fontFamily: globalStyles.fontFamily,
            ...templateStyles,
          }}
        >
          {renderPopupContent()}
        </div>
      )}
      
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
        Template {popupTemplate}
      </div>
    </div>
  );
}
