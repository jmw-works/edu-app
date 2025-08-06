// src/components/CampaignCard.tsx
import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { Card, Image, Text, View } from '@aws-amplify/ui-react';

interface CampaignCardProps {
  title: string;
  description?: string;
  thumbnailKey?: string | null;
  onSelect: () => void;
}

export default function CampaignCard({
  title,
  description,
  thumbnailKey,
  onSelect,
}: CampaignCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!thumbnailKey) return;

    getUrl({ key: thumbnailKey })
      .then((result) => {
        setThumbnailUrl(result.url.toString());
      })
      .catch((err) => {
        console.error('Error fetching thumbnail:', err);
        setThumbnailUrl(null);
      });
  }, [thumbnailKey]);

  return (
    <Card
      variation="outlined"
      padding="medium"
      borderRadius="medium"
      boxShadow="small"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        width: 300,
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s',
      }}
    >
      <View style={{ height: 180, overflow: 'hidden', borderRadius: 8 }}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              color: '#6b7280',
              padding: 12,
              textAlign: 'center',
            }}
          >
            No image available
          </View>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text fontSize="1.1rem" fontWeight="bold" marginBottom="xs">
          {title}
        </Text>
        {description && (
          <Text fontSize="0.95rem" color="font.secondary">
            {description}
          </Text>
        )}
      </View>
    </Card>
  );
}




