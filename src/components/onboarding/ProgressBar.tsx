import React from 'react';

interface Props {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: Props) {
  const progress = (step / totalSteps) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div style={{ width: '100%', maxWidth: '48rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
          }}>
            Progression
          </span>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
          }}>
            ÉTAPE {step} SUR {totalSteps}
          </span>
        </div>
        <div style={{
          height: '2px',
          width: '100%',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: '#FFFFFF',
            borderRadius: '9999px',
            width: `${progress}%`,
            transition: 'width 0.7s ease-out',
          }} />
        </div>
      </div>
    </div>
  );
}
