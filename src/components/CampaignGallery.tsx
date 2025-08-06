// src/components/CampaignGallery.tsx
import { memo, type CSSProperties } from 'react';
import { useCampaignThumbnail } from '../hooks/useCampaignThumbnail';


export type CampaignCard = {
  id: string;
  title: string;
  description?: string | null;
  order?: number | null;
  isActive?: boolean | null;
  locked?: boolean; // from useCampaigns hook
  // Thumbnails
  thumbnailKey?: string | null;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
};

type Props = {
  campaigns: CampaignCard[];
  loading?: boolean;
  activeCampaignId: string | null;
  onSelect: (campaignId: string) => void;
};

const containerStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  overflowX: 'auto',
  padding: '8px 0',
  scrollbarWidth: 'thin',
};

const cardStyle: CSSProperties = {
  minWidth: 220,
  maxWidth: 240,
  flex: '0 0 auto',
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  background: '#fff',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const thumbStyle: CSSProperties = {
  width: '100%',
  height: 120,
  objectFit: 'cover',
  background: '#F3F4F6',
};

const contentStyle: CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const titleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
};

const descStyle: CSSProperties = {
  fontSize: 13,
  color: '#4B5563',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

function CampaignCardView({
  c,
  active,
  onClick,
}: {
  c: CampaignCard;
  active: boolean;
  onClick: () => void;
}) {
  const { url } = useCampaignThumbnail({
    key: c.thumbnailKey ?? undefined,
    fallbackUrl: c.thumbnailUrl ?? undefined,
  });

  return (
    <div
      role="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        ...cardStyle,
        outline: active ? '2px solid #2563EB' : 'none',
      }}
    >
      {/* Thumbnail */}
      {url ? (
        <img
          src={url}
          alt={c.thumbnailAlt ?? `${c.title} thumbnail`}
          style={thumbStyle}
          draggable={false}
        />
      ) : (
        <div style={{ ...thumbStyle, display: 'grid', placeItems: 'center', color: '#9CA3AF' }}>
          No image
        </div>
      )}

      {/* Content */}
      <div style={contentStyle}>
        <h4 style={titleStyle}>
          {c.title}
          {c.locked ? ' 🔒' : ''}
        </h4>
        {c.description ? <p style={descStyle}>{c.description}</p> : null}
      </div>
    </div>
  );
}

function CampaignGalleryInner({
  campaigns,
  loading,
  activeCampaignId,
  onSelect,
}: Props) {
  if (loading) return <div>Loading campaigns…</div>;
  if (!campaigns?.length) return <div>No campaigns yet.</div>;

  return (
    <div style={containerStyle}>
      {campaigns.map((c) => (
        <CampaignCardView
          key={c.id}
          c={c}
          active={c.id === activeCampaignId}
          onClick={() => !c.locked && onSelect(c.id)}
        />
      ))}
    </div>
  );
}

export default memo(CampaignGalleryInner);


