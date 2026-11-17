/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { AuthFlow } from './components/AuthFlow';
import { ClientEnvironment } from './components/client/ClientEnvironment';
import { TrainerEnvironment } from './components/trainer/TrainerEnvironment';
import { AdminEnvironment } from './components/admin/AdminEnvironment';
import { ToastContainer } from './components/NotificationsDrawer';

const AppRouter: React.FC = () => {
  const { currentUser } = useAppState();

  if (!currentUser) {
    return <AuthFlow />;
  }

  switch (currentUser.role) {
    case 'cliente':
      return <ClientEnvironment />;
    case 'trainer':
      return <TrainerEnvironment />;
    case 'admin':
      return <AdminEnvironment />;
  }
};

export default function App() {
  return (
    <AppStateProvider>
      <ToastContainer />
      <AppRouter />
    </AppStateProvider>
  );
}
