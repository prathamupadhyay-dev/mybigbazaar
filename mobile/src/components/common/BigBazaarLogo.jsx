import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getLogoApi, getCachedLogoUrl } from '../../services/logoApi';

const LOCAL_FALLBACK = require('../../../assets/client-logo.png');

export const BigBazaarLogo = ({
  size = 'large',
  style
}) => {
  const [logoUri, setLogoUri] = useState(null);
  const imageSize = size === 'small' ? 44 : size === 'medium' ? 84 : 140;

  useEffect(() => {
    let isMounted = true;
    getCachedLogoUrl().then((cached) => {
      if (isMounted && cached) setLogoUri(cached);
    });

    getLogoApi().then((res) => {
      if (isMounted && res?.url) setLogoUri(res.url);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoUri ? { uri: logoUri } : LOCAL_FALLBACK}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BigBazaarLogo;