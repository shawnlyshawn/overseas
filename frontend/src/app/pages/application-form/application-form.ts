import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Application, ApplicationStatus, ExpectedMobilityPeriod } from '../../models/application.model';
import { HostInstitution } from '../../models/host-institution.model';
import { User, UserRole } from '../../models/user.model';
import { ApplicationService } from '../../services/application.service';
import { HostInstitutionService } from '../../services/host-institution.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-application-form',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './application-form.html',
    styleUrl: './application-form.css'
})
export class ApplicationForm implements OnInit {
    hostInstitutions: HostInstitution[] = [];
    lecturers: User[] = [];

    academicYearOptions: string[] = this.createAcademicYearOptions();

    currentUserRole: UserRole | null = null;
    isEditMode = false;
    isLoading = false;
    isSubmitting = false;
    errorMessage = '';

    currentApplicationStatus: ApplicationStatus | null = null;

    private applicationId: string | null = null;

    applicationForm = new FormGroup({
        academicYear: new FormControl(this.academicYearOptions[0], {
            nonNullable: true,
            validators: [Validators.required]
        }),
        expectedMobilityPeriod: new FormControl<ExpectedMobilityPeriod>('first_semester', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        hostInstitution: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        referentLecturer: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        learningAgreement: new FormControl<File | null>(null, {
            validators: [Validators.required]
        }),
        examMappings: new FormArray([
            this.createExamMappingGroup()
        ])
    });
    
    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly applicationService: ApplicationService,
        private readonly hostInstitutionService: HostInstitutionService,
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.authService.getCurrentUser()?.role ?? null;
        this.applicationId = this.route.snapshot.paramMap.get('applicationId');
        this.isEditMode = this.applicationId !== null;

        if (this.isEditMode) {
            this.applicationForm.controls.learningAgreement.clearValidators();
            this.applicationForm.controls.learningAgreement.updateValueAndValidity();
        }

        if (!this.isEditMode && this.currentUserRole !== 'student') {
            this.router.navigate(['/applications']);
            return;
        }

        this.loadHostInstitutions();

        if (this.currentUserRole === 'student') {
            this.loadLecturers();
        }

        if (this.applicationId) {
            this.loadApplication(this.applicationId);
        }
    }

    get examMappings(): FormArray {
        return this.applicationForm.controls.examMappings;
    }

    addExamMapping(): void {
        this.examMappings.push(this.createExamMappingGroup());
    }

    removeExamMapping(index: number): void {
        if (this.examMappings.length === 1) {
            return;
        }

        this.examMappings.removeAt(index);
    }

    onLearningAgreementSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        const control = this.applicationForm.controls.learningAgreement;

