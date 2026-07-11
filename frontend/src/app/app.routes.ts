import { Routes } from '@angular/router';

import { ApplicationDetail } from './pages/application-detail/application-detail';
import { ApplicationForm } from './pages/application-form/application-form';
import { ApplicationList } from './pages/application-list/application-list';
import { Login } from './pages/login/login';
import { ModificationList } from './pages/modification-list/modification-list';
import { ModificationReview } from './pages/modification-review/modification-review';
import { PhaseUpdateList } from './pages/phase-update-list/phase-update-list';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'applications',
        component: ApplicationList
    },
    {
        path: 'modifications',
        component: ModificationList
    },
    {
        path: 'phase-updates',
        component: PhaseUpdateList
    },
    {
        path: 'applications/new',
        component: ApplicationForm
    },
    {
        path: 'applications/:applicationId',
        component: ApplicationDetail
    },
    {
        path: 'applications/:applicationId/edit',
        component: ApplicationForm
    },
    {
        path: 'modification-logs/:logId',
        component: ModificationReview
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];