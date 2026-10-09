import React from 'react';
import { NavigationBar } from './m3e/NavigationBar';
import { FloatingAddButton } from './FloatingAddButton';

export const BottomNav: React.FC = () => {
  return <NavigationBar trailingAction={<FloatingAddButton isInline={true} />} />;
};