        control.setValue(file);
        control.markAsTouched();
        control.updateValueAndValidity();
    }

    onSubmit(): void {
        if (this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            window.alert('Please complete all fields before submitting.');
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const rawValue = this.applicationForm.getRawValue();

        const formData = new FormData();
        formData.append('academicYear', rawValue.academicYear);
        formData.append('expectedMobilityPeriod', rawValue.expectedMobilityPeriod);
        formData.append('hostInstitution', rawValue.hostInstitution);
        formData.append('referentLecturer', rawValue.referentLecturer);
        formData.append('examMappings', JSON.stringify(rawValue.examMappings));

        if (rawValue.learningAgreement) {
            formData.append('learningAgreement', rawValue.learningAgreement);
        }

        if (this.isEditMode && this.applicationId) {
            this.updateApplication(this.applicationId, formData);
            return;
        }

        this.createApplication(formData);
    }

    cancel(): void {
        if (this.isEditMode && this.applicationId) {
            this.router.navigate(['/applications', this.applicationId]);
            return;
        }

        this.router.navigate(['/applications']);
    }

    getFullName(firstName: string, lastName: string): string {
        return `${this.capitalize(firstName)} ${lastName.toUpperCase()}`;
    }

    get learningAgreementControl(): FormControl<File | null> {
        return this.applicationForm.controls.learningAgreement;
    }

    get isAfterMobility(): boolean {
        return this.currentApplicationStatus?.startsWith('am_') ?? false;
    }

    private loadHostInstitutions(): void {
        this.hostInstitutionService.getHostInstitutions().subscribe({
            next: (response) => {
                this.hostInstitutions = response.data;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to load host institutions.';
            }
        });
    }

    private loadLecturers(): void {
        this.userService.getLecturers().subscribe({
            next: (response) => {
                this.lecturers = response.data;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to load lecturers.';
            }
        });
    }

    private loadApplication(applicationId: string): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.applicationService.getApplicationById(applicationId).subscribe({
            next: (response) => {
                const application: Application = response.data;
                this.currentApplicationStatus = application.status;

                if (this.currentUserRole !== 'student') {
                    this.lecturers = [application.referentLecturer];
                }

                if (!this.academicYearOptions.includes(application.academicYear)) {
                    this.academicYearOptions = [
                        application.academicYear,
                        ...this.academicYearOptions
                    ];
                }

                this.applicationForm.patchValue({
                    academicYear: application.academicYear,
                    expectedMobilityPeriod: application.expectedMobilityPeriod,
                    hostInstitution: application.hostInstitution._id,
                    referentLecturer: application.referentLecturer._id
                });

                this.examMappings.clear();

                for (const mapping of application.examMappings) {
                    this.examMappings.push(this.createExamMappingGroup(mapping));
                }

                if (this.examMappings.length === 0) {
                    this.examMappings.push(this.createExamMappingGroup());
                }
                
                if (this.isAfterMobility) {
                    for (const control of this.examMappings.controls) {
                        const mappingGroup = control as FormGroup;
                        const resultGroup = mappingGroup.get('result') as FormGroup | null;

                        if (!resultGroup) {
                            continue;
                        }

                        resultGroup.controls['examDate'].setValidators([
                            Validators.required
                        ]);

                        resultGroup.controls['score'].setValidators([
                            Validators.required,
                            Validators.min(0)
                        ]);

                        resultGroup.controls['examDate'].updateValueAndValidity();
                        resultGroup.controls['score'].updateValueAndValidity();
                    }
                }

                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to load application.';
                this.isLoading = false;
            }
        });
    }

    private createApplication(formData: FormData): void {
        this.applicationService.createApplication(formData).subscribe({
            next: () => {
                this.isSubmitting = false;

                window.alert('Application saved successfully.');
                this.router.navigate(['/applications']);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to save application.';
                this.isSubmitting = false;
            }
        });
    }

    private updateApplication(applicationId: string, formData: FormData): void {
        this.applicationService.updateApplication(applicationId, formData).subscribe({
            next: () => {
                this.isSubmitting = false;

                window.alert('Application updated successfully.');
                this.router.navigate(['/applications', applicationId]);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to update application.';
                this.isSubmitting = false;
            }
        });
    }

    private createExamMappingGroup(mapping?: {
        foreignCourseCode?: string;
        foreignCourseName?: string;
        foreignCourseCredits?: number;
        caFoscariCourseCode?: string;
        caFoscariCourseName?: string;
        caFoscariCourseCredits?: number;
        result?: {
            score?: number | null;
            examDate?: string | null;
        };
    }): FormGroup {
        return new FormGroup({
            foreignCourseCode: new FormControl(mapping?.foreignCourseCode ?? '', {
                nonNullable: true,
                validators: [Validators.required]
            }),
            foreignCourseName: new FormControl(mapping?.foreignCourseName ?? '', {
                nonNullable: true,
                validators: [Validators.required]
            }),
            foreignCourseCredits: new FormControl(mapping?.foreignCourseCredits ?? 0, {
                nonNullable: true,
                validators: [Validators.required, Validators.min(1)]
            }),
            caFoscariCourseCode: new FormControl(mapping?.caFoscariCourseCode ?? '', {
                nonNullable: true,
                validators: [Validators.required]
            }),
            caFoscariCourseName: new FormControl(mapping?.caFoscariCourseName ?? '', {
                nonNullable: true,
                validators: [Validators.required]
            }),
            caFoscariCourseCredits: new FormControl(mapping?.caFoscariCourseCredits ?? 0, {
                nonNullable: true,
                validators: [Validators.required, Validators.min(1)]
            }),
            result: new FormGroup({
                examDate: new FormControl(mapping?.result?.examDate ?? '', {
                    nonNullable: true
                }),
                score: new FormControl<number | null>(mapping?.result?.score ?? null)
            })
        });
    }

    private createAcademicYearOptions(): string[] {
        const currentYear = new Date().getFullYear();

        return Array.from(
            { length: 5 },
            (_, index) => {
                const startYear = currentYear - 1 + index;
                return `${startYear}/${startYear + 1}`;
            }
        );
    }

    private capitalize(value: string): string {
        if (!value) {
            return '';
        }

        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
}