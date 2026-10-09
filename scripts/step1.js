const fs = require('fs');

const p1 = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  Check,
  Zap,
  Palette,
  Shapes,
  Type,
  Activity,
  Copy,
  Sparkles,
  LayoutGrid,
  Search,
  Plus,
  Brain,
  Sliders,
  Trash2,
  FileText,
  Bookmark,
} from 'lucide-react';
import {
  SEED_PRESETS,
  SUBJECT_SWATCH_SHAPES,
  generateExpressiveScheme,
  getHarmonizedSubjectColors,
  getContrastRatio,
  isWcagAa,
  ThemeMode,
} from '../../theme/colors';
import {
  SHAPE_NAMES,
  Shape,
  ShapeName,
  getShapePoints,
  interpolatePoints,
  pointsToSvgPath,
} from '../../theme/shapes';
import { useSettingsStore } from '../../store/useSettingsStore';
import { spring } from '../../theme/motion';
import { motion } from 'framer-motion';

import {
  Button,
  ToggleButton,
  ButtonGroup,
  SplitButton,
  Chip,
  ShapeBadge,
  SearchBar,
  Switch,
  Slider,
  SheetCard,
  Dialog,
  Snackbar,
  LoadingIndicator,
  WavyProgress,
  ScallopRing,
} from '../../components/m3e';

type Tab = 'components' | 'colors' | 'shapes' | 'typography' | 'motion';
`;
fs.writeFileSync('scripts/part1.txt', p1, 'utf8');
