import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';
import EspacioFinal from '../../assets/images/7.1 - espacio-final.svg';
import RanaFinal from '../../assets/images/7.0 - rana-final.svg';
import Rana from '../../assets/images/7 - rana.svg';
import RanaCola from '../../assets/images/6 - rana-con-cola.svg';
import RenacuajoPatas from '../../assets/images/5 - renacuajo-4-patas.svg';
import RenacuajoSinPatas from '../../assets/images/3 - renacuajo-sin-patas.svg';
import Renacuajo from '../../assets/images/2 - renacuajo.svg';
import Huevo from '../../assets/images/1 - huevo.svg';

type SvgAsset = React.ComponentType<SvgProps>;

export interface PetImageAsset {
  key: string;
  label: string;
  source?: ImageSourcePropType;
  svg?: SvgAsset;
}

export const PET_IMAGE_ASSETS: PetImageAsset[] = [
  { key: 'asset:adaptive-icon.png', label: 'Icono adaptativo', source: require('../../assets/images/adaptive-icon.png') },
  { key: 'asset:emocion-calma.png', label: 'Calma', source: require('../../assets/images/emocion-calma.png') },
  { key: 'asset:emocion-felicidad.png', label: 'Felicidad', source: require('../../assets/images/emocion-felicidad.png') },
  { key: 'asset:emocion-ira.png', label: 'Ira', source: require('../../assets/images/emocion-ira.png') },
  { key: 'asset:emocion-neutral.png', label: 'Neutral', source: require('../../assets/images/emocion-neutral.png') },
  { key: 'asset:emocion-preocupacion.png', label: 'Preocupación', source: require('../../assets/images/emocion-preocupacion.png') },
  { key: 'asset:emocion-tristeza.png', label: 'Tristeza', source: require('../../assets/images/emocion-tristeza.png') },
  { key: 'asset:kii-pensanding.png', label: 'Kii pensando', source: require('../../assets/images/kii-pensanding.png') },
  { key: 'asset:kii-relajado.png', label: 'Kii relajado', source: require('../../assets/images/kii-relajado.png') },
  { key: 'asset:logo-keeper-go.png', label: 'Logo KeeperGo', source: require('../../assets/images/logo-keeper-go.png') },
  { key: 'asset:LogoKepperGo.jpeg', label: 'Logo KeeperGo JPEG', source: require('../../assets/images/LogoKepperGo.jpeg') },
  { key: 'asset:icon.png', label: 'Icono', source: require('../../assets/images/icon.png') },
  { key: 'asset:favicon.png', label: 'Favicon', source: require('../../assets/images/favicon.png') },
  { key: 'asset:splash-icon.png', label: 'Icono de inicio', source: require('../../assets/images/splash-icon.png') },
  { key: 'asset:7.1 - espacio-final.svg', label: 'Espacio final', svg: EspacioFinal },
  { key: 'asset:7.0 - rana-final.svg', label: 'Rana final', svg: RanaFinal },
  { key: 'asset:7 - rana.svg', label: 'Rana', svg: Rana },
  { key: 'asset:6 - rana-con-cola.svg', label: 'Rana con cola', svg: RanaCola },
  { key: 'asset:5 - renacuajo-4-patas.svg', label: 'Renacuajo con patas', svg: RenacuajoPatas },
  { key: 'asset:3 - renacuajo-sin-patas.svg', label: 'Renacuajo sin patas', svg: RenacuajoSinPatas },
  { key: 'asset:2 - renacuajo.svg', label: 'Renacuajo', svg: Renacuajo },
  { key: 'asset:1 - huevo.svg', label: 'Huevo', svg: Huevo },
];

export function getPetImageAsset(imageUrl?: string | null): PetImageAsset | null {
  if (!imageUrl) return null;
  return PET_IMAGE_ASSETS.find((asset) => asset.key === imageUrl) ?? null;
}

export function getPetImageSource(imageUrl?: string | null): ImageSourcePropType | { uri: string } | null {
  if (!imageUrl) return null;
  return getPetImageAsset(imageUrl)?.source ?? { uri: imageUrl };
}

export function getPetImageLabel(imageUrl?: string | null): string {
  return getPetImageAsset(imageUrl)?.label ?? '';
}

interface PetImageProps {
  imageUrl: string;
  width: number;
  height: number;
  style?: object;
}

export function PetImage({ imageUrl, width, height, style }: PetImageProps) {
  const asset = getPetImageAsset(imageUrl);
  if (asset?.svg) {
    const SvgImage = asset.svg;
    return <SvgImage width={width} height={height} style={style} preserveAspectRatio="xMidYMid meet" />;
  }

  return <Image source={asset?.source ?? { uri: imageUrl }} style={[{ width, height }, style]} resizeMode="contain" />;
}
