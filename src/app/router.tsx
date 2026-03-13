import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { ScenarioFormPage } from '@/pages/scenario-form-page';
import { ComparePage } from '@/pages/compare-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { SettingsPage } from '@/pages/settings-page';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="scenarios/new" element={<ScenarioFormPage mode="create" />} />
        <Route path="scenarios/:id/edit" element={<ScenarioFormPage mode="edit" />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
  );
}
