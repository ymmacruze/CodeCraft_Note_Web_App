import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout';
import {
  DashboardPage,
  EditorPage,
  FavoritesPage,
  ArchivePage,
  SettingsPage,
} from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'note/:id',
        element: <EditorPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'archive',
        element: <ArchivePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
