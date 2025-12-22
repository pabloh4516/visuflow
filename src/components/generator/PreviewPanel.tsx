import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { GeneratorConfig, PopupTemplate, PopupSize, defaultBackgrounds } from '@/types/generator';

interface PreviewPanelProps {
  config: GeneratorConfig;
  device?: 'desktop' | 'mobile';
}

const sizeMap: Record<PopupSize, { desktop: string; mobile: string }> = {
  small: { desktop: '320px', mobile: '85%' },
  medium: { desktop: '420px', mobile: '90%' },
  large: { desktop: '520px', mobile: '95%' },
};

export const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(({ config, device = 'desktop' }, ref) => {
  const viewMode = device;
  
  const { globalStyles, popupConfig, popupType, popupTemplate, popupSize } = config;

  const popupWidth = viewMode === 'mobile' ? sizeMap[popupSize].mobile : sizeMap[popupSize].desktop;

  // ==================== COOKIES TEMPLATES ====================
  const renderCookiesTemplate1 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍪</div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
        {popupConfig.title || 'Este site utiliza cookies'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
        {popupConfig.description || 'Utilizamos cookies para melhorar sua experiência.'}
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '10px 28px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
          {popupConfig.primaryButtonText || 'Aceitar'}
        </button>
        <button style={{ backgroundColor: 'transparent', color: globalStyles.textColor, padding: '10px 20px', borderRadius: '8px', border: `1px solid ${globalStyles.textColor}30`, fontWeight: '500', fontSize: '14px' }}>
          {popupConfig.secondaryButtonText || 'Recusar'}
        </button>
      </div>
    </div>
  );

  const renderCookiesTemplate2 = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${globalStyles.buttonColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '24px' }}>🔒</span>
        </div>
        <div>
          <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {popupConfig.title || 'Sua privacidade'}
          </h2>
          <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '13px', lineHeight: '1.5' }}>
            {popupConfig.description || 'Usamos cookies para personalizar sua experiência.'}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <button style={{ flex: 1, backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
          {popupConfig.primaryButtonText || 'Aceitar Todos'}
        </button>
        <button style={{ flex: 1, backgroundColor: `${globalStyles.textColor}10`, color: globalStyles.textColor, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '500', fontSize: '14px' }}>
          {popupConfig.secondaryButtonText || 'Configurar'}
        </button>
      </div>
    </div>
  );

  const renderCookiesTemplate3 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
        {popupConfig.title || 'Cookies'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '12px', marginBottom: '20px' }}>
        {popupConfig.description || 'Ao continuar, você aceita nossa política de cookies.'}
      </p>
      <button style={{ width: '100%', backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
        {popupConfig.primaryButtonText || 'OK'}
      </button>
    </div>
  );

  const renderCookiesTemplate4 = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '700' }}>
          🇪🇺 GDPR Consent
        </h2>
      </div>
      <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '12px', marginBottom: '16px', lineHeight: '1.6' }}>
        {popupConfig.description || 'Este site utiliza cookies essenciais e de análise conforme a GDPR. Você pode gerenciar suas preferências a qualquer momento.'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '13px' }}>
          ✓ Aceitar Todos os Cookies
        </button>
        <button style={{ backgroundColor: 'transparent', color: globalStyles.textColor, padding: '10px', borderRadius: '6px', border: `1px solid ${globalStyles.textColor}25`, fontWeight: '500', fontSize: '13px' }}>
          Apenas Essenciais
        </button>
        <button style={{ backgroundColor: 'transparent', color: globalStyles.buttonColor, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: '500', fontSize: '12px' }}>
          Gerenciar Preferências
        </button>
      </div>
    </div>
  );

  const renderCookiesTemplate5 = () => (
    <div style={{ borderLeft: `4px solid ${globalStyles.buttonColor}`, paddingLeft: '16px' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        {popupConfig.title || '🍪 Aviso de Cookies'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '12px', marginBottom: '16px', lineHeight: '1.5' }}>
        {popupConfig.description}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '8px 20px', borderRadius: '20px', border: 'none', fontWeight: '600', fontSize: '12px' }}>
          {popupConfig.primaryButtonText || 'Aceitar'}
        </button>
        <button style={{ backgroundColor: 'transparent', color: globalStyles.textColor, opacity: 0.7, padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: '500', fontSize: '12px' }}>
          {popupConfig.secondaryButtonText || 'Mais Info'}
        </button>
      </div>
    </div>
  );

  // ==================== COUNTRY TEMPLATES ====================
  const renderCountryTemplate1 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
        {popupConfig.title || 'Selecione seu país'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(popupConfig.countries || []).map((country, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : 'transparent', color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '14px 20px', borderRadius: '10px', border: i === 0 ? 'none' : `1px solid ${globalStyles.textColor}20`, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', fontSize: '14px' }}>
            <span style={{ fontSize: '28px' }}>{country.flag}</span>
            {country.name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCountryTemplate2 = () => (
    <div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
        🌍 {popupConfig.title || 'Escolha sua localização'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(popupConfig.countries || []).map((country, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? `${globalStyles.buttonColor}15` : 'transparent', color: globalStyles.textColor, padding: '12px 16px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: i === 0 ? '600' : '400', fontSize: '14px', textAlign: 'left' }}>
            <span style={{ fontSize: '20px' }}>{country.flag}</span>
            {country.name}
            {i === 0 && <span style={{ marginLeft: 'auto', color: globalStyles.buttonColor }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCountryTemplate3 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
        {popupConfig.title || 'Seu País'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {(popupConfig.countries || []).map((country, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : `${globalStyles.textColor}08`, color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '16px 8px', borderRadius: '12px', border: i === 0 ? 'none' : `1px solid ${globalStyles.textColor}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '11px' }}>
            <span style={{ fontSize: '32px' }}>{country.flag}</span>
            {country.name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCountryTemplate4 = () => (
    <div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
        {popupConfig.title || 'Selecione o país'}
      </h2>
      <div style={{ backgroundColor: `${globalStyles.textColor}08`, borderRadius: '8px', padding: '4px' }}>
        <select style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: globalStyles.textColor, border: 'none', fontSize: '14px', outline: 'none' }}>
          {(popupConfig.countries || []).map((country, i) => (
            <option key={i} value={country.code}>{country.flag} {country.name}</option>
          ))}
        </select>
      </div>
      <button style={{ width: '100%', marginTop: '16px', backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
        Confirmar
      </button>
    </div>
  );

  const renderCountryTemplate5 = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🗺️</div>
        <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '700' }}>
          {popupConfig.title || 'De onde você é?'}
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {(popupConfig.countries || []).map((country, i) => (
          <button key={i} style={{ backgroundColor: globalStyles.backgroundColor, color: globalStyles.textColor, padding: '14px 16px', borderRadius: '12px', border: `2px solid ${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '15'}`, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', fontSize: '14px', boxShadow: i === 0 ? `0 0 0 3px ${globalStyles.buttonColor}20` : 'none' }}>
            <span style={{ fontSize: '24px' }}>{country.flag}</span>
            {country.name}
          </button>
        ))}
      </div>
    </div>
  );

  // ==================== GENDER TEMPLATES ====================
  const renderGenderTemplate1 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
        {popupConfig.title || 'Selecione seu gênero'}
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {(popupConfig.genderOptions || []).map((option, i) => {
          const icons = ['👨', '👩', '🧑'];
          return (
            <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : `${globalStyles.textColor}08`, color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '20px 24px', borderRadius: '16px', border: i === 0 ? 'none' : `1px solid ${globalStyles.textColor}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '13px' }}>
              <span style={{ fontSize: '36px' }}>{icons[i] || '🧑'}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderGenderTemplate2 = () => (
    <div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
        {popupConfig.title || 'Gênero'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(popupConfig.genderOptions || []).map((option, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : 'transparent', color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '14px 20px', borderRadius: '10px', border: i === 0 ? 'none' : `1px solid ${globalStyles.textColor}20`, fontWeight: '500', fontSize: '14px', textAlign: 'center' }}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderGenderTemplate3 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
        {popupConfig.title || 'Como você se identifica?'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(popupConfig.genderOptions?.length || 3, 3)}, 1fr)`, gap: '10px' }}>
        {(popupConfig.genderOptions || []).map((option, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : globalStyles.backgroundColor, color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '16px 12px', borderRadius: '12px', border: `2px solid ${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '20'}`, fontWeight: '600', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderGenderTemplate4 = () => (
    <div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
        {popupConfig.title || 'Gênero'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(popupConfig.genderOptions || []).map((option, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: i === 0 ? `${globalStyles.buttonColor}10` : 'transparent', cursor: 'pointer' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '40'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 0 && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: globalStyles.buttonColor }} />}
            </div>
            <span style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: i === 0 ? '600' : '400' }}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderGenderTemplate5 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: `${globalStyles.buttonColor}15`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '28px' }}>⚧</span>
      </div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
        {popupConfig.title || 'Seu Gênero'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.6, fontSize: '12px', marginBottom: '20px' }}>
        Selecione uma opção para continuar
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(popupConfig.genderOptions || []).map((option, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : 'transparent', color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '12px', borderRadius: '25px', border: i === 0 ? 'none' : `1px solid ${globalStyles.textColor}25`, fontWeight: '500', fontSize: '14px' }}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ==================== AGE TEMPLATES ====================
  const renderAgeTemplate1 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔞</div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
        {popupConfig.title || 'Verificação de Idade'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>
        {popupConfig.description || 'Você tem 18 anos ou mais?'}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button style={{ backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '14px 40px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '15px' }}>
          SIM
        </button>
        <button style={{ backgroundColor: `${globalStyles.textColor}10`, color: globalStyles.textColor, padding: '14px 40px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '15px' }}>
          NÃO
        </button>
      </div>
    </div>
  );

  const renderAgeTemplate2 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
        {popupConfig.title || 'Confirme sua idade'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.7, fontSize: '13px', marginBottom: '20px' }}>
        {popupConfig.description}
      </p>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '10px', backgroundColor: `${globalStyles.buttonColor}10`, cursor: 'pointer', justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${globalStyles.buttonColor}`, backgroundColor: globalStyles.buttonColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: globalStyles.buttonTextColor, fontSize: '14px' }}>✓</span>
        </div>
        <span style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '500' }}>Tenho 18 anos ou mais</span>
      </label>
      <button style={{ width: '100%', marginTop: '16px', backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
        Confirmar
      </button>
    </div>
  );

  const renderAgeTemplate3 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
        {popupConfig.title || 'Qual sua faixa etária?'}
      </h2>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ height: '6px', backgroundColor: `${globalStyles.textColor}15`, borderRadius: '3px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '60%', backgroundColor: globalStyles.buttonColor, borderRadius: '3px' }} />
          <div style={{ position: 'absolute', left: '60%', top: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', backgroundColor: globalStyles.buttonColor, borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: globalStyles.textColor, opacity: 0.6, fontSize: '11px' }}>
          <span>13</span><span>18</span><span>21</span><span>25+</span>
        </div>
      </div>
      <button style={{ width: '100%', backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
        Continuar
      </button>
    </div>
  );

  const renderAgeTemplate4 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
        {popupConfig.title || 'Selecione sua idade'}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {(popupConfig.ageOptions || ['+18', '+21', '+25']).map((age, i) => (
          <button key={i} style={{ backgroundColor: i === 0 ? globalStyles.buttonColor : 'transparent', color: i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor, padding: '12px 24px', borderRadius: '25px', border: i === 0 ? 'none' : `2px solid ${globalStyles.textColor}20`, fontWeight: '600', fontSize: '14px' }}>
            {age}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAgeTemplate5 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
        {popupConfig.title || 'Data de Nascimento'}
      </h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input placeholder="DD" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${globalStyles.textColor}20`, backgroundColor: 'transparent', color: globalStyles.textColor, textAlign: 'center', fontSize: '14px' }} />
        <input placeholder="MM" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${globalStyles.textColor}20`, backgroundColor: 'transparent', color: globalStyles.textColor, textAlign: 'center', fontSize: '14px' }} />
        <input placeholder="AAAA" style={{ flex: 1.5, padding: '12px', borderRadius: '8px', border: `1px solid ${globalStyles.textColor}20`, backgroundColor: 'transparent', color: globalStyles.textColor, textAlign: 'center', fontSize: '14px' }} />
      </div>
      <button style={{ width: '100%', backgroundColor: globalStyles.buttonColor, color: globalStyles.buttonTextColor, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
        Verificar Idade
      </button>
    </div>
  );

  // ==================== CAPTCHA TEMPLATES ====================
  const renderCaptchaTemplate1 = () => (
    <div style={{ backgroundColor: '#f9f9f9', borderRadius: '4px', padding: '16px', border: '1px solid #d3d3d3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid #c1c1c1', borderRadius: '2px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#4caf50', fontSize: '18px' }}>✓</span>
        </div>
        <span style={{ color: '#4b4b4b', fontSize: '14px' }}>{popupConfig.primaryButtonText || 'Não sou um robô'}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%234285f4' d='M32 13v19l16 9.3'/%3E%3Cpath fill='%23ea4335' d='M32 13v19l-16 9.3'/%3E%3Cpath fill='%2334a853' d='M32 32l16 9.3L32 51z'/%3E%3Cpath fill='%23fbbc05' d='M32 32L16 41.3 32 51z'/%3E%3C/svg%3E" alt="" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '8px', color: '#555', marginTop: '2px' }}>reCAPTCHA</span>
        </div>
      </div>
    </div>
  );

  const renderCaptchaTemplate2 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: '#f6821f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: '18px' }}>☁</span>
        </div>
        <span style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600' }}>Cloudflare</span>
      </div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
        {popupConfig.title || 'Verificando seu navegador'}
      </h2>
      <p style={{ color: globalStyles.textColor, opacity: 0.6, fontSize: '12px', marginBottom: '20px' }}>
        {popupConfig.description || 'Este processo é automático.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: globalStyles.buttonColor, opacity: 0.3 + i * 0.3 }} />
        ))}
      </div>
    </div>
  );

  const renderCaptchaTemplate3 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', backgroundColor: '#0074bf', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: '24px', fontWeight: '700' }}>h</span>
      </div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
        {popupConfig.title || 'Verificação hCaptcha'}
      </h2>
      <button style={{ width: '100%', backgroundColor: '#00838f', color: '#fff', padding: '12px', borderRadius: '4px', border: 'none', fontWeight: '600', fontSize: '14px' }}>
        {popupConfig.primaryButtonText || 'Verificar'}
      </button>
    </div>
  );

  const renderCaptchaTemplate4 = () => (
    <div>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
        {popupConfig.title || 'Deslize para verificar'}
      </h2>
      <div style={{ position: 'relative', height: '44px', backgroundColor: `${globalStyles.textColor}10`, borderRadius: '22px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '30%', backgroundColor: globalStyles.buttonColor, borderRadius: '22px' }} />
        <div style={{ position: 'absolute', left: 'calc(30% - 20px)', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: globalStyles.buttonColor }}>→</span>
        </div>
      </div>
      <p style={{ color: globalStyles.textColor, opacity: 0.5, fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
        Arraste para a direita
      </p>
    </div>
  );

  const renderCaptchaTemplate5 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: globalStyles.textColor, fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
        {popupConfig.title || 'Complete o puzzle'}
      </h2>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: `${globalStyles.textColor}10`, borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: globalStyles.buttonColor, borderRadius: '8px', opacity: 0.5 }} />
        <div style={{ position: 'absolute', left: '20%', width: '40px', height: '40px', border: `3px dashed ${globalStyles.buttonColor}`, borderRadius: '8px' }} />
      </div>
      <p style={{ color: globalStyles.textColor, opacity: 0.6, fontSize: '12px' }}>
        Arraste a peça para o local correto
      </p>
    </div>
  );

  // ==================== TEMPLATE MAPPING ====================
  const templateRenderers: Record<string, Record<PopupTemplate, () => JSX.Element>> = {
    cookies: { 1: renderCookiesTemplate1, 2: renderCookiesTemplate2, 3: renderCookiesTemplate3, 4: renderCookiesTemplate4, 5: renderCookiesTemplate5 },
    country: { 1: renderCountryTemplate1, 2: renderCountryTemplate2, 3: renderCountryTemplate3, 4: renderCountryTemplate4, 5: renderCountryTemplate5 },
    gender: { 1: renderGenderTemplate1, 2: renderGenderTemplate2, 3: renderGenderTemplate3, 4: renderGenderTemplate4, 5: renderGenderTemplate5 },
    age: { 1: renderAgeTemplate1, 2: renderAgeTemplate2, 3: renderAgeTemplate3, 4: renderAgeTemplate4, 5: renderAgeTemplate5 },
    captcha: { 1: renderCaptchaTemplate1, 2: renderCaptchaTemplate2, 3: renderCaptchaTemplate3, 4: renderCaptchaTemplate4, 5: renderCaptchaTemplate5 },
  };

  const renderPopupContent = () => {
    const renderer = templateRenderers[popupType]?.[popupTemplate];
    return renderer ? renderer() : null;
  };

  // Get background style based on config
  const getBackgroundStyle = () => {
    if (config.useDefaultBackground) {
      const selectedBg = defaultBackgrounds.find(bg => bg.id === config.defaultBackgroundId);
      return { gradient: selectedBg?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', image: null };
    }
    
    // Use manual screenshots if enabled, otherwise use captured screenshots
    const backgroundImage = config.useManualScreenshots 
      ? (viewMode === 'desktop' ? config.manualDesktopScreenshot : config.manualMobileScreenshot)
      : (viewMode === 'desktop' ? config.desktopScreenshot : config.mobileScreenshot);
    
    return { gradient: null, image: backgroundImage };
  };

  const { gradient: bgGradient, image: backgroundImage } = getBackgroundStyle();
  
  // Log for debugging
  if (backgroundImage) {
    console.log('Preview background image:', backgroundImage.substring(0, 100) + '...');
  }

  return (
    <div ref={ref} className="w-full h-full">
      
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{ 
          background: bgGradient || undefined,
          backgroundImage: !bgGradient && backgroundImage ? `url("${backgroundImage}")` : (!bgGradient ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined), 
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {!bgGradient && backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover object-top"
            onError={(e) => {
              console.error('Failed to load screenshot:', backgroundImage);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log('Screenshot loaded successfully')}
          />
        )}
        
        <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0, 0, 0, ${globalStyles.overlayOpacity})`, zIndex: 1 }} />
        
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: globalStyles.backgroundColor, borderRadius: '16px', padding: viewMode === 'mobile' ? '20px' : '28px', width: popupWidth, maxWidth: '95%', fontFamily: globalStyles.fontFamily, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', zIndex: 2 }}>
          {renderPopupContent()}
        </div>
      </div>
    </div>
  );
});

PreviewPanel.displayName = 'PreviewPanel';
