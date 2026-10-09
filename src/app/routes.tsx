import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomeScreen = lazy(() => import('../features/home/HomeScreen').then(m => ({ default: m.HomeScreen })));
const ShelfScreen = lazy(() => import('../features/shelf/ShelfScreen').then(m => ({ default: m.ShelfScreen })));
const LibraryScreen = lazy(() => import('../features/library/LibraryScreen').then(m => ({ default: m.LibraryScreen })));
const CoachScreen = lazy(() => import('../features/coach/CoachScreen').then(m => ({ default: m.CoachScreen })));
const QuizScreen = lazy(() => import('../features/quiz/QuizScreen').then(m => ({ default: m.QuizScreen })));
const LinksScreen = lazy(() => import('../features/links/LinksScreen').then(m => ({ default: m.LinksScreen })));
const ReaderScreen = lazy(() => import('../features/reader/ReaderScreen').then(m => ({ default: m.ReaderScreen })));
const SettingsScreen = lazy(() => import('../features/settings/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const DevGalleryScreen = lazy(() => import('../features/dev/DevGalleryScreen').then(m => ({ default: m.DevGalleryScreen })));

export const routes: RouteObject[] = [
  { path: '/', element: <HomeScreen onNavigateTab={(tab) => { window.location.href = tab === 'home' ? '/' : '/' + tab; }} /> },
  { path: '/shelf', element: <ShelfScreen /> },
  { path: '/library', element: <LibraryScreen /> },
  { path: '/coach', element: <CoachScreen /> },
  { path: '/quiz', element: <QuizScreen /> },
  { path: '/links', element: <LinksScreen /> },
  { path: '/reader/:id', element: <ReaderScreen /> },
  { path: '/more', element: <SettingsScreen /> },
  { path: '/settings', element: <SettingsScreen /> },
  { path: '/dev/gallery', element: <DevGalleryScreen /> },
];
